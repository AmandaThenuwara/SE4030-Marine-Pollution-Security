class TaskController {
    constructor(taskService, notificationService) {
        this.taskService = taskService;
        this.notificationService = notificationService;
    }

    getTasks = async (req, res) => {
        try {
            const filters = {};
            if (req.query.status) filters.status = req.query.status;
            if (req.query.priority) filters.priority = req.query.priority;

            const tasks = await this.taskService.getAllTasks(filters);
            res.json(tasks);
        } catch (error) {
            console.error("GET TASKS ERROR:", error);
            res.status(500).json({ message: error.message });
        }
    }

    createTask = async (req, res) => {
        try {
            const task = await this.taskService.create_task(req.body);
            req.app.get("io").emit("task_created", task);
            res.status(201).json(task);
        } catch (error) {
            console.error("CREATE TASK ERROR:", error.message, error.errors || "");
            res.status(400).json({ message: error.message });
        }
    }

    updateTask = async (req, res) => {
        try {
            const task = await this.taskService.updateTask(req.params.id, req.body);
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
            const task = await this.taskService.assignTask(req.params.id, volunteerId);
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
