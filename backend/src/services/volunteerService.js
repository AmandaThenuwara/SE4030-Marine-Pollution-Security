const Volunteer = require('../models/Volunteer');

const ADMIN_FIELDS = [
    '_id', 'name', 'contact', 'role', 'teamSize', 'description', 'skills',
    'availabilityDates', 'profilePicture', 'city', 'postalCode',
    'travelDistance', 'available'
].join(' ');

const ASSIGNMENT_FIELDS = [
    '_id', 'name', 'role', 'teamSize', 'skills', 'city', 'available'
].join(' ');

const SAFE_PROFILE_FIELDS = [
    '_id', 'name', 'role', 'teamSize', 'description', 'skills',
    'profilePicture', 'city', 'available'
].join(' ');

const OWNER_PRIVATE_FIELDS = [
    '_id', 'contact', 'postalCode', 'availabilityDates', 'travelDistance'
].join(' ');

class VolunteerService {
    async getAvailableVolunteers(accessContext) {
        return this.getVolunteers({ available: true }, accessContext);
    }

    async getAllVolunteers(accessContext) {
        return this.getVolunteers({}, accessContext);
    }

    async getVolunteers(filter, { viewerRole, viewerId }) {
        if (viewerRole === 'admin') {
            return Volunteer.find(filter)
                .select(ADMIN_FIELDS)
                .sort({ name: 1 })
                .lean();
        }

        if (viewerRole === 'Cleanup_Task_Manager') {
            return Volunteer.find(filter)
                .select(ASSIGNMENT_FIELDS)
                .sort({ name: 1 })
                .lean();
        }

        const volunteers = await Volunteer.find(filter)
            .select(SAFE_PROFILE_FIELDS)
            .sort({ name: 1 })
            .lean();

        const ownedVolunteers = await Volunteer.find({
            ...filter,
            userId: viewerId
        })
            .select(OWNER_PRIVATE_FIELDS)
            .lean();
        const ownedById = new Map(
            ownedVolunteers.map((volunteer) => [volunteer._id.toString(), volunteer])
        );

        return volunteers.map((volunteer) => {
            const ownedVolunteer = ownedById.get(volunteer._id.toString());
            if (!ownedVolunteer) {
                return { ...volunteer, canManage: false };
            }

            const { _id, ...privateFields } = ownedVolunteer;
            return {
                ...volunteer,
                ...privateFields,
                canManage: true
            };
        });
    }

    async createVolunteer(data) {
        const volunteer = new Volunteer(data);
        return await volunteer.save();
    }

    async updateVolunteer(id, data) {
        return await Volunteer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deleteVolunteer(id) {
        return await Volunteer.findByIdAndDelete(id);
    }
}

module.exports = new VolunteerService();
