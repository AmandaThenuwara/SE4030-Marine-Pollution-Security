const mongoose = require('mongoose');
const Task = require('./src/models/Task');
const Volunteer = require('./src/models/Volunteer');
require('dotenv').config();

const taskSeedData = [
    {
        location: {
            address: "Mount Lavinia Beach, Colombo",
            coordinates: { lat: 6.8351, lng: 79.8631 }
        },
        description: "Plastic accumulation near the coastal reef. Requires immediate attention.",
        severity: "High",
        priority: "High",
        status: "Pending",
        wasteType: "Plastic"
    },
    {
        location: {
            address: "Galle Face Green, Colombo",
            coordinates: { lat: 6.9247, lng: 79.8450 }
        },
        description: "Oil slick detected near the harbour area. Surface cleaning required.",
        severity: "High",
        priority: "High",
        status: "Assigned",
        assignedTo: "Team Alpha",
        wasteType: "Oil"
    },
    {
        location: {
            address: "Hikkaduwa Marine National Park",
            coordinates: { lat: 6.1395, lng: 80.1063 }
        },
        description: "Abandoned fishing nets (ghost nets) caught on coral reefs.",
        severity: "Medium",
        priority: "Medium",
        status: "Completed",
        wasteType: "Nets"
    }
];

const volunteerSeedData = [
    { name: "Kamal Perera", team: "Team Alpha", contact: "kamal@example.com", available: true },
    { name: "Nimal Silva", team: "Team Alpha", contact: "nimal@example.com", available: true },
    { name: "Saman Fernando", team: "Team Beta", contact: "saman@example.com", available: true },
    { name: "Dilani Jayawardena", team: "Team Beta", contact: "dilani@example.com", available: false },
    { name: "Ruwan Bandara", team: "Individual", contact: "ruwan@example.com", available: true },
    { name: "Amali Wickrama", team: "Individual", contact: "amali@example.com", available: true },
];

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        await Task.deleteMany();
        await Volunteer.deleteMany();
        await Task.insertMany(taskSeedData);
        await Volunteer.insertMany(volunteerSeedData);
        console.log('✅ Tasks & Volunteers Seeded! 🌊');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
