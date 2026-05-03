import client, { unwrap } from './client'

export const authAPI = {
  bootstrapSuperadmin: async (payload) =>
    unwrap(client.post('/api/auth/bootstrap-superadmin', payload)),

  login: async (payload) =>
    unwrap(client.post('/api/auth/login', payload)),

  refresh: async () =>
    unwrap(client.post('/api/auth/refresh')),

  logout: async () =>
    unwrap(client.post('/api/auth/logout')),

  me: async () =>
    unwrap(client.get('/api/auth/me')),

  changePassword: async (payload) =>
    unwrap(client.patch('/api/auth/change-password', payload)),

  forgotPassword: async (payload) =>
    unwrap(client.post('/api/auth/forgot-password', payload)),

  verifyOTP: async (payload) =>
    unwrap(client.post('/api/auth/verify-otp', payload)),

  resetPassword: async (payload) =>
    unwrap(client.post('/api/auth/reset-password', payload)),
}