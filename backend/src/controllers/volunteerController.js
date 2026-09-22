const volunteerService = require('../services/volunteerService');

class VolunteerController {
    async getVolunteers(req, res) {
        try {
            const volunteers = req.query.available === 'true'
                ? await volunteerService.getAvailableVolunteers()
                : await volunteerService.getAllVolunteers();
            res.json(volunteers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createVolunteer(req, res) {
        try {
            const volunteer = await volunteerService.createVolunteer(req.body);
            res.status(201).json(volunteer);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateVolunteer(req, res) {
        try {
            const volunteer = await volunteerService.updateVolunteer(req.params.id, req.body);
            if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });
            res.json(volunteer);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteVolunteer(req, res) {
        try {
            const volunteer = await volunteerService.deleteVolunteer(req.params.id);
            if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });
            res.json({ message: 'Volunteer deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new VolunteerController();
