const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Achievement = require('../src/models/achievement.model');

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
    await Achievement.deleteMany({});
});

describe('Achievement Model', () => {
    const validAchievement = {
        volunteerId: new mongoose.Types.ObjectId(),
        activityTitle: 'Cleanup', description: 'Beach cleanup at Marine Drive',
        pointsAwarded: 100
    };

    describe('Creation', () => {
        test('should create an achievement with valid data', async () => {
            const achievement = new Achievement(validAchievement);
            const saved = await achievement.save();

            expect(saved._id).toBeDefined();
            expect(saved.description).toBe(validAchievement.description);
            expect(saved.pointsAwarded).toBe(100);
            expect(saved.isActive).toBe(true);
        });

        test('should set default level to Beginner for low points', async () => {
            const achievement = new Achievement({ ...validAchievement, pointsAwarded: 50 });
            const saved = await achievement.save();
            expect(saved.level).toBe('Beginner');
        });

        test('should set level to Intermediate for 250+ points', async () => {
            const achievement = new Achievement({ ...validAchievement, pointsAwarded: 300 });
            const saved = await achievement.save();
            expect(saved.level).toBe('Intermediate');
        });

        test('should set level to Advanced for 750+ points', async () => {
            const achievement = new Achievement({ ...validAchievement, pointsAwarded: 800 });
            const saved = await achievement.save();
            expect(saved.level).toBe('Advanced');
        });

        test('should set badge to Bronze for low points', async () => {
            const achievement = new Achievement({ ...validAchievement, pointsAwarded: 100 });
            const saved = await achievement.save();
            expect(saved.badgeType).toBe('Bronze');
        });

        test('should set badge to Silver for 500+ points', async () => {
            const achievement = new Achievement({ ...validAchievement, pointsAwarded: 600 });
            const saved = await achievement.save();
            expect(saved.badgeType).toBe('Silver');
        });

        test('should set badge to Gold for 1000+ points', async () => {
            const achievement = new Achievement({ ...validAchievement, pointsAwarded: 1500 });
            const saved = await achievement.save();
            expect(saved.badgeType).toBe('Gold');
        });
    });

    describe('Validation', () => {
        test('should fail without volunteerId', async () => {
            const achievement = new Achievement({
                activityTitle: 'Cleanup', description: 'Test',
                pointsAwarded: 100
            });
            await expect(achievement.save()).rejects.toThrow();
        });

        test('should fail without description', async () => {
            const achievement = new Achievement({
                volunteerId: new mongoose.Types.ObjectId(),
                pointsAwarded: 100
            });
            await expect(achievement.save()).rejects.toThrow();
        });

        test('should fail without pointsAwarded', async () => {
            const achievement = new Achievement({
                volunteerId: new mongoose.Types.ObjectId(),
                activityTitle: 'Cleanup', description: 'Test'
            });
            await expect(achievement.save()).rejects.toThrow();
        });

        test('should fail with negative points', async () => {
            const achievement = new Achievement({
                ...validAchievement,
                pointsAwarded: -10
            });
            await expect(achievement.save()).rejects.toThrow();
        });

        test('should fail with points exceeding 10000', async () => {
            const achievement = new Achievement({
                ...validAchievement,
                pointsAwarded: 15000
            });
            await expect(achievement.save()).rejects.toThrow();
        });

        test('should fail with description exceeding 500 characters', async () => {
            const achievement = new Achievement({
                ...validAchievement,
                activityTitle: 'Cleanup', description: 'x'.repeat(501)
            });
            await expect(achievement.save()).rejects.toThrow();
        });
    });

    describe('Static Methods', () => {
        test('should recalculate total points for a volunteer', async () => {
            const volunteerId = new mongoose.Types.ObjectId();

            await Achievement.create([
                { volunteerId, activityTitle: 'Cleanup', description: 'Task 1', pointsAwarded: 100 },
                { volunteerId, activityTitle: 'Cleanup', description: 'Task 2', pointsAwarded: 200 },
                { volunteerId, activityTitle: 'Cleanup', description: 'Task 3', pointsAwarded: 300 }
            ]);

            const totalPoints = await Achievement.recalculateTotalPoints(volunteerId);
            expect(totalPoints).toBe(600);
        });

        test('should have correct badge thresholds', () => {
            expect(Achievement.badgeThresholds.Gold).toBe(1000);
            expect(Achievement.badgeThresholds.Silver).toBe(500);
            expect(Achievement.badgeThresholds.Bronze).toBe(0);
        });

        test('should have correct level thresholds', () => {
            expect(Achievement.levelThresholds.Advanced).toBe(750);
            expect(Achievement.levelThresholds.Intermediate).toBe(250);
            expect(Achievement.levelThresholds.Beginner).toBe(0);
        });
    });

    describe('Update', () => {
        test('should update description', async () => {
            const achievement = await Achievement.create(validAchievement);
            achievement.description = 'Updated description';
            const updated = await achievement.save();
            expect(updated.description).toBe('Updated description');
        });

        test('should recalculate badge when points change', async () => {
            const achievement = await Achievement.create({ ...validAchievement, pointsAwarded: 100 });
            expect(achievement.badgeType).toBe('Bronze');

            achievement.pointsAwarded = 1000;
            const updated = await achievement.save();
            expect(updated.badgeType).toBe('Gold');
        });
    });

    describe('Soft Delete', () => {
        test('should soft delete by setting isActive to false', async () => {
            const achievement = await Achievement.create(validAchievement);
            achievement.isActive = false;
            const updated = await achievement.save();
            expect(updated.isActive).toBe(false);
        });
    });
});
