const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, server } = require('../../server');
const Achievement = require('../../src/models/achievement.model');
const User = require('../../src/models/user.model');

let mongoServer;
let adminToken;
let volunteerToken;
let testAdmin;
let testVolunteer;

beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    
    // Create users with different roles
    testAdmin = await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
    });
    
    testVolunteer = await User.create({
        name: 'Volunteer User',
        email: 'volunteer@test.com',
        password: 'password123',
        role: 'volunteer'
    });
    
    adminToken = jwt.sign({ id: testAdmin._id, role: 'admin' }, process.env.JWT_SECRET);
    volunteerToken = jwt.sign({ id: testVolunteer._id, role: 'volunteer' }, process.env.JWT_SECRET);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    server.close(); // Important to prevent open handles and connection errors
});

afterEach(async () => {
    await Achievement.deleteMany({});
});

describe('Achievement API Integration Tests', () => {
    const mockAchievement = {
        activityTitle: 'Massive Ocean Cleanup',
        description: 'Collected 500kg of plastic waste',
        pointsAwarded: 500
    };

    describe('GET /api/achievements/leaderboard', () => {
        it('should return leaderboard data (public)', async () => {
            const res = await request(app).get('/api/achievements/leaderboard');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('POST /api/achievements', () => {
        it('should allow admin to create an achievement', async () => {
            const res = await request(app)
                .post('/api/achievements')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...mockAchievement, volunteerId: testVolunteer._id });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.activityTitle).toBe('Massive Ocean Cleanup');
        });

        it('should deny non-admin users from using admin creation endpoint', async () => {
            const res = await request(app)
                .post('/api/achievements')
                .set('Authorization', `Bearer ${volunteerToken}`)
                .send({ ...mockAchievement, volunteerId: testVolunteer._id });

            expect(res.status).toBe(403);
        });
    });

    describe('GET /api/achievements/my-achievements', () => {
        it('should fetch achievements for the logged-in volunteer', async () => {
            await Achievement.create({ 
                ...mockAchievement, 
                volunteerId: testVolunteer._id 
            });
            
            const res = await request(app)
                .get('/api/achievements/my-achievements')
                .set('Authorization', `Bearer ${volunteerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBe(1);
        });
    });

    describe('GET /api/achievements/stats', () => {
        it('should allow admin to see stats', async () => {
            const res = await request(app)
                .get('/api/achievements/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.totalAchievements).toBeDefined();
        });

        it('should deny volunteer access to stats', async () => {
            const res = await request(app)
                .get('/api/achievements/stats')
                .set('Authorization', `Bearer ${volunteerToken}`);

            expect(res.status).toBe(403);
        });
    });
});
