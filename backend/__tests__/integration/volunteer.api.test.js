const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, server } = require('../../server');
const Volunteer = require('../../src/models/Volunteer');

let mongoServer;

beforeAll(async () => {
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
});

describe('Volunteer API Integration Tests', () => {
    const mockVolunteer = {
        name: 'John Doe',
        contact: '011-2233445',
        role: 'individual',
        city: 'Colombo',
        skills: ['Cleaning', 'Diving']
    };

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
        it('should get all volunteers', async () => {
            await Volunteer.create(mockVolunteer);
            const res = await request(app).get('/api/volunteers');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
        });

        it('should filter by availability', async () => {
            await Volunteer.create([
                { ...mockVolunteer, name: 'Active', available: true },
                { ...mockVolunteer, name: 'Busy', available: false }
            ]);

            const res = await request(app).get('/api/volunteers?available=true');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].name).toBe('Active');
        });
    });

    describe('PUT /api/volunteers/:id', () => {
        it('should update volunteer details', async () => {
            const vol = await Volunteer.create(mockVolunteer);
            const res = await request(app)
                .put(`/api/volunteers/${vol._id}`)
                .send({ city: 'Kandy', name: 'John Updated' });

            expect(res.status).toBe(200);
            expect(res.body.city).toBe('Kandy');
            expect(res.body.name).toBe('John Updated');
        });
    });

    describe('DELETE /api/volunteers/:id', () => {
        it('should remove a volunteer', async () => {
            const vol = await Volunteer.create(mockVolunteer);
            const res = await request(app).delete(`/api/volunteers/${vol._id}`);

            expect(res.status).toBe(200);
            const found = await Volunteer.findById(vol._id);
            expect(found).toBeNull();
        });
    });
});
