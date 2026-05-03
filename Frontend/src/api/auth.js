import client, { unwrap } from './client'

export const authAPI = {
  bootstrapSuperadmin: async (payload) =>
    unwrap(client.post('/auth/bootstrap-superadmin', payload)),

  login: async (payload) => unwrap(client.post('/auth/login', payload)),

  refresh: async () => unwrap(client.post('/auth/refresh')),

  logout: async () => unwrap(client.post('/auth/logout')),

  me: async () => unwrap(client.get('/auth/me')),

  changePassword: async (payload) => unwrap(client.patch('/auth/change-password', payload)),

  forgotPassword: async (payload) => unwrap(client.post('/auth/forgot-password', payload)),

  verifyOTP: async (payload) => unwrap(client.post('/auth/verify-otp', payload)),

  resetPassword: async (payload) => unwrap(client.post('/auth/reset-password', payload)),
}
