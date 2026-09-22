const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/user.model');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
});

describe('User Model', () => {
    const validUser = {
        name: 'Test Volunteer',
        email: 'test@marine.com',
        password: 'password123',
        role: 'volunteer'
    };

    describe('Creation', () => {
        test('should create a user with valid data', async () => {
            const user = new User(validUser);
            const saved = await user.save();

            expect(saved._id).toBeDefined();
            expect(saved.name).toBe(validUser.name);
            expect(saved.email).toBe(validUser.email);
            expect(saved.role).toBe('volunteer');
            expect(saved.isActive).toBe(true);
        });

        test('should hash password before saving', async () => {
            const user = new User(validUser);
            const saved = await user.save();

            // Need to explicitly select password since it's hidden by default
            const fullUser = await User.findById(saved._id).select('+password');
            expect(fullUser.password).not.toBe(validUser.password);
            expect(fullUser.password.length).toBeGreaterThan(10);
        });

        test('should default role to volunteer', async () => {
            const user = new User({
                name: 'Vol User',
                email: 'vol@marine.com',
                password: 'password123'
            });
            const saved = await user.save();
            expect(saved.role).toBe('volunteer');
        });
    });

    describe('Validation', () => {
        test('should fail without name', async () => {
            const user = new User({
                email: 'test@marine.com',
                password: 'password123'
            });
            await expect(user.save()).rejects.toThrow();
        });

        test('should fail without email', async () => {
            const user = new User({
                name: 'Test',
                password: 'password123'
            });
            await expect(user.save()).rejects.toThrow();
        });

        test('should fail without password', async () => {
            const user = new User({
                name: 'Test',
                email: 'test@marine.com'
            });
            await expect(user.save()).rejects.toThrow();
        });

        test('should fail with invalid email', async () => {
            const user = new User({
                name: 'Test',
                email: 'invalid-email',
                password: 'password123'
            });
            await expect(user.save()).rejects.toThrow();
        });

        test('should fail with duplicate email', async () => {
            await User.create(validUser);
            const duplicate = new User(validUser);
            await expect(duplicate.save()).rejects.toThrow();
        });

        test('should fail with password shorter than 6 characters', async () => {
            const user = new User({
                name: 'Test',
                email: 'test2@marine.com',
                password: '12345'
            });
            await expect(user.save()).rejects.toThrow();
        });
    });

    describe('Methods', () => {
        test('comparePassword should return true for correct password', async () => {
            const user = await User.create(validUser);
            const fullUser = await User.findById(user._id).select('+password');
            const isMatch = await fullUser.comparePassword('password123');
            expect(isMatch).toBe(true);
        });

        test('comparePassword should return false for incorrect password', async () => {
            const user = await User.create(validUser);
            const fullUser = await User.findById(user._id).select('+password');
            const isMatch = await fullUser.comparePassword('wrongpassword');
            expect(isMatch).toBe(false);
        });

        test('toJSON should not include password', async () => {
            const user = await User.create(validUser);
            const json = user.toJSON();
            expect(json.password).toBeUndefined();
        });
    });
});
