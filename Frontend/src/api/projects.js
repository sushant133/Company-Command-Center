import { USE_MOCK_DATA, mockProjects } from './client'
import client from './client'

export const projectsAPI = {
  getAll: async (params = {}) => {
    if (USE_MOCK_DATA) {
      let filtered = [...mockProjects]

      if (params.company && params.company !== 'all') {
        filtered = filtered.filter((p) => p.company._id === params.company)
      }

      if (params.status) {
        filtered = filtered.filter((p) => p.status === params.status)
      }

      if (params.priority) {
        filtered = filtered.filter((p) => p.priority === params.priority)
      }

      return Promise.resolve({
        projects: filtered,
        total: filtered.length,
        pages: 1,
      })
    }

    try {
      const response = await client.get('/projects', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  getById: async (id) => {
    if (USE_MOCK_DATA) {
      const project = mockProjects.find((p) => p._id === id)
      return Promise.resolve({ project })
    }

    try {
      const response = await client.get(`/projects/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  create: async (data) => {
    if (USE_MOCK_DATA) {
      const newProject = {
        _id: Date.now().toString(),
        ...data,
        entries: [],
      }
      mockProjects.push(newProject)
      return Promise.resolve({ project: newProject })
    }

    try {
      const response = await client.post('/projects', data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  update: async (id, data) => {
    if (USE_MOCK_DATA) {
      const project = mockProjects.find((p) => p._id === id)
      if (project) {
        Object.assign(project, data)
        return Promise.resolve({ project })
      }
      return Promise.reject(new Error('Project not found'))
    }

    try {
      const response = await client.put(`/projects/${id}`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  delete: async (id) => {
    if (USE_MOCK_DATA) {
      const index = mockProjects.findIndex((p) => p._id === id)
      if (index > -1) {
        mockProjects.splice(index, 1)
        return Promise.resolve({ message: 'Deleted' })
      }
      return Promise.reject(new Error('Project not found'))
    }

    try {
      const response = await client.delete(`/projects/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  addSpent: async (id, amount) => {
    if (USE_MOCK_DATA) {
      const project = mockProjects.find((p) => p._id === id)
      if (project) {
        project.budget.spent += amount
        return Promise.resolve({ project })
      }
      return Promise.reject(new Error('Project not found'))
    }

    try {
      const response = await client.post(`/projects/${id}/add-spent`, {
        amount,
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  updateProgress: async (id, progress) => {
    if (USE_MOCK_DATA) {
      const project = mockProjects.find((p) => p._id === id)
      if (project) {
        project.progress = progress
        return Promise.resolve({ project })
      }
      return Promise.reject(new Error('Project not found'))
    }

    try {
      const response = await client.put(`/projects/${id}/progress`, {
        progress,
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  updateHealth: async (id, health) => {
    if (USE_MOCK_DATA) {
      const project = mockProjects.find((p) => p._id === id)
      if (project) {
        project.health = health
        return Promise.resolve({ project })
      }
      return Promise.reject(new Error('Project not found'))
    }

    try {
      const response = await client.put(`/projects/${id}/health`, { health })
      return response.data
    } catch (error) {
      throw error
    }
  },

  updateBlockers: async (id, count) => {
    if (USE_MOCK_DATA) {
      const project = mockProjects.find((p) => p._id === id)
      if (project) {
        project.blockers = count
        return Promise.resolve({ project })
      }
      return Promise.reject(new Error('Project not found'))
    }

    try {
      const response = await client.put(`/projects/${id}/blockers`, {
        blockers: count,
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  getEntries: async (id, params = {}) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ entries: [] })
    }

    try {
      const response = await client.get(`/projects/${id}/entries`, { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  uploadAttachment: async (id, file) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        attachment: {
          url: URL.createObjectURL(file),
          fileName: file.name,
        },
      })
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await client.post(
        `/projects/${id}/upload-attachment`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  deleteAttachment: async (projectId, attachmentId) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ message: 'Deleted' })
    }

    try {
      const response = await client.delete(
        `/projects/${projectId}/attachments/${attachmentId}`
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  getStatistics: async (id) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ stats: {} })
    }

    try {
      const response = await client.get(`/projects/${id}/statistics`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  clone: async (id, data) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ project: {} })
    }

    try {
      const response = await client.post(`/projects/${id}/clone`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  archive: async (id) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ project: {} })
    }

    try {
      const response = await client.post(`/projects/${id}/archive`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  unarchive: async (id) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ project: {} })
    }

    try {
      const response = await client.post(`/projects/${id}/unarchive`)
      return response.data
    } catch (error) {
      throw error
    }
  },
}