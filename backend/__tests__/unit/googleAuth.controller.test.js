const authController = require('../../src/controllers/auth.controller');
const User = require('../../src/models/user.model');
const axios = require('axios');
const jwt = require('jsonwebtoken');

jest.mock('axios');
jest.mock('../../src/models/user.model');
jest.mock('jsonwebtoken');

describe('Google Authentication Unit Tests', () => {
    let mockReq;
    let mockRes;
    const originalEnv = process.env;

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.clearAllMocks();

        process.env = {
            ...originalEnv,
            JWT_SECRET: 'test_jwt_secret',
            JWT_EXPIRES_IN: '7d',
            GOOGLE_CLIENT_ID: 'test-google-client-id.apps.googleusercontent.com'
        };

        mockReq = {
            body: {}
        };
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        };
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.restoreAllMocks();
    });

    describe('googleLogin Input & Token Verification', () => {
        it('should return 400 if idToken is missing or not a string', async () => {
            mockReq.body = {};
            await authController.googleLogin(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: expect.stringContaining('valid Google ID token')
            }));
        });

        it('should return 401 if Google tokeninfo endpoint returns an error', async () => {
            mockReq.body = { idToken: 'invalid_token_xyz' };
            axios.get.mockRejectedValue(new Error('Invalid token'));

            await authController.googleLogin(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: expect.stringContaining('Invalid or expired Google')
            }));
        });

        it('should return 403 if Google account email is not verified', async () => {
            mockReq.body = { idToken: 'valid_token' };
            axios.get.mockResolvedValue({
                data: {
                    sub: 'google_12345',
                    email: 'unverified@example.com',
                    email_verified: 'false',
                    aud: process.env.GOOGLE_CLIENT_ID,
                    iss: 'https://accounts.google.com'
                }
            });

            await authController.googleLogin(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: expect.stringContaining('not verified')
            }));
        });

        it('should return 401 if token audience does not match GOOGLE_CLIENT_ID', async () => {
            mockReq.body = { idToken: 'valid_token' };
            axios.get.mockResolvedValue({
                data: {
                    sub: 'google_12345',
                    email: 'test@example.com',
                    email_verified: 'true',
                    aud: 'different-client-id.apps.googleusercontent.com',
                    iss: 'https://accounts.google.com'
                }
            });

            await authController.googleLogin(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: expect.stringContaining('audience mismatch')
            }));
        });
    });

    describe('Safe Role Enforcement & Account Handling', () => {
        it('should create new Google user with strictly volunteer role', async () => {
            mockReq.body = { idToken: 'valid_token' };
            axios.get.mockResolvedValue({
                data: {
                    sub: 'google_new_user_123',
                    email: 'volunteer@gmail.com',
                    email_verified: 'true',
                    name: 'Jane Volunteer',
                    picture: 'https://lh3.googleusercontent.com/photo.jpg',
                    aud: process.env.GOOGLE_CLIENT_ID,
                    iss: 'https://accounts.google.com'
                }
            });

            User.findOne.mockResolvedValue(null);

            const mockSave = jest.fn().mockResolvedValue(true);
            User.mockImplementation(function (data) {
                Object.assign(this, data, {
                    _id: 'mock_user_id_123',
                    save: mockSave
                });
            });

            jwt.sign.mockReturnValue('mock_signed_jwt');

            await authController.googleLogin(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.objectContaining({
                    user: expect.objectContaining({
                        role: 'volunteer',
                        email: 'volunteer@gmail.com'
                    }),
                    token: 'mock_signed_jwt'
                })
            }));
        });

        it('should reject deactivated user accounts with 403', async () => {
            mockReq.body = { idToken: 'valid_token' };
            axios.get.mockResolvedValue({
                data: {
                    sub: 'google_inactive_user',
                    email: 'inactive@gmail.com',
                    email_verified: 'true',
                    aud: process.env.GOOGLE_CLIENT_ID,
                    iss: 'https://accounts.google.com'
                }
            });

            User.findOne.mockResolvedValue({
                _id: 'user_deactivated',
                email: 'inactive@gmail.com',
                isActive: false
            });

            await authController.googleLogin(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: expect.stringContaining('deactivated')
            }));
        });
    });
});
