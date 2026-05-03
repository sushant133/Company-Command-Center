import api, { unwrap } from './client'

const BASE_PATH = '/companies'

export const approvalsAPI = {
  // Get all approvals for a company
  list: (companyId, filters = {}) => {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.type) params.append('type', filters.type)
    if (filters.priority) params.append('priority', filters.priority)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)

    return api.get(`${BASE_PATH}/${companyId}/approvals?${params.toString()}`)
      .then(unwrap)
      .then(data => data.approvals || [])
  },

  // Get single approval
  getById: (companyId, approvalId) =>
    api.get(`${BASE_PATH}/${companyId}/approvals/${approvalId}`)
      .then(unwrap)
      .then(data => data.approval || data),

  // Create approval request
  create: (companyId, data, files = []) => {
    if (files.length > 0) {
      const formData = new FormData()
      
      // Add form data
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key])
        }
      })
      
      // Add files
      files.forEach(fileObj => {
        formData.append('files', fileObj.file)
      })
      
      return api.post(`${BASE_PATH}/${companyId}/approvals`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(unwrap).then(data => data.approval || data)
    } else {
      return api.post(`${BASE_PATH}/${companyId}/approvals`, data)
        .then(unwrap).then(data => data.approval || data)
    }
  },

  // Update approval status
  update: (companyId, approvalId, data) =>
    api.put(`${BASE_PATH}/${companyId}/approvals/${approvalId}`, data)
      .then(unwrap).then(data => data.approval || data),

  // Delete approval
  delete: (companyId, approvalId) =>
    api.delete(`${BASE_PATH}/${companyId}/approvals/${approvalId}`)
      .then(unwrap),

  // Get statistics
  getStats: (companyId) =>
    api.get(`${BASE_PATH}/${companyId}/approvals/stats`)
      .then(unwrap).then(data => data.stats || data),

  // Add question to approval
  addQuestion: (companyId, approvalId, question) =>
    api.post(`${BASE_PATH}/${companyId}/approvals/${approvalId}/questions`, { question })
      .then(unwrap).then(data => data.approval || data),

  // Answer question in approval
  answerQuestion: (companyId, approvalId, questionId, answer) =>
    api.post(`${BASE_PATH}/${companyId}/approvals/${approvalId}/questions/${questionId}/answer`, { answer })
      .then(unwrap).then(data => data.approval || data),

  // Add review to approval
  addReview: (companyId, approvalId, review, status) =>
    api.post(`${BASE_PATH}/${companyId}/approvals/${approvalId}/reviews`, { review, status })
      .then(unwrap).then(data => data.approval || data),
}
