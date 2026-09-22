const mongoose = require('mongoose');
const Achievement = require('../models/achievement.model');

class AchievementService {
  constructor() {
    this.model = Achievement;
  }

  // Create achievement
  async createAchievement(achievementData) {
    try {
      // Validate volunteer exists (assuming User model exists)
      // This would be implemented based on your User model

      const achievement = new this.model(achievementData);
      await achievement.save();

      // Only recalculate total points for approved achievements
      if (achievementData.status === 'approved') {
        await this.model.recalculateTotalPoints(achievementData.volunteerId);
      }

      // Return populated achievement
      return await this.model.findById(achievement._id).populate('volunteerId', 'name email');
    } catch (error) {
      throw new Error(`Error creating achievement: ${error.message}`);
    }
  }

  // Get all achievements (Admin only)
  async getAllAchievements(filters = {}, pagination = {}, sort = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        skip = (page - 1) * limit
      } = pagination;

      const {
        badgeType,
        level,
        volunteerId,
        startDate,
        endDate,
        isActive = true,
        status
      } = filters;

      // Build query
      const query = { isActive };

      if (badgeType) query.badgeType = badgeType;
      if (level) query.level = level;
      if (volunteerId) query.volunteerId = volunteerId;
      if (status) query.status = status;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // Default sort
      const sortOptions = sort.createdAt ? sort : { createdAt: -1 };

      const achievements = await this.model
        .find(query)
        .populate('volunteerId', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const total = await this.model.countDocuments(query);

      return {
        achievements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching achievements: ${error.message}`);
    }
  }

  // Get achievement by ID
  async getAchievementById(id) {
    try {
      const achievement = await this.model
        .findOne({ _id: id, isActive: true })
        .populate('volunteerId', 'name email');

      if (!achievement) {
        throw new Error('Achievement not found');
      }

      return achievement;
    } catch (error) {
      throw new Error(`Error fetching achievement: ${error.message}`);
    }
  }

  // Get achievements by volunteer ID
  async getAchievementsByVolunteer(volunteerId, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        skip = (page - 1) * limit
      } = pagination;

      // For user's own achievements, show all statuses (pending, approved, rejected)
      const achievements = await this.model
        .find({ volunteerId, isActive: true })
        .populate('volunteerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await this.model.countDocuments({ volunteerId, isActive: true });

      // Get volunteer's total points (only from approved achievements)
      const volunteerStats = await this.getVolunteerStats(volunteerId);

      return {
        achievements,
        volunteerStats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching volunteer achievements: ${error.message}`);
    }
  }

  // Get volunteer statistics
  async getVolunteerStats(volunteerId) {
    try {
      const stats = await this.model.aggregate([
        { $match: { volunteerId: new mongoose.Types.ObjectId(volunteerId), isActive: true, status: 'approved' } },
        {
          $group: {
            _id: '$volunteerId',
            totalPoints: { $sum: '$pointsAwarded' },
            achievementsCount: { $sum: 1 },
            goldBadges: { $sum: { $cond: [{ $eq: ['$badgeType', 'Gold'] }, 1, 0] } },
            silverBadges: { $sum: { $cond: [{ $eq: ['$badgeType', 'Silver'] }, 1, 0] } },
            bronzeBadges: { $sum: { $cond: [{ $eq: ['$badgeType', 'Bronze'] }, 1, 0] } },
            currentLevel: { $max: '$level' },
            lastAchievement: { $max: '$createdAt' }
          }
        }
      ]);

      return stats[0] || {
        totalPoints: 0,
        achievementsCount: 0,
        goldBadges: 0,
        silverBadges: 0,
        bronzeBadges: 0,
        currentLevel: 'Beginner',
        lastAchievement: null
      };
    } catch (error) {
      throw new Error(`Error fetching volunteer stats: ${error.message}`);
    }
  }

  async getLeaderboard(options = {}) {
    try {
      const { limit = 10, skip = 0, badgeType, level } = options;

      let leaderboard = await this.model.getLeaderboard(limit, skip);

      // Apply additional filters if specified
      if (badgeType || level) {
        leaderboard = leaderboard.filter(entry => {
          if (badgeType && entry.highestBadge !== badgeType) return false;
          if (level && entry.currentLevel !== level) return false;
          return true;
        });
      }

      return leaderboard;
    } catch (error) {
      throw new Error(`Error generating leaderboard: ${error.message}`);
    }
  }

  // Update achievement
  async updateAchievement(id, updateData) {
    try {
      const achievement = await this.model.findById(id);

      if (!achievement || !achievement.isActive) {
        throw new Error('Achievement not found');
      }

      // Update achievement
      Object.assign(achievement, updateData);
      await achievement.save();

      // Recalculate total points if status changed to approved or points were modified
      if (updateData.status === 'approved' || updateData.pointsAwarded !== undefined) {
        await this.model.recalculateTotalPoints(achievement.volunteerId);
      }

      // Return updated achievement
      return await this.model
        .findById(id)
        .populate('volunteerId', 'name email');
    } catch (error) {
      throw new Error(`Error updating achievement: ${error.message}`);
    }
  }

  // Delete achievement (hard delete)
  async deleteAchievement(id) {
    try {
      // Find achievement first to get volunteerId for recalculation
      const achievement = await this.model.findById(id);

      if (!achievement) {
        throw new Error('Achievement not found');
      }

      const volunteerId = achievement.volunteerId;

      // Physically delete from database
      await this.model.findByIdAndDelete(id);

      // Recalculate total points for the volunteer
      await this.model.recalculateTotalPoints(volunteerId);

      return { message: 'Achievement permanently deleted' };
    } catch (error) {
      throw new Error(`Error deleting achievement: ${error.message}`);
    }
  }

  // Get achievement statistics (Admin dashboard)
  async getAchievementStats() {
    try {
      const stats = await this.model.aggregate([
        { $match: { isActive: true, status: 'approved' } },
        {
          $group: {
            _id: null,
            totalAchievements: { $sum: 1 },
            totalPointsAwarded: { $sum: '$pointsAwarded' },
            goldBadges: { $sum: { $cond: [{ $eq: ['$badgeType', 'Gold'] }, 1, 0] } },
            silverBadges: { $sum: { $cond: [{ $eq: ['$badgeType', 'Silver'] }, 1, 0] } },
            bronzeBadges: { $sum: { $cond: [{ $eq: ['$badgeType', 'Bronze'] }, 1, 0] } },
            beginnerLevel: { $sum: { $cond: [{ $eq: ['$level', 'Beginner'] }, 1, 0] } },
            intermediateLevel: { $sum: { $cond: [{ $eq: ['$level', 'Intermediate'] }, 1, 0] } },
            advancedLevel: { $sum: { $cond: [{ $eq: ['$level', 'Advanced'] }, 1, 0] } },
            uniqueVolunteers: { $addToSet: '$volunteerId' }
          }
        },
        {
          $project: {
            totalAchievements: 1,
            totalPointsAwarded: 1,
            goldBadges: 1,
            silverBadges: 1,
            bronzeBadges: 1,
            beginnerLevel: 1,
            intermediateLevel: 1,
            advancedLevel: 1,
            uniqueVolunteersCount: { $size: '$uniqueVolunteers' }
          }
        }
      ]);

      // Get pending count
      const pendingCount = await this.model.countDocuments({ isActive: true, status: 'pending' });

      const result = stats[0] || {
        totalAchievements: 0,
        totalPointsAwarded: 0,
        goldBadges: 0,
        silverBadges: 0,
        bronzeBadges: 0,
        beginnerLevel: 0,
        intermediateLevel: 0,
        advancedLevel: 0,
        uniqueVolunteersCount: 0
      };

      result.pendingAchievements = pendingCount;

      return result;
    } catch (error) {
      throw new Error(`Error fetching achievement statistics: ${error.message}`);
    }
  }
}

module.exports = new AchievementService();
