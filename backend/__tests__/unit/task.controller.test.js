const TaskController = require('../../src/controllers/taskController');

describe('TaskController Unit Tests', () => {
    let taskController;
    let mockTaskService;
    let mockNotificationService;
    let mockRes;
    let mockReq;
    let mockIo;

    beforeEach(() => {
        // Suppress console.error in tests
        jest.spyOn(console, 'error').mockImplementation(() => {});

        mockTaskService = {
            getAllTasks: jest.fn(),
            create_task: jest.fn(),
            updateTask: jest.fn(),
            softDeleteTask: jest.fn(),
            assignTask: jest.fn(),
            completeTask: jest.fn(),
        };
        mockNotificationService = {
            notifyVolunteer: jest.fn(),
            notifyGarbageUnit: jest.fn(),
        };
        mockIo = {
            emit: jest.fn(),
        };
        mockReq = {
            query: {},
            params: {},
            body: {},
            app: {
                get: jest.fn().mockReturnValue(mockIo),
            },
        };
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
        taskController = new TaskController(mockTaskService, mockNotificationService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getTasks', () => {
        it('should return all tasks', async () => {
            const tasks = [{ _id: '1', title: 'Task 1' }];
            mockTaskService.getAllTasks.mockResolvedValue(tasks);

            await taskController.getTasks(mockReq, mockRes);

            expect(mockTaskService.getAllTasks).toHaveBeenCalledWith({});
            expect(mockRes.json).toHaveBeenCalledWith(tasks);
        });
    });

    describe('createTask', () => {
        it('should create a task and emit event', async () => {
            const newTask = { _id: '1', title: 'New Task' };
            mockReq.body = newTask;
            mockTaskService.create_task.mockResolvedValue(newTask);

            await taskController.createTask(mockReq, mockRes);

            expect(mockTaskService.create_task).toHaveBeenCalledWith(newTask);
            expect(mockIo.emit).toHaveBeenCalledWith('task_created', newTask);
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });
    });

    describe('updateTask', () => {
        it('should update a task and emit event', async () => {
            const taskId = 'task123';
            const updateData = { title: 'Updated' };
            mockReq.params.id = taskId;
            mockReq.body = updateData;
            mockTaskService.updateTask.mockResolvedValue({ _id: taskId, ...updateData });

            await taskController.updateTask(mockReq, mockRes);

            expect(mockTaskService.updateTask).toHaveBeenCalledWith(taskId, updateData);
            expect(mockIo.emit).toHaveBeenCalledWith('task_updated', expect.any(Object));
        });

        it('should return 404 if task not found', async () => {
            mockTaskService.updateTask.mockResolvedValue(null);
            await taskController.updateTask(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteTask', () => {
        it('should soft delete a task and emit event', async () => {
            const taskId = 'task123';
            mockReq.params.id = taskId;
            mockTaskService.softDeleteTask.mockResolvedValue({ _id: taskId });

            await taskController.deleteTask(mockReq, mockRes);

            expect(mockTaskService.softDeleteTask).toHaveBeenCalledWith(taskId);
            expect(mockIo.emit).toHaveBeenCalledWith('task_deleted', taskId);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Task removed successfully' });
        });
    });

    describe('assignTask', () => {
        it('should assign a task and notify volunteer', async () => {
            const taskId = 'task123';
            const volunteerId = 'vol456';
            const updatedTask = { _id: taskId, assignedTo: volunteerId };
            
            mockReq.params.id = taskId;
            mockReq.body.volunteerId = volunteerId;
            mockTaskService.assignTask.mockResolvedValue(updatedTask);

            await taskController.assignTask(mockReq, mockRes);

            expect(mockTaskService.assignTask).toHaveBeenCalledWith(taskId, volunteerId);
            expect(mockNotificationService.notifyVolunteer).toHaveBeenCalledWith(volunteerId, updatedTask);
            expect(mockIo.emit).toHaveBeenCalledWith('task_updated', updatedTask);
        });
    });

    describe('completeTask', () => {
        it('should complete task and notify garbage unit', async () => {
            const taskId = 'task123';
            const updatedTask = { _id: taskId, status: 'completed' };
            mockReq.params.id = taskId;
            mockTaskService.completeTask.mockResolvedValue(updatedTask);

            await taskController.completeTask(mockReq, mockRes);

            expect(mockTaskService.completeTask).toHaveBeenCalledWith(taskId);
            expect(mockNotificationService.notifyGarbageUnit).toHaveBeenCalledWith(updatedTask);
            expect(mockIo.emit).toHaveBeenCalledWith('task_updated', updatedTask);
            expect(mockRes.json).toHaveBeenCalledWith(updatedTask);
        });
    });
});
