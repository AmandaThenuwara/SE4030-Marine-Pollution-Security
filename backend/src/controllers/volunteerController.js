const volunteerService = require('../services/volunteerService');

class VolunteerController {
    async getVolunteers(req, res) {
        try {
            const page = Math.max(parseInt(req.query.page) || 1, 1);
            const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 100);
            const skip = req.query.skip !== undefined ? Math.max(parseInt(req.query.skip) || 0, 0) : (page - 1) * limit;

            const options = { limit, skip };
            const volunteers = req.query.available === 'true'
                ? await volunteerService.getAvailableVolunteers(options)
                : await volunteerService.getAllVolunteers(options);
            res.json(volunteers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createVolunteer(req, res) {
        try {
            const {
                name, contact, role, teamSize, description,
                skills, availabilityDates, profilePicture, city,
                postalCode, travelDistance, available
            } = req.body;

            if (!name || typeof name !== 'string' || !contact || typeof contact !== 'string') {
                return res.status(400).json({ message: 'Name and contact are required and must be valid strings' });
            }

            const cleanData = {
                name: name.trim(),
                contact: contact.trim(),
                role: ['individual', 'team'].includes(role) ? role : 'individual',
                teamSize: typeof teamSize === 'number' ? teamSize : 1,
                description: typeof description === 'string' ? description : '',
                skills: Array.isArray(skills) ? skills.filter(s => typeof s === 'string') : [],
                availabilityDates: Array.isArray(availabilityDates) ? availabilityDates.filter(d => typeof d === 'string') : [],
                profilePicture: typeof profilePicture === 'string' ? profilePicture : '',
                city: typeof city === 'string' ? city : '',
                postalCode: typeof postalCode === 'string' ? postalCode : '',
                travelDistance: typeof travelDistance === 'number' ? travelDistance : 0,
                available: typeof available === 'boolean' ? available : true
            };

            const volunteer = await volunteerService.createVolunteer(cleanData);
            res.status(201).json(volunteer);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateVolunteer(req, res) {
        try {
            const allowedFields = [
                'name', 'contact', 'role', 'teamSize', 'description',
                'skills', 'availabilityDates', 'profilePicture', 'city',
                'postalCode', 'travelDistance', 'available'
            ];
            const cleanUpdate = {};
            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    cleanUpdate[field] = req.body[field];
                }
            }

            const volunteer = await volunteerService.updateVolunteer(req.params.id, cleanUpdate);
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
