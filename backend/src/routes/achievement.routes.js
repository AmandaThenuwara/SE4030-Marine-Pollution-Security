const express = require('express');
const router = express.Router();
console.log('--- Achievement Routes Loading ---');
const achievementController = require('../controllers/achievement.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes
/**
 * @swagger
 * tags:
 *   name: Achievements
 *   description: Achievement tracking and leaderboard
 */

/**
 * @swagger
 * /api/achievements/leaderboard:
 *   get:
 *     summary: Get achievement leaderboard
 *     tags: [Achievements]
 *     responses:
 *       200:
 *         description: Leaderboard data
 */
router.get('/leaderboard', achievementController.getLeaderboard);

/**
 * @swagger
 * /api/achievements/my-achievements:
 *   get:
 *     summary: Get current user's achievements
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user achievements
 */
router.get('/my-achievements', authenticate, achievementController.getMyAchievements);

/**
 * @swagger
 * /api/achievements/submit:
 *   post:
 *     summary: Submit a new achievement for approval
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               activityTitle: { type: string }
 *               description: { type: string }
 *               evidenceImage: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Achievement submitted
 */
router.post('/submit', authenticate, upload.single('evidenceImage'), achievementController.submitAchievement);

/**
 * @swagger
 * /api/achievements/stats:
 *   get:
 *     summary: Get overall achievement stats (Admin only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Achievement statistics
 */
router.get('/stats', authenticate, authorizeAdmin, achievementController.getAchievementStats);

/**
 * @swagger
 * /api/achievements:
 *   get:
 *     summary: Get all achievements (Admin only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all achievements
 */
router.get('/', authenticate, authorizeAdmin, achievementController.getAllAchievements);

/**
 * @swagger
 * /api/achievements:
 *   post:
 *     summary: Create a new achievement (Admin only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Achievement'
 *     responses:
 *       201:
 *         description: Achievement created
 */
router.post('/', authenticate, authorizeAdmin, achievementController.createAchievement);

/**
 * @swagger
 * /api/achievements/volunteer/{volunteerId}:
 *   get:
 *     summary: Get achievements by volunteer ID (Admin only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: volunteerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of achievements for the volunteer
 */
router.get('/volunteer/:volunteerId', authenticate, authorizeAdmin, achievementController.getAchievementsByVolunteer);

/**
 * @swagger
 * /api/achievements/{id}/approve:
 *   put:
 *     summary: Approve an achievement (Admin only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pointsAwarded:
 *                 type: number
 *               badgeType:
 *                 type: string
 *                 enum: [Gold, Silver, Bronze]
 *     responses:
 *       200:
 *         description: Achievement approved
 */
router.put('/:id/approve', authenticate, authorizeAdmin, achievementController.approveAchievement);

/**
 * @swagger
 * /api/achievements/{id}/reject:
 *   put:
 *     summary: Reject an achievement (Admin only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Achievement rejected
 */
router.put('/:id/reject', authenticate, authorizeAdmin, achievementController.rejectAchievement);

/**
 * @swagger
 * /api/achievements/{id}:
 *   get:
 *     summary: Get achievement by ID (Admin only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Achievement data
 */
router.get('/:id', authenticate, authorizeAdmin, achievementController.getAchievementById);

/**
 * @swagger
 * /api/achievements/{id}:
 *   put:
 *     summary: Update an achievement (Admin only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Achievement'
 *     responses:
 *       200:
 *         description: Achievement updated
 */
router.put('/:id', authenticate, authorizeAdmin, achievementController.updateAchievement);

/**
 * @swagger
 * /api/achievements/{id}:
 *   delete:
 *     summary: Delete an achievement (Admin only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Achievement deleted
 */
router.delete('/:id', authenticate, authorizeAdmin, achievementController.deleteAchievement);

module.exports = router;
