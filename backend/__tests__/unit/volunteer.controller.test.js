const volunteerController = require('../../src/controllers/volunteerController');
const volunteerService = require('../../src/services/volunteerService');

jest.mock('../../src/services/volunteerService');

describe('VolunteerController Unit Tests', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        mockReq = {
            query: {},
            params: {},
            body: {}
        };
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
    });

    describe('getVolunteers', () => {
        it('should return all volunteers when available is not true', async () => {
            const volunteers = [{ id: '1', name: 'Vol 1' }];
            volunteerService.getAllVolunteers.mockResolvedValue(volunteers);

            await volunteerController.getVolunteers(mockReq, mockRes);

            expect(volunteerService.getAllVolunteers).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith(volunteers);
        });

        it('should return only available volunteers when available is true', async () => {
            const volunteers = [{ id: '2', name: 'Vol 2' }];
            mockReq.query.available = 'true';
            volunteerService.getAvailableVolunteers.mockResolvedValue(volunteers);

            await volunteerController.getVolunteers(mockReq, mockRes);

            expect(volunteerService.getAvailableVolunteers).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith(volunteers);
        });
    });

    describe('createVolunteer', () => {
        it('should create a volunteer and return 201', async () => {
            const newVol = { name: 'New Vol' };
            mockReq.body = newVol;
            volunteerService.createVolunteer.mockResolvedValue({ id: '3', ...newVol });

            await volunteerController.createVolunteer(mockReq, mockRes);

            expect(volunteerService.createVolunteer).toHaveBeenCalledWith(newVol);
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });
    });

    describe('updateVolunteer', () => {
        it('should update a volunteer and return 200', async () => {
            const volId = 'vol123';
            const updateData = { name: 'Updated Name' };
            mockReq.params.id = volId;
            mockReq.body = updateData;
            volunteerService.updateVolunteer.mockResolvedValue({ id: volId, ...updateData });

            await volunteerController.updateVolunteer(mockReq, mockRes);

            expect(volunteerService.updateVolunteer).toHaveBeenCalledWith(volId, updateData);
            expect(mockRes.json).toHaveBeenCalled();
        });

        it('should return 404 if volunteer not found', async () => {
            volunteerService.updateVolunteer.mockResolvedValue(null);
            await volunteerController.updateVolunteer(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteVolunteer', () => {
        it('should delete a volunteer and return 200', async () => {
            const volId = 'vol123';
            mockReq.params.id = volId;
            volunteerService.deleteVolunteer.mockResolvedValue({ id: volId });

            await volunteerController.deleteVolunteer(mockReq, mockRes);

            expect(volunteerService.deleteVolunteer).toHaveBeenCalledWith(volId);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Volunteer deleted successfully' });
        });

        it('should return 404 if volunteer not found', async () => {
            volunteerService.deleteVolunteer.mockResolvedValue(null);
            await volunteerController.deleteVolunteer(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });
});
