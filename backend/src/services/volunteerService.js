const Volunteer = require('../models/Volunteer');

class VolunteerService {
    async getAvailableVolunteers(options = {}) {
        const limit = Math.min(Math.max(parseInt(options.limit) || 100, 1), 100);
        const skip = Math.max(parseInt(options.skip) || 0, 0);
        return await Volunteer.find({ available: true }).sort({ name: 1 }).skip(skip).limit(limit);
    }

    async getAllVolunteers(options = {}) {
        const limit = Math.min(Math.max(parseInt(options.limit) || 100, 1), 100);
        const skip = Math.max(parseInt(options.skip) || 0, 0);
        return await Volunteer.find().sort({ name: 1 }).skip(skip).limit(limit);
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
