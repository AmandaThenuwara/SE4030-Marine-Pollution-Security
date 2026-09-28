const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
jest.mock('../../src/middleware/sanitize.middleware', () => ({
    sanitizeInputs: (req, res, next) => next()
}));
const { app, server } = require('../../server');
const Volunteer = require('../../src/models/Volunteer');
const User = require('../../src/models/user.model');
const jwt = require('jsonwebtoken');

jest.setTimeout(60000);

let mongoServer;
let adminToken;
let managerToken;
let volunteerToken;
let volunteerUser;

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
    process.env.JWT_SECRET = 'volunteer-api-test-secret';
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    server.close();
});

afterEach(async () => {
    await Volunteer.deleteMany({});
    await User.deleteMany({});
});

describe('Volunteer API Integration Tests', () => {
    const mockVolunteer = {
        name: 'John Doe',
        contact: '011-2233445',
        role: 'individual',
        city: 'Colombo',
        skills: ['Cleaning', 'Diving']
    };

    beforeEach(async () => {
        const [admin, manager, volunteer] = await User.create([
            {
                name: 'Test Admin',
                email: 'admin@example.test',
                password: 'Admin123!',
                role: 'admin'
            },
            {
                name: 'Test Manager',
                email: 'manager@example.test',
                password: 'Manager123!',
                role: 'Cleanup_Task_Manager'
            },
            {
                name: 'Test Volunteer',
                email: 'volunteer@example.test',
                password: 'Volunteer123!',
                role: 'volunteer'
            }
        ]);

        volunteerUser = volunteer;
        adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
        managerToken = jwt.sign({ id: manager._id }, process.env.JWT_SECRET);
        volunteerToken = jwt.sign({ id: volunteer._id }, process.env.JWT_SECRET);
    });

    describe('POST /api/volunteers', () => {
        it('should register a new volunteer and return 201', async () => {
            const res = await request(app)
                .post('/api/volunteers')
                .send(mockVolunteer);

            expect(res.status).toBe(201);
            expect(res.body.name).toBe('John Doe');
            expect(res.body.available).toBe(true);
        });

        it('should fail if name is missing', async () => {
            const res = await request(app)
                .post('/api/volunteers')
                .send({ contact: '000' });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/volunteers', () => {
        it('should reject unauthenticated requests', async () => {
            const res = await request(app).get('/api/volunteers');

            expect(res.status).toBe(401);
        });

        it('should return operational fields to an authenticated admin', async () => {
            await Volunteer.create(mockVolunteer);
            const res = await request(app)
                .get('/api/volunteers')
                .set(authHeader(adminToken));

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
            expect(res.body[0]).toEqual(expect.objectContaining({
                name: 'John Doe',
                contact: '011-2233445',
                city: 'Colombo'
            }));
            expect(res.body[0]).not.toHaveProperty('userId');
            expect(res.body[0]).not.toHaveProperty('createdAt');
            expect(res.body[0]).not.toHaveProperty('__v');
        });

        it('should return only safe assignment fields to a cleanup manager and filter by availability', async () => {
            await Volunteer.create([
                {
                    ...mockVolunteer,
                    name: 'Active',
                    available: true,
                    postalCode: '10100',
                    availabilityDates: ['2030-01-01'],
                    travelDistance: 15,
                    userId: volunteerUser._id
                },
                { ...mockVolunteer, name: 'Busy', available: false }
            ]);

            const res = await request(app)
                .get('/api/volunteers?available=true')
                .set(authHeader(managerToken));
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
            expect(res.body[0].name).toBe('Active');
            expect(Object.keys(res.body[0]).sort()).toEqual([
                '_id', 'available', 'city', 'name', 'role', 'skills', 'teamSize'
            ]);
        });

        it('should hide other volunteers private fields and return private fields only for the owner', async () => {
            await Volunteer.create([
                {
                    ...mockVolunteer,
                    name: 'Own Profile',
                    userId: volunteerUser._id,
                    postalCode: '10100',
                    availabilityDates: ['2030-01-01'],
                    travelDistance: 15
                },
                {
                    ...mockVolunteer,
                    name: 'Other Profile',
                    contact: '077-0000000',
                    postalCode: '20200',
                    availabilityDates: ['2030-02-02'],
                    travelDistance: 25
                }
            ]);

            const res = await request(app)
                .get('/api/volunteers')
                .set(authHeader(volunteerToken));

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);

            const ownProfile = res.body.find((volunteer) => volunteer.name === 'Own Profile');
            const otherProfile = res.body.find((volunteer) => volunteer.name === 'Other Profile');

            expect(ownProfile).toEqual(expect.objectContaining({
                canManage: true,
                contact: '011-2233445',
                postalCode: '10100',
                availabilityDates: ['2030-01-01'],
                travelDistance: 15
            }));
            expect(ownProfile).not.toHaveProperty('userId');
            expect(ownProfile).not.toHaveProperty('createdAt');
            expect(ownProfile).not.toHaveProperty('__v');

            expect(otherProfile).toEqual(expect.objectContaining({ canManage: false }));
            expect(otherProfile).not.toHaveProperty('contact');
            expect(otherProfile).not.toHaveProperty('postalCode');
            expect(otherProfile).not.toHaveProperty('availabilityDates');
            expect(otherProfile).not.toHaveProperty('travelDistance');
            expect(otherProfile).not.toHaveProperty('userId');
            expect(otherProfile).not.toHaveProperty('createdAt');
            expect(otherProfile).not.toHaveProperty('__v');
        });
    });

    describe('PUT /api/volunteers/:id', () => {
        it('should update volunteer details', async () => {
            const vol = await Volunteer.create(mockVolunteer);
            const res = await request(app)
                .put(`/api/volunteers/${vol._id}`)
                .set(authHeader(adminToken))
                .send({ city: 'Kandy', name: 'John Updated' });

            expect(res.status).toBe(200);
            expect(res.body.city).toBe('Kandy');
            expect(res.body.name).toBe('John Updated');
        });
    });

    describe('DELETE /api/volunteers/:id', () => {
        it('should remove a volunteer', async () => {
            const vol = await Volunteer.create(mockVolunteer);
            const res = await request(app)
                .delete(`/api/volunteers/${vol._id}`)
                .set(authHeader(adminToken));

            expect(res.status).toBe(200);
            const found = await Volunteer.findById(vol._id);
            expect(found).toBeNull();
        });
    });
});
