const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Marine Pollution Management Hub API',
            version: '1.0.0',
            description: 'API documentation for the Marine Pollution Management Hub system, including user authentication, reports, tasks, and volunteer management.',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: process.env.BASE_URL || 'http://localhost:5000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Task: {
                    type: 'object',
                    required: ['location', 'description'],
                    properties: {
                        _id: { type: 'string' },
                        location: {
                            type: 'object',
                            required: ['address', 'coordinates'],
                            properties: {
                                address: { type: 'string' },
                                coordinates: {
                                    type: 'object',
                                    properties: {
                                        lat: { type: 'number' },
                                        lng: { type: 'number' }
                                    }
                                }
                            }
                        },
                        description: { type: 'string' },
                        severity: { type: 'string', enum: ['Low', 'Medium', 'High'] },
                        priority: { type: 'string', enum: ['Low', 'Medium', 'High'] },
                        status: { type: 'string', enum: ['Pending', 'Assigned', 'In Progress', 'Completed'] },
                        assignedTo: { type: 'string' },
                        workforceRequired: { type: 'number' },
                        deadline: { type: 'string', format: 'date-time' },
                        wasteType: { type: 'string' },
                        notes: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Volunteer: {
                    type: 'object',
                    required: ['name', 'contact'],
                    properties: {
                        _id: { type: 'string' },
                        userId: { type: 'string' },
                        name: { type: 'string' },
                        contact: { type: 'string' },
                        role: { type: 'string', enum: ['individual', 'team'] },
                        teamSize: { type: 'number' },
                        description: { type: 'string' },
                        skills: { type: 'array', items: { type: 'string' } },
                        availabilityDates: { type: 'array', items: { type: 'string' } },
                        profilePicture: { type: 'string' },
                        city: { type: 'string' },
                        postalCode: { type: 'string' },
                        travelDistance: { type: 'number' },
                        available: { type: 'boolean' }
                    }
                },
                User: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        password: { type: 'string' },
                        role: { type: 'string', enum: ['admin', 'volunteer', 'Cleanup_Task_Manager'] },
                        isActive: { type: 'boolean' }
                    }
                },
                Achievement: {
                    type: 'object',
                    required: ['volunteerId', 'activityTitle', 'description', 'pointsAwarded'],
                    properties: {
                        _id: { type: 'string' },
                        volunteerId: { type: 'string' },
                        activityTitle: { type: 'string' },
                        description: { type: 'string' },
                        pointsAwarded: { type: 'number' },
                        level: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced'] },
                        badgeType: { type: 'string', enum: ['Gold', 'Silver', 'Bronze'] },
                        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                        submittedBy: { type: 'string', enum: ['admin', 'user'] },
                        evidenceUrl: { type: 'string' }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.js', './server.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);
module.exports = specs;

