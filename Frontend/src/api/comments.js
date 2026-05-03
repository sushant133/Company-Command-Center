import client, { unwrap } from './client'

export const commentsAPI = {
  /** GET /companies/:companyId/comments */
  list: async (companyId, params = {}) => {
    if (!companyId) throw new Error('Company ID is required')
    return unwrap(client.get(`/companies/${companyId}/comments`, { params }))
  },

  /** GET /companies/:companyId/comments/my */
  my: async (companyId, params = {}) => {
    if (!companyId) throw new Error('Company ID is required')
    return unwrap(client.get(`/companies/${companyId}/comments/my`, { params }))
  },

  /** GET /companies/:companyId/comments/:id */
  getById: async (companyId, id) => {
    if (!companyId) throw new Error('Company ID is required')
    return unwrap(client.get(`/companies/${companyId}/comments/${id}`))
  },

  /** POST /companies/:companyId/comments */
  create: async (companyId, payload) => {
    if (!companyId) throw new Error('Company ID is required')
    return unwrap(client.post(`/companies/${companyId}/comments`, payload))
  },

  /** PUT /companies/:companyId/comments/:id */
  update: async (companyId, id, payload) => {
    if (!companyId) throw new Error('Company ID is required')
    return unwrap(client.put(`/companies/${companyId}/comments/${id}`, payload))
  },

  /** DELETE /companies/:companyId/comments/:id */
  delete: async (companyId, id) => {
    if (!companyId) throw new Error('Company ID is required')
    return unwrap(client.delete(`/companies/${companyId}/comments/${id}`))
  },

  /** PUT /companies/:companyId/comments/:id/read */
  markAsRead: async (companyId, id) => {
    if (!companyId) throw new Error('Company ID is required')
    return unwrap(client.put(`/companies/${companyId}/comments/${id}/read`))
  },
}

export default commentsAPI
