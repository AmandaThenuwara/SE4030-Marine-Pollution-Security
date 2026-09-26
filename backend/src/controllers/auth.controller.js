const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

class AuthController {
    // Register a new user (volunteer or admin)
    async register(req, res) {
        try {
            const { name, email, password, role, adminKey } = req.body;

            // Strict Type & Presence Validation
            if (
                !name || typeof name !== 'string' ||
                !email || typeof email !== 'string' ||
                !password || typeof password !== 'string'
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, and password are required and must be valid strings'
                });
            }

            const cleanEmail = email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid email address'
                });
            }

            const passwordPolicy =
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

            if (!passwordPolicy.test(password)) {
                return res.status(400).json({
                    success: false,
                    message:
                        'Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character'
                });
            }

            // Check if email already exists
            const existingUser = await User.findOne({ email: cleanEmail });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // If registering as admin, validate admin key
            let userRole = 'volunteer';
            if (role === 'admin') {
                const expectedKey = process.env.ADMIN_REGISTER_KEY;
                if (!expectedKey || !adminKey || adminKey !== expectedKey) {
                    return res.status(403).json({
                        success: false,
                        message: 'Invalid admin registration key or admin registration is disabled'
                    });
                }
                userRole = 'admin';
            } else if (role === 'Cleanup_Task_Manager') {
                return res.status(403).json({
                    success: false,
                    message: 'Cleanup Task Manager accounts cannot be created through public registration'
                });
            }

            const user = new User({ name: name.trim(), email: cleanEmail, password, role: userRole });
            await user.save();

            // Generate JWT token
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                return res.status(500).json({
                    success: false,
                    message: 'Server configuration error: JWT_SECRET is not configured'
                });
            }

            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role, name: user.name },
                jwtSecret,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    user: { id: user._id, name: user.name, email: user.email, role: user.role },
                    token
                }
            });
        } catch (error) {
            console.error('Error in register:', error);
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
            }
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Strict Type & Presence Validation
            if (
                !email || typeof email !== 'string' ||
                !password || typeof password !== 'string'
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required and must be valid strings'
                });
            }

            const cleanEmail = email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            // Find user with password using sanitized scalar email
            const user = await User.findOne({ email: cleanEmail, isActive: true }).select('+password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Compare password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Generate JWT token
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                return res.status(500).json({
                    success: false,
                    message: 'Server configuration error: JWT_SECRET is not configured'
                });
            }

            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role, name: user.name },
                jwtSecret,
                { expiresIn: '7d' }
            );

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: { id: user._id, name: user.name, email: user.email, role: user.role },
                    token
                }
            });
        } catch (error) {
            console.error('Error in login:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    // Get current user profile
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Error in getProfile:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    // Get all volunteers (Admin only)
    async getAllVolunteers(req, res) {
        try {
            const volunteers = await User.find({ role: 'volunteer', isActive: true })
                .select('name email role createdAt')
                .sort({ name: 1 });

            res.status(200).json({
                success: true,
                message: 'Volunteers retrieved successfully',
                data: volunteers
            });
        } catch (error) {
            console.error('Error in getAllVolunteers:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }
}

module.exports = new AuthController();
