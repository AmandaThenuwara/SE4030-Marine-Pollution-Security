const Volunteer = require('../../src/models/Volunteer');
const volunteerService = require('../../src/services/volunteerService');

jest.mock('../../src/models/Volunteer');

const queryReturning = (value) => ({
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(value)
});

describe('VolunteerService role-aware list projections', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns only assignment fields to cleanup managers and preserves available filtering', async () => {
        const query = queryReturning([{ _id: 'vol1', name: 'Available Volunteer' }]);
        Volunteer.find.mockReturnValue(query);

        const result = await volunteerService.getAvailableVolunteers({
            viewerRole: 'Cleanup_Task_Manager',
            viewerId: 'manager1'
        });

        expect(Volunteer.find).toHaveBeenCalledWith({ available: true });
        expect(query.select).toHaveBeenCalledWith(
            '_id name role teamSize skills city available'
        );
        expect(result).toEqual([{ _id: 'vol1', name: 'Available Volunteer' }]);
    });

    it('uses the admin operational projection without userId or __v', async () => {
        const query = queryReturning([]);
        Volunteer.find.mockReturnValue(query);

        await volunteerService.getAllVolunteers({ viewerRole: 'admin', viewerId: 'admin1' });

        const projection = query.select.mock.calls[0][0];
        expect(projection).toContain('contact');
        expect(projection).toContain('availabilityDates');
        expect(projection).not.toContain('userId');
        expect(projection).not.toContain('__v');
    });

    it('adds owner-only private fields and canManage without exposing userId', async () => {
        const publicQuery = queryReturning([
            { _id: { toString: () => 'own' }, name: 'Own' },
            { _id: { toString: () => 'other' }, name: 'Other' }
        ]);
        const ownerQuery = queryReturning([
            {
                _id: { toString: () => 'own' },
                contact: 'private-contact',
                postalCode: 'private-postal-code'
            }
        ]);
        Volunteer.find
            .mockReturnValueOnce(publicQuery)
            .mockReturnValueOnce(ownerQuery);

        const result = await volunteerService.getAllVolunteers({
            viewerRole: 'volunteer',
            viewerId: 'user1'
        });

        expect(Volunteer.find).toHaveBeenNthCalledWith(2, { userId: 'user1' });
        expect(result[0]).toEqual(expect.objectContaining({
            name: 'Own',
            contact: 'private-contact',
            postalCode: 'private-postal-code',
            canManage: true
        }));
        expect(result[0]).not.toHaveProperty('userId');
        expect(result[1]).toEqual(expect.objectContaining({
            name: 'Other',
            canManage: false
        }));
        expect(result[1]).not.toHaveProperty('contact');
    });
});
