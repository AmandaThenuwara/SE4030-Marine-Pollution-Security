const mongoose = require('mongoose');
const achievementService = require('../services/achievement.service');

class AchievementController {
  // Create achievement (Admin only)
  async createAchievement(req, res) {
    try {
      const { volunteerId, activityTitle, description, pointsAwarded, badgeType } = req.body;

      // Validation
      if (!volunteerId || !activityTitle || !description || pointsAwarded === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: volunteerId, activityTitle, description, pointsAwarded'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid volunteer ID format'
        });
      }

      if (pointsAwarded < 0 || pointsAwarded > 10000) {
        return res.status(400).json({
          success: false,
          message: 'Points awarded must be between 0 and 10000'
        });
      }

      const payload = {
        volunteerId,
        activityTitle,
        description,
        pointsAwarded
      };

      if (badgeType && ['Gold', 'Silver', 'Bronze'].includes(badgeType)) {
        payload.badgeType = badgeType;
      }

      const achievement = await achievementService.createAchievement(payload);

      res.status(201).json({
        success: true,
        message: 'Achievement created successfully',
        data: achievement
      });
    } catch (error) {
      console.error('Error in createAchievement:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  // Get all achievements (Admin only)
  async getAllAchievements(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        badgeType,
        level,
        volunteerId,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Validate pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters'
        });
      }

      // Build filters
      const filters = {
        badgeType,
        level,
        volunteerId,
        startDate,
        endDate
      };

      if (volunteerId && !mongoose.Types.ObjectId.isValid(volunteerId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid volunteer ID format'
        });
      }

      // Build sort
      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const pagination = { page: pageNum, limit: limitNum };

      const result = await achievementService.getAllAchievements(filters, pagination, sort);

      res.status(200).json({
        success: true,
        message: 'Achievements retrieved successfully',
        data: result.achievements,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in getAllAchievements:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  // Get achievement by ID (Admin only)
  async getAchievementById(req, res) {
    try {
      const { id } = req.params;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid achievement ID format'
        });
      }

      const achievement = await achievementService.getAchievementById(id);

      res.status(200).json({
        success: true,
        message: 'Achievement retrieved successfully',
        data: achievement
      });
    } catch (error) {
      console.error('Error in getAchievementById:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  // Get logged-in volunteer's achievements
  async getMyAchievements(req, res) {
    try {
      // Assuming user ID is available from auth middleware
      const volunteerId = req.user?.id || req.volunteerId;

      if (!volunteerId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { page = 1, limit = 10 } = req.query;

      // Validate pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters'
        });
      }

      const pagination = { page: pageNum, limit: limitNum };

      const result = await achievementService.getAchievementsByVolunteer(volunteerId, pagination);

      res.status(200).json({
        success: true,
        message: 'Your achievements retrieved successfully',
        data: result.achievements,
        volunteerStats: result.volunteerStats,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in getMyAchievements:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  // Get achievements by volunteer ID (Admin only)
  async getAchievementsByVolunteer(req, res) {
    try {
      const { volunteerId } = req.params;

      if (!volunteerId) {
        return res.status(400).json({
          success: false,
          message: 'Volunteer ID is required'
        });
      }

      const { page = 1, limit = 10 } = req.query;

      // Validate pagination
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters'
        });
      }

      const pagination = { page: pageNum, limit: limitNum };

      const result = await achievementService.getAchievementsByVolunteer(volunteerId, pagination);

      res.status(200).json({
        success: true,
        message: 'Volunteer achievements retrieved successfully',
        data: result.achievements,
        volunteerStats: result.volunteerStats,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in getAchievementsByVolunteer:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  // Get leaderboard (Public/Admin)
  async getLeaderboard(req, res) {
    try {
      const {
        limit = 10,
        skip = 0,
        badgeType,
        level
      } = req.query;

      // Validate parameters
      const limitNum = parseInt(limit);
      const skipNum = parseInt(skip);

      if (limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Limit must be between 1 and 100'
        });
      }

      if (skipNum < 0) {
        return res.status(400).json({
          success: false,
          message: 'Skip must be non-negative'
        });
      }

      // Validate badge type and level if provided
      if (badgeType && !['Gold', 'Silver', 'Bronze'].includes(badgeType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid badge type. Must be Gold, Silver, or Bronze'
        });
      }

      if (level && !['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid level. Must be Beginner, Intermediate, or Advanced'
        });
      }

      const options = {
        limit: limitNum,
        skip: skipNum,
        badgeType,
        level
      };

      const leaderboard = await achievementService.getLeaderboard(options);

      res.status(200).json({
        success: true,
        message: 'Leaderboard retrieved successfully',
        data: leaderboard
      });
    } catch (error) {
      console.error('Error in getLeaderboard:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  // Update achievement (Admin only)
  async updateAchievement(req, res) {
    try {
      const { id } = req.params;
      const { activityTitle, description, pointsAwarded, badgeType } = req.body;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid achievement ID format'
        });
      }

      // Validate update data
      const updateData = {};
      if (activityTitle !== undefined) {
        if (!activityTitle.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Activity title cannot be empty'
          });
        }
        if (activityTitle.length > 100) {
          return res.status(400).json({
            success: false,
            message: 'Activity title cannot exceed 100 characters'
          });
        }
        updateData.activityTitle = activityTitle;
      }

      if (description !== undefined) {
        if (!description.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Description cannot be empty'
          });
        }
        if (description.length > 500) {
          return res.status(400).json({
            success: false,
            message: 'Description cannot exceed 500 characters'
          });
        }
        updateData.description = description;
      }

      if (badgeType !== undefined) {
        if (!['Gold', 'Silver', 'Bronze'].includes(badgeType)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid badge type'
          });
        }
        updateData.badgeType = badgeType;
      }

      if (pointsAwarded !== undefined) {
        if (pointsAwarded < 0 || pointsAwarded > 10000) {
          return res.status(400).json({
            success: false,
            message: 'Points awarded must be between 0 and 10000'
          });
        }
        updateData.pointsAwarded = pointsAwarded;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      const achievement = await achievementService.updateAchievement(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Achievement updated successfully',
        data: achievement
      });
    } catch (error) {
      console.error('Error in updateAchievement:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  // Delete achievement (Admin only)
  async deleteAchievement(req, res) {
    try {
      const { id } = req.params;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid achievement ID format'
        });
      }

      const result = await achievementService.deleteAchievement(id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in deleteAchievement:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  // Get achievement statistics (Admin only)
  async getAchievementStats(req, res) {
    try {
      const stats = await achievementService.getAchievementStats();

      res.status(200).json({
        success: true,
        message: 'Achievement statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Error in getAchievementStats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  // Submit achievement (User/Volunteer)
  async submitAchievement(req, res) {
    try {
      const volunteerId = req.user?.id || req.volunteerId;
      const { activityTitle, description } = req.body;
      const evidenceImage = req.file ? `/uploads/achievements/${req.file.filename}` : null;

      if (!volunteerId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      if (!activityTitle || !description) {
        return res.status(400).json({
          success: false,
          message: 'Activity title and description are required'
        });
      }

      const payload = {
        volunteerId,
        activityTitle,
        description,
        evidenceUrl: evidenceImage,
        status: 'pending',
        submittedBy: 'user',
        pointsAwarded: 0
      };

      const achievement = await achievementService.createAchievement(payload);

      res.status(201).json({
        success: true,
        message: 'Achievement submitted successfully and pending admin approval',
        data: achievement
      });
    } catch (error) {
      console.error('Error in submitAchievement:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  // Approve achievement (Admin only)
  async approveAchievement(req, res) {
    try {
      const { id } = req.params;
      const { pointsAwarded, badgeType } = req.body;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid achievement ID format'
        });
      }

      if (pointsAwarded === undefined || pointsAwarded < 0 || pointsAwarded > 10000) {
        return res.status(400).json({
          success: false,
          message: 'Points awarded must be between 0 and 10000'
        });
      }

      const updateData = {
        status: 'approved',
        pointsAwarded
      };

      if (badgeType && ['Gold', 'Silver', 'Bronze'].includes(badgeType)) {
        updateData.badgeType = badgeType;
      }

      const achievement = await achievementService.updateAchievement(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Achievement approved successfully',
        data: achievement
      });
    } catch (error) {
      console.error('Error in approveAchievement:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }

  // Reject achievement (Admin only)
  async rejectAchievement(req, res) {
    try {
      const { id } = req.params;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid achievement ID format'
        });
      }

      const achievement = await achievementService.updateAchievement(id, { status: 'rejected' });

      res.status(200).json({
        success: true,
        message: 'Achievement rejected',
        data: achievement
      });
    } catch (error) {
      console.error('Error in rejectAchievement:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
}

module.exports = new AchievementController();
