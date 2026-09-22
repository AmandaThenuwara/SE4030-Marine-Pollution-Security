import api from './api';

export const achievementService = {
  // Create achievement (Admin only)
  createAchievement: async (achievementData) => {
    return await api.post('/achievements', achievementData);
  },

  // Get all achievements (Admin only)
  getAllAchievements: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return await api.get(`/achievements?${queryParams}`);
  },

  // Get achievement by ID (Admin only)
  getAchievementById: async (id) => {
    return await api.get(`/achievements/${id}`);
  },

  // Get current user's achievements
  getMyAchievements: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return await api.get(`/achievements/my-achievements?${queryParams}`);
  },

  // Submit achievement (User/Volunteer)
  submitAchievement: async (formData) => {
    return await api.post('/achievements/submit', formData);
  },

  // Approve achievement (Admin only)
  approveAchievement: async (id, approvalData) => {
    return await api.put(`/achievements/${id}/approve`, approvalData);
  },

  // Reject achievement (Admin only)
  rejectAchievement: async (id) => {
    return await api.put(`/achievements/${id}/reject`);
  },

  // Get achievements by volunteer ID (Admin only)
  getAchievementsByVolunteer: async (volunteerId, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return await api.get(`/achievements/volunteer/${volunteerId}?${queryParams}`);
  },

  // Get leaderboard (Public)
  getLeaderboard: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return await api.get(`/achievements/leaderboard?${queryParams}`);
  },

  // Update achievement (Admin only)
  updateAchievement: async (id, updateData) => {
    return await api.put(`/achievements/${id}`, updateData);
  },

  // Delete achievement (Admin only)
  deleteAchievement: async (id) => {
    return await api.delete(`/achievements/${id}`);
  },

  // Get achievement statistics (Admin only)
  getAchievementStats: async () => {
    return await api.get('/achievements/stats');
  },
};

export default achievementService;
