const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityTitle: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description of effort is required'],
    trim: true,
    maxlength: 500
  },
  pointsAwarded: {
    type: Number,
    required: true,
    min: 0,
    max: 10000
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  badgeType: {
    type: String,
    enum: ['Gold', 'Silver', 'Bronze'],
    default: 'Bronze'
  },
  totalAccumulatedPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  submittedBy: {
    type: String,
    enum: ['admin', 'user'],
    default: 'admin'
  },
  evidenceUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Badge thresholds configuration
achievementSchema.statics.badgeThresholds = {
  Gold: 1000,
  Silver: 500,
  Bronze: 0
};

// Level thresholds configuration
achievementSchema.statics.levelThresholds = {
  Advanced: 750,
  Intermediate: 250,
  Beginner: 0
};

// Indexes for better performance
achievementSchema.index({ volunteerId: 1, createdAt: -1 });
achievementSchema.index({ totalAccumulatedPoints: -1 });
achievementSchema.index({ badgeType: 1 });
achievementSchema.index({ level: 1 });
achievementSchema.index({ status: 1 });

// Pre-save middleware to calculate badge and level
achievementSchema.pre('save', async function () {
  // Only calculate badge and level for approved achievements
  if (this.status === 'approved' && this.isModified('pointsAwarded')) {
    this.badgeType = this.calculateBadge(this.pointsAwarded);
    this.level = this.calculateLevel(this.pointsAwarded);
  }
  this.updatedAt = Date.now();
});

// Instance methods
achievementSchema.methods.calculateBadge = function (points) {
  const thresholds = this.constructor.badgeThresholds;
  if (points >= thresholds.Gold) return 'Gold';
  if (points >= thresholds.Silver) return 'Silver';
  return 'Bronze';
};

achievementSchema.methods.calculateLevel = function (points) {
  const thresholds = this.constructor.levelThresholds;
  if (points >= thresholds.Advanced) return 'Advanced';
  if (points >= thresholds.Intermediate) return 'Intermediate';
  return 'Beginner';
};

// Static method to recalculate total points for a volunteer
achievementSchema.statics.recalculateTotalPoints = async function (volunteerId) {
  try {
    const achievements = await this.find({
      volunteerId,
      isActive: true,
      status: 'approved'
    }).sort({ createdAt: -1 });

    const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.pointsAwarded, 0);

    // Update all achievements for this volunteer with new total
    await this.updateMany(
      { volunteerId, isActive: true },
      { totalAccumulatedPoints: totalPoints, updatedAt: Date.now() }
    );

    return totalPoints;
  } catch (error) {
    throw new Error(`Error recalculating total points: ${error.message}`);
  }
};

// Static method to get leaderboard
achievementSchema.statics.getLeaderboard = async function (limit = 10, skip = 0) {
  try {
    const leaderboard = await this.aggregate([
      { $match: { isActive: true, status: 'approved' } },
      {
        $group: {
          _id: '$volunteerId',
          totalPoints: { $sum: '$pointsAwarded' },
          achievementsCount: { $sum: 1 },
          highestBadge: { $max: '$badgeType' },
          currentLevel: { $max: '$level' },
          lastAchievement: { $max: '$createdAt' }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'volunteer'
        }
      },
      { $unwind: '$volunteer' },
      {
        $project: {
          volunteerId: '$_id',
          totalPoints: 1,
          achievementsCount: 1,
          highestBadge: 1,
          currentLevel: 1,
          lastAchievement: 1,
          'volunteer.name': 1,
          'volunteer.email': 1
        }
      }
    ]);

    // Assign rank in JavaScript (MongoDB doesn't support rank in this context)
    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1 + skip
    }));
  } catch (error) {
    throw new Error(`Error generating leaderboard: ${error.message}`);
  }
};

// Virtual for achievement age
achievementSchema.virtual('achievementAge').get(function () {
  return Date.now() - this.createdAt.getTime();
});

module.exports = mongoose.model('Achievement', achievementSchema);
