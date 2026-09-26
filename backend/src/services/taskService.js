const Task = require('../models/Task');

class TaskService {
    async getAllTasks(filters = {}, options = {}) {
        // Basic filter logic for Status, Priority, etc. with safe pagination limits
        const limit = Math.min(Math.max(parseInt(options.limit) || 100, 1), 100);
        const skip = Math.max(parseInt(options.skip) || 0, 0);
        const query = { isDeleted: false, ...filters };
        return await Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    }

    async create_task(taskData) {
        const task = new Task(taskData);
        return await task.save();
    }

    async getTaskById(id) {
        return await Task.findOne({ _id: id, isDeleted: false });
    }

    async updateTask(id, updateData) {
        return await Task.findOneAndUpdate(
            { _id: id, isDeleted: false },
            updateData,
            { new: true, runValidators: true }
        );
    }

    async softDeleteTask(id) {
        return await Task.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }

    async assignTask(id, volunteerId) {
        return await Task.findOneAndUpdate(
            { _id: id, isDeleted: false },
            {
                assignedTo: volunteerId,
                status: 'Assigned'
            },
            { new: true }
        );
    }

    async completeTask(id) {
        return await Task.findOneAndUpdate(
            { _id: id, isDeleted: false },
            {
                status: 'Completed'
            },
            { new: true }
        );
    }
}

module.exports = new TaskService();
