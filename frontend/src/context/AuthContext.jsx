import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load stored session on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        const { user: userData, token: newToken } = response.data;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);

        return response;
    };

    const register = async (userData) => {
        const response = await authService.register(userData);
        const { user: newUser, token: newToken } = response.data;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);

        return response;
    };

    const logout = () => {
        authService.logout();
        setToken(null);
        setUser(null);
    };

    const isAdmin = () => user?.role === 'admin';
    const isVolunteer = () => user?.role === 'volunteer';
    const isCleanupTaskManager = () => user?.role === 'Cleanup_Task_Manager';
    const isLoggedIn = () => !!token;

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isVolunteer,
        isCleanupTaskManager,
        isLoggedIn,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
