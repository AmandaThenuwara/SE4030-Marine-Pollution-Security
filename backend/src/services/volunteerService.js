const Volunteer = require('../models/Volunteer');

class VolunteerService {
    async getAvailableVolunteers() {
        return await Volunteer.find({ available: true }).sort({ name: 1 });
    }

    async getAllVolunteers() {
        return await Volunteer.find().sort({ name: 1 });
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
