const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app, server } = require('../../server');
const Task = require('../../src/models/Task');

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
    await Task.deleteMany({});
});

describe('Task API Integration Tests', () => {
    const mockTask = {
        location: {
            address: 'Colombo Beach',
            coordinates: { lat: 6.9271, lng: 79.8612 }
        },
        description: 'Large plastic waste collection needed',
        wasteType: 'Plastic',
        priority: 'High'
    };

    describe('POST /api/tasks', () => {
        it('should create a new task and return 201', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .send(mockTask);

            expect(res.status).toBe(201);
            expect(res.body.location.address).toBe('Colombo Beach');
            expect(res.body.status).toBe('Pending');
        });

        it('should return 400 when required fields are missing', async () => {
            const res = await request(app)
                .post('/api/tasks')
                .send({ description: 'Incomplete' });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/tasks', () => {
        it('should fetch all tasks', async () => {
            await Task.create(mockTask);
            const res = await request(app).get('/api/tasks');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
        });

        it('should filter tasks by status', async () => {
            await Task.create([
                { ...mockTask, status: 'Completed' },
                { ...mockTask, status: 'Pending' }
            ]);

            const res = await request(app).get('/api/tasks?status=Completed');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].status).toBe('Completed');
        });
    });

    describe('PATCH /api/tasks/:id/assign', () => {
        it('should successfully assign a task and update status', async () => {
            const task = await Task.create(mockTask);
            const res = await request(app)
                .patch(`/api/tasks/${task._id}/assign`)
                .send({ volunteerId: 'Volunteer_Unit_101' });

            expect(res.status).toBe(200);
            expect(res.body.assignedTo).toBe('Volunteer_Unit_101');
            expect(res.body.status).toBe('Assigned');
        });

        it('should return 404 for non-existent task', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .patch(`/api/tasks/${fakeId}/assign`)
                .send({ volunteerId: 'Test' });

            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /api/tasks/:id/complete', () => {
        it('should mark task as completed', async () => {
            const task = await Task.create({ ...mockTask, status: 'In Progress' });
            const res = await request(app).patch(`/api/tasks/${task._id}/complete`);

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('Completed');
        });
    });

    describe('DELETE /api/tasks/:id', () => {
        it('should soft delete the task', async () => {
            const task = await Task.create(mockTask);
            const res = await request(app).delete(`/api/tasks/${task._id}`);

            expect(res.status).toBe(200);
            const deleted = await Task.findById(task._id);
            expect(deleted.isDeleted).toBe(true);
        });
    });
});
