import { auth } from '../../middleware/auth.middleware.js';
import User from '../../models/User.js';
import { verifyToken } from '../../utils/jwt.js';
import { ApiError } from '../../utils/ApiError.js';

// Mock dependencies
jest.mock('../../models/User.js');
jest.mock('../../utils/jwt.js');

const mockReq = (overrides = {}) => ({
  headers: { authorization: 'Bearer testtoken' },
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn();
  return res;
};

const mockNext = jest.fn();

describe('Auth Middleware Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should pass auth with valid token and active user', async () => {
    const mockUser = { _id: 'user1', isActive: true, name: 'Test User' };
    verifyToken.mockReturnValue({ userId: 'user1' });
    User.findById.mockResolvedValue(mockUser);

    const req = mockReq();
    const res = mockRes();
    const next = mockNext;

    await auth(req, res, next);

    expect(verifyToken).toHaveBeenCalledWith('testtoken');
    expect(User.findById).toHaveBeenCalledWith('user1');
    expect(req.user).toBe(mockUser);
    expect(next).toHaveBeenCalled();
  });

  test('should fail without token', async () => {
    const req = mockReq({ headers: {} });
    const res = mockRes();
    const next = mockNext;

    await expect(auth(req, res, next)).rejects.toThrow(ApiError);
    expect(verifyToken).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('should fail with invalid token', async () => {
    verifyToken.mockReturnValue({ userId: 'invalid' });
    User.findById.mockResolvedValue(null);

    const req = mockReq();
    const res = mockRes();
    const next = mockNext;

    await expect(auth(req, res, next)).rejects.toThrow('Invalid or inactive user');
    expect(next).not.toHaveBeenCalled();
  });

  test('should fail with inactive user', async () => {
    const mockUser = { _id: 'user1', isActive: false };
    verifyToken.mockReturnValue({ userId: 'user1' });
    User.findById.mockResolvedValue(mockUser);

    const req = mockReq();
    const res = mockRes();
    const next = mockNext;

    await expect(auth(req, res, next)).rejects.toThrow('Invalid or inactive user');
    expect(next).not.toHaveBeenCalled();
  });
});

