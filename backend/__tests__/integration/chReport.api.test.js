const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, server } = require('../../server');
const CHReport = require('../../src/models/chReport.model');
const ChUser = require('../../src/models/chUser.model');

let mongoServer;
let userToken;
let testUser;

beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    
    testUser = await ChUser.create({
        name: 'Test Reporter',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        phone: '1234567890'
    });
    
    // The app expects 'id' in the payload, not 'userId'
    userToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    server.close();
});

afterEach(async () => {
    await CHReport.deleteMany({});
});

describe('Community Report API Integration Tests', () => {
    const mockReport = {
        title: 'Oil Spill Detected',
        location: {
            address: 'Negombo Coast',
            lat: 7.2089,
            lng: 79.8312
        },
        severity: 'high',
        categories: ['Oil Leakage'],
        photoUrl: '/uploads/test.jpg',
        finalDescription: 'Observed a large oil patch near the shore.'
    };

    describe('POST /api/ch/reports', () => {
        it('should create a new community report when authenticated', async () => {
            const res = await request(app)
                .post('/api/ch/reports')
                .set('Authorization', `Bearer ${userToken}`)
                .field('title', mockReport.title)
                .field('categories[]', 'Oil Leakage')
                .field('severity', mockReport.severity)
                .field('lat', mockReport.location.lat)
                .field('lng', mockReport.location.lng)
                .field('address', mockReport.location.address)
                .attach('photo', Buffer.from('fake image'), 'test.jpg');

            expect(res.status).toBe(201);
            expect(res.body.report.title).toBe('Oil Spill Detected');
        });
    });

    describe('GET /api/ch/reports', () => {
        it('should fetch my reports', async () => {
            await CHReport.create({ 
                ...mockReport, 
                ownerId: testUser._id,
                photoUrl: '/uploads/manual.jpg' // matches schema
            });
            const res = await request(app)
                .get('/api/ch/reports')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.reports.length).toBe(1);
        });
    });

    describe('POST /api/ch/reports/:id/publish', () => {
        it('should publish a draft report', async () => {
            const report = await CHReport.create({ 
                ...mockReport, 
                ownerId: testUser._id,
                finalDescription: 'Validated content' 
            });
            const res = await request(app)
                .post(`/api/ch/reports/${report._id}/publish`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.report.isPublished).toBe(true);
        });
    });
});
