const User = require('../models/user.model');

class SeederService {
    async seedDefaultUsers() {
        try {
            // Seed default Cleanup Task Manager
            const cleanupExists = await User.findOne({ email: "cleanup@gmail.com" });
            if (!cleanupExists) {
                await User.create({
                    name: "Cleanup Task Manager",
                    email: "cleanup@gmail.com",
                    password: "cleanup123",
                    role: "Cleanup_Task_Manager"
                });
                console.log("✅ Default Cleanup Task Manager created (cleanup@gmail.com / cleanup123)");
            }

            // Seed default admin
            const adminExists = await User.findOne({ email: "admin@gmail.com" });
            if (!adminExists) {
                await User.create({
                    name: "Default Admin",
                    email: "admin@gmail.com",
                    password: "admin123",
                    role: "admin"
                });
                console.log("✅ Default admin user created (admin@gmail.com / admin123)");
            }
        } catch (err) {
            console.error("Seeding error:", err.message);
        }
    }
}

module.exports = new SeederService();
