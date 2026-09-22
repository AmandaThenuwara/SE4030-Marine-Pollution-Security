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

    // Logout (client-side)
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get stored token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Get stored user
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Check if logged in
    isLoggedIn: () => {
        return !!localStorage.getItem('token');
    },

    // Check if admin
    isAdmin: () => {
        const user = localStorage.getItem('user');
        if (!user) return false;
        return JSON.parse(user).role === 'admin';
    }
};

export default authService;
