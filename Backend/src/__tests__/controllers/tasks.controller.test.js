// Basic task controller unit tests (focus on validation & logic)
import * as tasksController from '../../controllers/tasks.controller.js';
import Task from '../../models/Task.js';
import Company from '../../models/Company.js';
import { ApiError } from '../../utils/ApiError.js';

// Mock asyncHandler wrapper for testing
const mockAsyncHandler = (fn) => fn;

describe('Tasks Controller Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createTask should validate input', async () => {
    const req = {
      body: { title: '', companyIds: [] },
      user: { _id: 'user1' },
      files: []
    };

    await expect(mockAsyncHandler(tasksController.createTask)(req, {}, () => {})).rejects.toThrow(ApiError);
  });

  test('getTasks should filter by company for non-superadmin', async () => {
    Task.find.mockResolvedValue([]);

    const req = { user: { role: 'admin', companyId: 'company1' } };
    await mockAsyncHandler(tasksController.getTasks)(req, {}, () => {});

    expect(Task.find).toHaveBeenCalledWith({ companyIds: 'company1' });
  });

  test('getTaskById should return 404 for non-existent task', async () => {
    Task.findById.mockResolvedValue(null);

    const req = { params: { id: 'nonexistent' }, user: { role: 'superadmin' } };
    await expect(mockAsyncHandler(tasksController.getTaskById)(req, {}, () => {})).rejects.toThrow(ApiError);
  });

  test('updateTaskStatus should update status', async () => {
    const mockTask = { _id: 'task1', status: 'pending', save: jest.fn().mockResolvedValue({}) };
    Task.findById.mockResolvedValue(mockTask);

    const req = { params: { id: 'task1' }, body: { status: 'completed' }, user: { companyId: 'company1', role: 'admin' } };
    const res = { json: jest.fn() };

    await mockAsyncHandler(tasksController.updateTaskStatus)(req, res, () => {});

    expect(mockTask.status).toBe('completed');
    expect(mockTask.save).toHaveBeenCalled();
  });
});

