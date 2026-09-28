const express = require('express');
const request = require('supertest');

jest.mock('../../src/controllers/volunteerController', () => ({
    getVolunteers: jest.fn((req, res) => res.json([])),
    createVolunteer: jest.fn(),
    updateVolunteer: jest.fn(),
    deleteVolunteer: jest.fn()
}));

const volunteerRoutes = require('../../src/routes/volunteerRoutes');

describe('Volunteer list route authentication', () => {
    it('returns 401 when GET /api/volunteers has no bearer token', async () => {
        const app = express();
        app.use('/api/volunteers', volunteerRoutes);

        const response = await request(app).get('/api/volunteers');

        expect(response.status).toBe(401);
        expect(response.body).toEqual(expect.objectContaining({ success: false }));
    });
});
