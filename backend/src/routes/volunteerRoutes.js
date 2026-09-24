const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');
const {
    authenticate,
    authorizeVolunteerOwnerOrAdmin
} = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Volunteers
 *   description: Volunteer registration and management
 */

/**
 * @swagger
 * /api/volunteers:
 *   get:
 *     summary: Get all volunteers
 *     tags: [Volunteers]
 *     responses:
 *       200:
 *         description: List of volunteers
 */
router.get('/', (req, res) => volunteerController.getVolunteers(req, res));

/**
 * @swagger
 * /api/volunteers:
 *   post:
 *     summary: Register a new volunteer
 *     tags: [Volunteers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Volunteer'
 *     responses:
 *       201:
 *         description: Volunteer registered
 */
router.post('/', (req, res) => volunteerController.createVolunteer(req, res));

/**
 * @swagger
 * /api/volunteers/{id}:
 *   put:
 *     summary: Update a volunteer
 *     tags: [Volunteers]
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
 *             $ref: '#/components/schemas/Volunteer'
 *     responses:
 *       200:
 *         description: Volunteer updated
 */
router.put(
    '/:id',
    authenticate,
    authorizeVolunteerOwnerOrAdmin,
    (req, res) => volunteerController.updateVolunteer(req, res)
);

/**
 * @swagger
 * /api/volunteers/{id}:
 *   delete:
 *     summary: Delete a volunteer
 *     tags: [Volunteers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Volunteer deleted
 */
router.delete(
    '/:id',
    authenticate,
    authorizeVolunteerOwnerOrAdmin,
    (req, res) => volunteerController.deleteVolunteer(req, res)
);

module.exports = router;
