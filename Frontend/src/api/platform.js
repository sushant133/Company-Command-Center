import client, { unwrap } from './client'
import { commentsAPI } from './comments'

export const companiesAPI = {
  list: async () => unwrap(client.get('/companies')),
  create: async (payload) => unwrap(client.post('/companies', payload)),
  update: async (id, payload) => unwrap(client.put(`/companies/${id}`, payload)),
  delete: async (id) => unwrap(client.delete(`/companies/${id}`)),
}

export const usersAPI = {
  list: async () => unwrap(client.get('/users')),
  create: async (payload) => unwrap(client.post('/users', payload)),
  update: async (id, payload) => unwrap(client.put(`/users/${id}`, payload)),
  updateStatus: async (id, isActive) =>
    unwrap(client.patch(`/users/${id}/status`, { isActive })),
  delete: async (id) => unwrap(client.delete(`/users/${id}`)),
}

export const sectionsAPI = {
  list: async () => unwrap(client.get('/sections')),
  getById: async (id) => unwrap(client.get(`/sections/${id}`)),
  create: async (payload) => unwrap(client.post('/sections', payload)),
  update: async (id, payload) => unwrap(client.put(`/sections/${id}`, payload)),
  addField: async (sectionId, payload) =>
    unwrap(client.post(`/sections/${sectionId}/fields`, payload)),
  updateField: async (id, payload) => unwrap(client.put(`/sections/fields/${id}`, payload)),
  deleteField: async (id) => unwrap(client.delete(`/sections/fields/${id}`)),
}

export const tasksAPI = {
  list: async () => unwrap(client.get('/tasks')),
  getById: async (id) => unwrap(client.get(`/tasks/${id}`)),
  create: async (payload) => unwrap(client.post('/tasks', payload)),
  update: async (id, payload) => unwrap(client.put(`/tasks/${id}`, payload)),
  updateStatus: async (id, status) => unwrap(client.patch(`/tasks/${id}/status`, { status })),
  delete: async (id) => unwrap(client.delete(`/tasks/${id}`)),
}

export const submissionsAPI = {
  list: async () => unwrap(client.get('/submissions')),
  create: async (payload) => unwrap(client.post('/submissions', payload)),
  update: async (id, payload) => unwrap(client.put(`/submissions/${id}`, payload)),
  updateStatus: async (id, status) =>
    unwrap(client.patch(`/submissions/${id}/status`, { status })),
  delete: async (id) => unwrap(client.delete(`/submissions/${id}`)),
}

export const filesAPI = {
  list: async (companyId = null) =>
    unwrap(
      client.get('/files', {
        params: companyId ? { companyId } : undefined,
      })
    ),
  upload: async ({ file, companyId }) => {
    const formData = new FormData()
    formData.append('file', file)
    if (companyId) {
      formData.append('companyId', companyId)
    }

    return unwrap(
      client.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    )
  },
  get: async (id) => unwrap(client.get(`/files/${id}`)),
  remove: async (id) => unwrap(client.delete(`/files/${id}`)),
}

export const analyticsAPI = {
  overview: async (params) => unwrap(client.get('/analytics/overview', { params })),
  company: async (companyId, params) => unwrap(client.get(`/analytics/company/${companyId}`, { params })),
  rankings: async (params) => unwrap(client.get('/analytics/rankings', { params })),
  hr: async (params) => unwrap(client.get('/analytics/hr', { params })),
  activity: async (params) => unwrap(client.get('/analytics/activity', { params })),
}

export const aiAPI = {
  list: async () => unwrap(client.get('/ai/insights')),
  listByCompany: async (companyId) => unwrap(client.get(`/ai/insights/company/${companyId}`)),
  generate: async (payload) => unwrap(client.post('/ai/generate-insight', payload)),
  delete: async (id) => unwrap(client.delete(`/ai/insights/${id}`)),
}

export const notificationsAPI = {
  list: async () => unwrap(client.get('/notifications')),
  markAsRead: async (id) => unwrap(client.patch(`/notifications/${id}/read`)),
}

export const smartAlertsAPI = {
  list: async () => unwrap(client.get('/alerts')),
}

export const hrAPI = {
  getEmployees: async (params = {}) => unwrap(client.get('/hr/employees', { params })),
  createEmployee: async (payload) => unwrap(client.post('/hr/employees', payload)),
  getDepartments: async (params = {}) => unwrap(client.get('/hr/departments', { params })),
  createDepartment: async (payload) => unwrap(client.post('/hr/departments', payload)),
  getJobs: async (params = {}) => unwrap(client.get('/hr/jobs', { params })),
  createJob: async (payload) => unwrap(client.post('/hr/jobs', payload)),
  getReports: async (params = {}) => unwrap(client.get('/hr/reports', { params })),
  importEmployees: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return unwrap(
      client.post('/hr/import-employees', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    )
  },
}

export const taxAPI = {
  getDashboard: async (params = {}) => unwrap(client.get('/tax/dashboard', { params })),
  getFilings: async (params = {}) => unwrap(client.get('/tax/filings', { params })),
  createFiling: async (payload) => unwrap(client.post('/tax/filings', payload)),
  updateFilingStatus: async (id, payload) => unwrap(client.patch(`/tax/filings/${id}/status`, payload)),
  deleteFiling: async (id) => unwrap(client.delete(`/tax/filings/${id}`)),
  getTDS: async (params = {}) => unwrap(client.get('/tax/tds', { params })),
  autoCalculateTDS: async (payload) => unwrap(client.post('/tax/tds/auto-calculate', payload)),
  getDeductions: async (params = {}) => unwrap(client.get('/tax/deductions', { params })),
  createDeduction: async (payload) => unwrap(client.post('/tax/deductions', payload)),
  deleteDeduction: async (id) => unwrap(client.delete(`/tax/deductions/${id}`)),
  getDocuments: async (params = {}) => unwrap(client.get('/tax/documents', { params })),
  createDocument: async (payload) => unwrap(client.post('/tax/documents', payload)),
  deleteDocument: async (id) => unwrap(client.delete(`/tax/documents/${id}`)),
  getReports: async (params = {}) => unwrap(client.get('/tax/reports', { params })),
}

export { commentsAPI }
