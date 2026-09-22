const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const AchievementService = require('../src/services/achievement.service');
const Achievement = require('../src/models/achievement.model');
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
    await Achievement.deleteMany({});
    await User.deleteMany({});
});

describe('Achievement Service – Integration Tests', () => {
    let volunteer;

    beforeEach(async () => {
        volunteer = await User.create({
            name: 'Test Volunteer',
            email: 'volunteer@test.com',
            password: 'password123',
            role: 'volunteer'
        });
    });

    describe('createAchievement', () => {
        test('should create an achievement and recalculate total points', async () => {
            const result = await AchievementService.createAchievement({
                volunteerId: volunteer._id,
                activityTitle: 'Cleanup', description: 'Beach cleanup at Colombo shore',
                pointsAwarded: 200
            });

            expect(result).toBeDefined();
            expect(result.description).toBe('Beach cleanup at Colombo shore');
            expect(result.pointsAwarded).toBe(200);
            expect(result.volunteerId.name).toBe('Test Volunteer');
        });

        test('should assign Bronze badge for < 500 points', async () => {
            const result = await AchievementService.createAchievement({
                volunteerId: volunteer._id,
                activityTitle: 'Cleanup', description: 'Small task',
                pointsAwarded: 100
            });

            expect(result.badgeType).toBe('Bronze');
        });

        test('should assign Silver badge for 500+ points', async () => {
            const result = await AchievementService.createAchievement({
                volunteerId: volunteer._id,
                activityTitle: 'Cleanup', description: 'Major cleanup',
                pointsAwarded: 600
            });

            expect(result.badgeType).toBe('Silver');
        });

        test('should assign Gold badge for 1000+ points', async () => {
            const result = await AchievementService.createAchievement({
                volunteerId: volunteer._id,
                activityTitle: 'Cleanup', description: 'Outstanding effort',
                pointsAwarded: 1500
            });

            expect(result.badgeType).toBe('Gold');
        });
    });

    describe('getAllAchievements', () => {
        test('should return paginated achievements', async () => {
            // Create multiple achievements
            for (let i = 0; i < 15; i++) {
                await Achievement.create({
                    volunteerId: volunteer._id,
                    activityTitle: 'Cleanup', description: `Task ${i + 1}`,
                    pointsAwarded: (i + 1) * 50
                });
            }

            const result = await AchievementService.getAllAchievements(
                {},
                { page: 1, limit: 10 }
            );

            expect(result.achievements.length).toBe(10);
            expect(result.pagination.total).toBe(15);
            expect(result.pagination.pages).toBe(2);
        });

        test('should filter by badgeType', async () => {
            await Achievement.create([
                { volunteerId: volunteer._id, activityTitle: 'Cleanup', description: 'Low task', pointsAwarded: 100 },
                { volunteerId: volunteer._id, activityTitle: 'Cleanup', description: 'High task', pointsAwarded: 1500 }
            ]);

            const result = await AchievementService.getAllAchievements(
                { badgeType: 'Gold' },
                { page: 1, limit: 10 }
            );

            expect(result.achievements.every(a => a.badgeType === 'Gold')).toBe(true);
        });

        test('should filter by level', async () => {
            await Achievement.create([
                { volunteerId: volunteer._id, activityTitle: 'Cleanup', description: 'Beginner task', pointsAwarded: 50 },
                { volunteerId: volunteer._id, activityTitle: 'Cleanup', description: 'Advanced task', pointsAwarded: 800 }
            ]);

            const result = await AchievementService.getAllAchievements(
                { level: 'Advanced' },
                { page: 1, limit: 10 }
            );

            expect(result.achievements.every(a => a.level === 'Advanced')).toBe(true);
        });
    });

    describe('getAchievementById', () => {
        test('should return achievement by ID', async () => {
            const created = await Achievement.create({
                volunteerId: volunteer._id,
                activityTitle: 'Cleanup', description: 'Find me!',
                pointsAwarded: 300
            });

            const found = await AchievementService.getAchievementById(created._id);
            expect(found.description).toBe('Find me!');
        });

        test('should throw if achievement ID does not exist', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            await expect(AchievementService.getAchievementById(fakeId)).rejects.toThrow();
        });
    });

    describe('updateAchievement', () => {
        test('should update description and recalculate', async () => {
            const created = await Achievement.create({
                volunteerId: volunteer._id,
                activityTitle: 'Cleanup', description: 'Original',
                pointsAwarded: 100
            });

            const updated = await AchievementService.updateAchievement(created._id, {
                activityTitle: 'Cleanup', description: 'Updated description'
            });

            expect(updated.description).toBe('Updated description');
        });

        test('should update points and change badge accordingly', async () => {
            const created = await Achievement.create({
                volunteerId: volunteer._id,
                activityTitle: 'Cleanup', description: 'Test',
                pointsAwarded: 100
            });

            expect(created.badgeType).toBe('Bronze');

            const updated = await AchievementService.updateAchievement(created._id, {
                pointsAwarded: 1200
            });

            expect(updated.badgeType).toBe('Gold');
        });

        test('should throw if achievement does not exist', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            await expect(
                AchievementService.updateAchievement(fakeId, { activityTitle: 'Cleanup', description: 'Test' })
            ).rejects.toThrow();
        });
    });

    describe('deleteAchievement', () => {
        test('should permanently delete achievement', async () => {
            const created = await Achievement.create({
                volunteerId: volunteer._id,
                activityTitle: 'Cleanup', description: 'Delete me',
                pointsAwarded: 100
            });

            const result = await AchievementService.deleteAchievement(created._id);
            expect(result.message).toBe('Achievement permanently deleted');

            const found = await Achievement.findById(created._id);
            expect(found).toBeNull();
        });

        test('should throw if achievement already deleted', async () => {
            const created = await Achievement.create({
                volunteerId: volunteer._id,
                activityTitle: 'Cleanup', description: 'Delete me',
                pointsAwarded: 100
            });

            await AchievementService.deleteAchievement(created._id);
            await expect(AchievementService.deleteAchievement(created._id)).rejects.toThrow();
        });
    });

    describe('getAchievementsByVolunteer', () => {
        test('should return achievements and stats for a specific volunteer', async () => {
            await Achievement.create([
                { volunteerId: volunteer._id, activityTitle: 'Cleanup', description: 'Task 1', pointsAwarded: 100 },
                { volunteerId: volunteer._id, activityTitle: 'Cleanup', description: 'Task 2', pointsAwarded: 200 }
            ]);

            const result = await AchievementService.getAchievementsByVolunteer(
                volunteer._id, { page: 1, limit: 10 }
            );

            expect(result.achievements.length).toBe(2);
            expect(result.volunteerStats).toBeDefined();
            expect(result.volunteerStats.totalPoints).toBe(300);
        });
    });

    describe('getAchievementStats', () => {
        test('should return overall statistics', async () => {
            await Achievement.create([
                { volunteerId: volunteer._id, activityTitle: 'Cleanup', description: 'Task 1', pointsAwarded: 100 },
                { volunteerId: volunteer._id, activityTitle: 'Cleanup', description: 'Task 2', pointsAwarded: 600 },
                { volunteerId: volunteer._id, activityTitle: 'Cleanup', description: 'Task 3', pointsAwarded: 1500 }
            ]);

            const stats = await AchievementService.getAchievementStats();

            expect(stats.totalAchievements).toBe(3);
            expect(stats.totalPointsAwarded).toBe(2200);
            expect(stats.bronzeBadges).toBe(1);
            expect(stats.silverBadges).toBe(1);
            expect(stats.goldBadges).toBe(1);
        });
    });
});
