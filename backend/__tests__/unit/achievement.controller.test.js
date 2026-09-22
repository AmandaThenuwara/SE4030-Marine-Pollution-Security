const achievementController = require('../../src/controllers/achievement.controller');
const achievementService = require('../../src/services/achievement.service');
const mongoose = require('mongoose');

jest.mock('../../src/services/achievement.service');

describe('AchievementController Unit Tests', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        // Suppress console.error in tests
        jest.spyOn(console, 'error').mockImplementation(() => {});

        jest.clearAllMocks();
        mockReq = {
            query: {},
            params: {},
            body: {},
            user: { id: new mongoose.Types.ObjectId().toString() }
        };
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('createAchievement', () => {
        it('should return 400 if required fields are missing', async () => {
            mockReq.body = {};
            await achievementController.createAchievement(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('should create achievement and return 201', async () => {
            const volId = new mongoose.Types.ObjectId().toString();
            const payload = {
                volunteerId: volId,
                activityTitle: 'Cleanup',
                description: 'Beach cleanup',
                pointsAwarded: 100
            };
            mockReq.body = payload;
            achievementService.createAchievement.mockResolvedValue({ _id: 'ach123', ...payload });

            await achievementController.createAchievement(mockReq, mockRes);

            expect(achievementService.createAchievement).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });
    });

    describe('getMyAchievements', () => {
        it('should return 401 if user not authenticated', async () => {
            mockReq.user = null;
            await achievementController.getMyAchievements(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        it('should return achievements for the logged-in user', async () => {
            const result = { achievements: [], volunteerStats: {}, pagination: {} };
            achievementService.getAchievementsByVolunteer.mockResolvedValue(result);

            await achievementController.getMyAchievements(mockReq, mockRes);

            expect(achievementService.getAchievementsByVolunteer).toHaveBeenCalledWith(mockReq.user.id, expect.any(Object));
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ data: result.achievements }));
        });
    });

    describe('updateAchievement', () => {
        it('should update an achievement and return 200', async () => {
            const achId = new mongoose.Types.ObjectId().toString();
            const updateData = { activityTitle: 'Updated Title' };
            mockReq.params.id = achId;
            mockReq.body = updateData;
            
            achievementService.updateAchievement.mockResolvedValue({ _id: achId, ...updateData });

            await achievementController.updateAchievement(mockReq, mockRes);

            expect(achievementService.updateAchievement).toHaveBeenCalledWith(achId, expect.any(Object));
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 if ID is invalid', async () => {
            mockReq.params.id = 'invalid-id';
            await achievementController.updateAchievement(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });

    describe('deleteAchievement', () => {
        it('should delete an achievement and return 200', async () => {
            const achId = new mongoose.Types.ObjectId().toString();
            mockReq.params.id = achId;
            achievementService.deleteAchievement.mockResolvedValue({ message: 'Deleted' });

            await achievementController.deleteAchievement(mockReq, mockRes);

            expect(achievementService.deleteAchievement).toHaveBeenCalledWith(achId);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 if ID is invalid', async () => {
            mockReq.params.id = 'invalid-id';
            await achievementController.deleteAchievement(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });
});
