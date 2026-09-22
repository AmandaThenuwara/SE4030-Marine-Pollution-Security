const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    role: { type: String, enum: ['individual', 'team'], default: 'individual' },
    teamSize: { type: Number, default: 1 },
    description: { type: String },
    skills: [{ type: String }],
    availabilityDates: [{ type: String }],
    profilePicture: { type: String },
    city: { type: String },
    postalCode: { type: String },
    travelDistance: { type: Number },
    available: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Volunteer', volunteerSchema);
