class TaskController {
    constructor(taskService, notificationService) {
        this.taskService = taskService;
        this.notificationService = notificationService;
    }

    getTasks = async (req, res) => {
        try {
            const filters = {};
            const allowedStatuses = ['Pending', 'Assigned', 'In Progress', 'Completed'];
            const allowedPriorities = ['Low', 'Medium', 'High'];

            if (req.query.status && typeof req.query.status === 'string' && allowedStatuses.includes(req.query.status)) {
                filters.status = req.query.status;
            }
            if (req.query.priority && typeof req.query.priority === 'string' && allowedPriorities.includes(req.query.priority)) {
                filters.priority = req.query.priority;
            }

            const page = Math.max(parseInt(req.query.page) || 1, 1);
            const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 100);
            const skip = req.query.skip !== undefined ? Math.max(parseInt(req.query.skip) || 0, 0) : (page - 1) * limit;
            const options = { limit, skip };

            const tasks = await this.taskService.getAllTasks(filters, options);
            res.json(tasks);
        } catch (error) {
            console.error("GET TASKS ERROR:", error);
            res.status(500).json({ message: error.message });
        }
    }

    createTask = async (req, res) => {
        try {
            const {
                location,
                description,
                severity,
                priority,
                status,
                assignedTo,
                workforceRequired,
                deadline,
                wasteType,
                notes
            } = req.body;

            if (!description || typeof description !== 'string') {
                return res.status(400).json({ message: 'Description is required and must be a string' });
            }
            if (!location || typeof location !== 'object' || !location.address) {
                return res.status(400).json({ message: 'Valid location with address is required' });
            }

            const cleanData = {
                location,
                description: description.trim(),
                severity,
                priority,
                status,
                assignedTo: typeof assignedTo === 'string' ? assignedTo : null,
                workforceRequired,
                deadline,
                wasteType,
                notes
            };

            const task = await this.taskService.create_task(cleanData);
            req.app.get("io").emit("task_created", task);
            res.status(201).json(task);
        } catch (error) {
            console.error("CREATE TASK ERROR:", error.message, error.errors || "");
            res.status(400).json({ message: error.message });
        }
    }

    updateTask = async (req, res) => {
        try {
            const allowedFields = [
                'location', 'description', 'severity', 'priority',
                'status', 'assignedTo', 'workforceRequired', 'deadline',
                'wasteType', 'notes'
            ];
            const cleanUpdate = {};
            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    cleanUpdate[field] = req.body[field];
                }
            }

            const task = await this.taskService.updateTask(req.params.id, cleanUpdate);
            if (!task) return res.status(404).json({ message: 'Task not found' });
            req.app.get("io").emit("task_updated", task);
            res.json(task);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    deleteTask = async (req, res) => {
        try {
            const task = await this.taskService.softDeleteTask(req.params.id);
            if (!task) return res.status(404).json({ message: 'Task not found' });
            req.app.get("io").emit("task_deleted", req.params.id);
            res.json({ message: 'Task removed successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    assignTask = async (req, res) => {
        try {
            const { volunteerId } = req.body;
            if (!volunteerId || typeof volunteerId !== 'string') {
                return res.status(400).json({ message: 'Volunteer ID must be a valid string' });
            }

            const task = await this.taskService.assignTask(req.params.id, volunteerId.trim());
            if (!task) return res.status(404).json({ message: 'Task not found' });

            // Trigger Notification
            await this.notificationService.notifyVolunteer(volunteerId, task);
            req.app.get("io").emit("task_updated", task);

            res.json(task);
        } catch (error) {
            console.error("ASSIGN TASK ERROR:", error.message);
            res.status(400).json({ message: error.message });
        }
    }

    completeTask = async (req, res) => {
        try {
            const task = await this.taskService.completeTask(req.params.id);
            if (!task) return res.status(404).json({ message: 'Task not found' });

            // Trigger Notification to Garbage Unit
            await this.notificationService.notifyGarbageUnit(task);
            req.app.get("io").emit("task_updated", task);

            res.json(task);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = TaskController;
