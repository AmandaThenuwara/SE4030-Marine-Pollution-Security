const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    location: {
        address: { type: String, required: true },
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        }
    },
    description: { type: String, required: true },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    assignedTo: {
        type: String, // Can be extended to a User ObjectId later
        default: null
    },
    workforceRequired: { type: Number, default: 0 },
    deadline: { type: Date },
    wasteType: { type: String },
    notes: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
