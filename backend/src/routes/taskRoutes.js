const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const taskService = require('../services/taskService');
const notificationService = require('../services/notificationService');
const {
    authenticate,
    authorizeManager,
    authorizeVolunteer
} = require('../middleware/auth.middleware');

const taskController = new TaskController(taskService, notificationService);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Cleanup task management
 */

// CRUD endpoints for Management Hub

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/', authenticate, (req, res) =>
    taskController.getTasks(req, res)
);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created
 */
router.post(
    '/',
    authenticate,
    authorizeManager,
    (req, res) => taskController.createTask(req, res)
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     summary: Update a task
 *     tags: [Tasks]
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
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated
 */
router.patch(
    '/:id',
    authenticate,
    authorizeManager,
    (req, res) => taskController.updateTask(req, res)
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted
 */
router.delete(
    '/:id',
    authenticate,
    authorizeManager,
    (req, res) => taskController.deleteTask(req, res)
);

// Assignment and Completion routes

/**
 * @swagger
 * /api/tasks/{id}/assign:
 *   patch:
 *     summary: Assign a task to a volunteer
 *     tags: [Tasks]
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
 *               assignedTo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task assigned
 */
router.patch(
    '/:id/assign',
    authenticate,
    authorizeManager,
    (req, res) => taskController.assignTask(req, res)
);

/**
 * @swagger
 * /api/tasks/{id}/complete:
 *   patch:
 *     summary: Mark a task as completed
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task completed
 */
router.patch(
    '/:id/complete',
    authenticate,
    authorizeVolunteer,
    (req, res) => taskController.completeTask(req, res)
);

module.exports = router;
