import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load stored session on mount
    useEffect(() => {
        let active = true;
        authService.getProfile()
            .then((response) => {
                if (active) setUser(response.data);
            })
            .catch(() => {
                if (active) setUser(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, []);

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        const { user: userData } = response.data;
        setUser(userData);

        return response;
    };

    const register = async (userData) => {
        const response = await authService.register(userData);
        const { user: newUser } = response.data;
        setUser(newUser);

        return response;
    };

    const loginWithGoogle = async (idToken) => {
        const response = await authService.googleLogin(idToken);
        const { user: userData } = response.data;
        setUser(userData);

        return response;
    };

    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
        }
    };

    const isAdmin = () => user?.role === 'admin';
    const isVolunteer = () => user?.role === 'volunteer';
    const isCleanupTaskManager = () => user?.role === 'Cleanup_Task_Manager';
    const isLoggedIn = () => !!user;

    const value = {
        user,
        loading,
        login,
        register,
        loginWithGoogle,
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
