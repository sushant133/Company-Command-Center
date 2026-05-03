import { USE_MOCK_DATA, mockEntries } from './client'
import client from './client'

export const entriesAPI = {
  getAll: async (params = {}) => {
    if (USE_MOCK_DATA) {
      let filtered = [...mockEntries]

      if (params.company && params.company !== 'all') {
        filtered = filtered.filter((e) => e.company === params.company)
      }

      if (params.type && params.type !== 'all') {
        filtered = filtered.filter((e) => e.type === params.type)
      }

      return Promise.resolve({
        entries: filtered,
        total: filtered.length,
        pages: 1,
      })
    }

    try {
      const response = await client.get('/entries', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  getById: async (id) => {
    if (USE_MOCK_DATA) {
      const entry = mockEntries.find((e) => e._id === id)
      return Promise.resolve({ entry })
    }

    try {
      const response = await client.get(`/entries/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  create: async (data, files = null) => {
    if (USE_MOCK_DATA) {
      const newEntry = {
        _id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
        approved: false,
      }
      mockEntries.push(newEntry)
      return Promise.resolve({ entry: newEntry })
    }

    try {
      const formData = new FormData()

      Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
          if (typeof data[key] === 'object') {
            formData.append(key, JSON.stringify(data[key]))
          } else {
            formData.append(key, data[key])
          }
        }
      })

      if (files && Array.isArray(files)) {
        files.forEach((file) => {
          formData.append('files', file)
        })
      }

      const response = await client.post('/entries', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  update: async (id, data) => {
    if (USE_MOCK_DATA) {
      const entry = mockEntries.find((e) => e._id === id)
      if (entry) {
        Object.assign(entry, data)
        return Promise.resolve({ entry })
      }
      return Promise.reject(new Error('Entry not found'))
    }

    try {
      const response = await client.put(`/entries/${id}`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  approve: async (id) => {
    if (USE_MOCK_DATA) {
      const entry = mockEntries.find((e) => e._id === id)
      if (entry) {
        entry.approved = true
        return Promise.resolve({ entry })
      }
      return Promise.reject(new Error('Entry not found'))
    }

    try {
      const response = await client.post(`/entries/${id}/approve`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  reject: async (id, reason) => {
    if (USE_MOCK_DATA) {
      const entry = mockEntries.find((e) => e._id === id)
      if (entry) {
        Object.assign(entry, { approved: false, rejectionReason: reason })
        return Promise.resolve({ entry })
      }
      return Promise.reject(new Error('Entry not found'))
    }

    try {
      const response = await client.post(`/entries/${id}/reject`, { reason })
      return response.data
    } catch (error) {
      throw error
    }
  },

  downloadAttachment: async (entryId, attachmentId) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve(new Blob(['mock data']))
    }

    try {
      const response = await client.get(
        `/entries/${entryId}/attachments/${attachmentId}/download`,
        {
          responseType: 'blob',
        }
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  deleteAttachment: async (entryId, attachmentId) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ message: 'Deleted' })
    }

    try {
      const response = await client.delete(
        `/entries/${entryId}/attachments/${attachmentId}`
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  bulkApprove: async (ids) => {
    if (USE_MOCK_DATA) {
      ids.forEach((id) => {
        const entry = mockEntries.find((e) => e._id === id)
        if (entry) entry.approved = true
      })
      return Promise.resolve({ message: 'Approved', count: ids.length })
    }

    try {
      const response = await client.post('/entries/bulk-approve', { ids })
      return response.data
    } catch (error) {
      throw error
    }
  },

  bulkDelete: async (ids) => {
    if (USE_MOCK_DATA) {
      ids.forEach((id) => {
        const index = mockEntries.findIndex((e) => e._id === id)
        if (index > -1) mockEntries.splice(index, 1)
      })
      return Promise.resolve({ message: 'Deleted', count: ids.length })
    }

    try {
      const response = await client.post('/entries/bulk-delete', { ids })
      return response.data
    } catch (error) {
      throw error
    }
  },

  export: async (params = {}, format = 'csv') => {
    if (USE_MOCK_DATA) {
      const csv = 'id,title,type,status\n1,Test,Project,Active'
      return Promise.resolve(new Blob([csv], { type: 'text/csv' }))
    }

    try {
      const queryString = new URLSearchParams({ ...params, format }).toString()
      const response = await client.get(`/entries/export?${queryString}`, {
        responseType: 'blob',
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  getComments: async (id) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ comments: [] })
    }

    try {
      const response = await client.get(`/entries/${id}/comments`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  addComment: async (id, message) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ comment: { _id: Date.now(), message } })
    }

    try {
      const response = await client.post(`/entries/${id}/comments`, {
        message,
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  getActivityLog: async (id) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ activities: [] })
    }

    try {
      const response = await client.get(`/entries/${id}/activity-log`)
      return response.data
    } catch (error) {
      throw error
    }
  },
}