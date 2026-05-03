import request from 'supertest';
import app from '../../../app.js';  // Import your main app
import mongoose from 'mongoose';

// Note: Full integration requires running server - these are API endpoint tests
// Server should be started in test environment with test DB

describe('AI Chat Integration Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Create test user and get token (mock login)
    // In full setup, this would create real user
    authToken = 'Bearer test-jwt-token'; // Would be generated from login test
  });

  test('should respond to /api/ai/chat with auth', async () => {
    const response = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', authToken)
      .send({ message: 'hello' })
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('content');
    expect(response.body.data.content).toContain('AI Chatbot');
  });

  test('should reject /api/ai/chat without auth', async () => {
    await request(app)
      .post('/api/ai/chat')
      .send({ message: 'hello' })
      .expect(401)
      .expect(res => {
        expect(res.body).toHaveProperty('message', 'Authentication token is required');
      });
  });

  test('should handle company query', async () => {
    const response = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', authToken)
      .send({ message: 'show companies' })
      .expect(200);

    expect(response.body.data.content).toContain('Companies');
  });
});

