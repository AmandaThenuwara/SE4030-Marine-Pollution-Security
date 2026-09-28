import api from './api';

export const authService = {
    // Register new user
    register: async (userData) => {
        return await api.post('/auth/register', userData);
    },

    // Login user
    login: async (credentials) => {
        return await api.post('/auth/login', credentials);
    },

    // Google OpenID Connect Login
    googleLogin: async (idToken) => {
        return await api.post('/auth/google', { idToken });
    },

    // Get current user profile
    getProfile: async () => {
        return await api.get('/auth/profile');
    },

    // Get all volunteers (Admin only)
    getAllVolunteers: async () => {
        return await api.get('/auth/volunteers');
    },

    // Get motivational quote (third-party API)
    getQuote: async () => {
        return await api.get('/extras/quote');
    },

    // Get ocean fact (third-party API)
    getFact: async () => {
        return await api.get('/extras/fact');
    },

    logout: async () => {
        return await api.post('/auth/logout');
    }
};

export default authService;
