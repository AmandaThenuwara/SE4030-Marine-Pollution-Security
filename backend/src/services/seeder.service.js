const User = require('../models/user.model');

class SeederService {
    async seedDefaultUsers() {
        try {
            const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
            const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

            const managerEmail = process.env.INITIAL_MANAGER_EMAIL;
            const managerPassword = process.env.INITIAL_MANAGER_PASSWORD;

            // Do not create privileged accounts unless credentials
            // are explicitly configured by the deployment environment.
            if (managerEmail && managerPassword) {
                const managerExists = await User.findOne({
                    email: managerEmail
                });

                if (!managerExists) {
                    await User.create({
                        name: 'Cleanup Task Manager',
                        email: managerEmail,
                        password: managerPassword,
                        role: 'Cleanup_Task_Manager'
                    });

                    console.log('Initial Cleanup Task Manager created.');
                }
            }

            if (adminEmail && adminPassword) {
                const adminExists = await User.findOne({
                    email: adminEmail
                });

                if (!adminExists) {
                    await User.create({
                        name: 'Initial Admin',
                        email: adminEmail,
                        password: adminPassword,
                        role: 'admin'
                    });

                    console.log('Initial admin account created.');
                }
            }
        } catch (err) {
            console.error('Seeding error:', err.message);
        }
    }
}

module.exports = new SeederService();
