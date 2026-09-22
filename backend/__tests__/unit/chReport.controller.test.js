const chReportController = require('../../src/controllers/chReport.controller');
const ChReport = require('../../src/models/chReport.model');
const reportAiService = require('../../src/services/reportAi.service');

jest.mock('../../src/models/chReport.model');
jest.mock('../../src/services/reportAi.service');

describe('chReportController Unit Tests', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            query: {},
            params: {},
            body: {},
            user: { id: 'user123' },
            protocol: 'http',
            get: jest.fn().mockReturnValue('localhost')
        };
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
    });

    describe('listMyReports', () => {
        it('should return reports for the current user', async () => {
            const reports = [{ _id: 'r1', title: 'Report 1' }];
            ChReport.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(reports)
            });

            await chReportController.listMyReports(mockReq, mockRes);

            expect(ChReport.find).toHaveBeenCalledWith({ ownerId: 'user123' });
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe('getMyReport', () => {
        it('should return a specific report if it belongs to the user', async () => {
            const report = { _id: 'r1', ownerId: 'user123' };
            ChReport.findOne.mockResolvedValue(report);
            mockReq.params.id = 'r1';

            await chReportController.getMyReport(mockReq, mockRes);

            expect(ChReport.findOne).toHaveBeenCalledWith({ _id: 'r1', ownerId: 'user123' });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, report });
        });

        it('should return 404 if report not found', async () => {
            ChReport.findOne.mockResolvedValue(null);
            await chReportController.getMyReport(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteMyReport', () => {
        it('should delete report and return 200', async () => {
            ChReport.findOneAndDelete.mockResolvedValue({ _id: 'r1' });
            mockReq.params.id = 'r1';

            await chReportController.deleteMyReport(mockReq, mockRes);

            expect(ChReport.findOneAndDelete).toHaveBeenCalledWith({ _id: 'r1', ownerId: 'user123' });
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe('unpublishMyReport', () => {
        it('should unpublish a report', async () => {
            const mockReport = {
                _id: 'r1',
                isPublished: true,
                save: jest.fn().mockResolvedValue(true)
            };
            ChReport.findOne.mockResolvedValue(mockReport);
            mockReq.params.id = 'r1';

            await chReportController.unpublishMyReport(mockReq, mockRes);

            expect(mockReport.isPublished).toBe(false);
            expect(mockReport.save).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    describe('generateAiForMyReport', () => {
        it('should generate AI description', async () => {
            const mockReport = {
                _id: 'r1',
                photoUrl: 'http://test.com/photo.jpg',
                aiStatus: 'pending',
                save: jest.fn().mockResolvedValue(true)
            };
            ChReport.findOne.mockResolvedValue(mockReport);
            reportAiService.generatePollutionDescriptionFromReportPhoto.mockResolvedValue('AI Gen Text');
            mockReq.params.id = 'r1';

            await chReportController.generateAiForMyReport(mockReq, mockRes);

            expect(mockReport.aiDescription).toBe('AI Gen Text');
            expect(mockReport.aiStatus).toBe('done');
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
});
