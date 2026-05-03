import { USE_MOCK_DATA, mockCompanies } from './client'
import client from './client'

export const companiesAPI = {
  getAll: async (params = {}) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        companies: mockCompanies,
        total: mockCompanies.length,
        pages: 1,
      })
    }

    try {
      const response = await client.get('/companies', { params })
      return response.data
    } catch (error) {
      throw error
    }
  },

  getById: async (id) => {
    if (USE_MOCK_DATA) {
      const company = mockCompanies.find((c) => c._id === id)
      return Promise.resolve({ company })
    }

    try {
      const response = await client.get(`/companies/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  create: async (data) => {
    if (USE_MOCK_DATA) {
      const newCompany = {
        _id: Date.now().toString(),
        ...data,
        admins: [],
        analytics: {
          totalProjects: 0,
          activeProjects: 0,
          totalBudget: 0,
          totalSpent: 0,
          projectsAtRisk: 0,
        },
      }
      mockCompanies.push(newCompany)
      return Promise.resolve({ company: newCompany })
    }

    try {
      const response = await client.post('/companies', data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  update: async (id, data) => {
    if (USE_MOCK_DATA) {
      const company = mockCompanies.find((c) => c._id === id)
      if (company) {
        Object.assign(company, data)
        return Promise.resolve({ company })
      }
      return Promise.reject(new Error('Company not found'))
    }

    try {
      const response = await client.put(`/companies/${id}`, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  delete: async (id) => {
    if (USE_MOCK_DATA) {
      const index = mockCompanies.findIndex((c) => c._id === id)
      if (index > -1) {
        mockCompanies.splice(index, 1)
        return Promise.resolve({ message: 'Deleted' })
      }
      return Promise.reject(new Error('Company not found'))
    }

    try {
      const response = await client.delete(`/companies/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  addAdmin: async (companyId, userId) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ company: mockCompanies[0] })
    }

    try {
      const response = await client.post(`/companies/${companyId}/add-admin`, {
        userId,
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  removeAdmin: async (companyId, userId) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ company: mockCompanies[0] })
    }

    try {
      const response = await client.post(
        `/companies/${companyId}/remove-admin`,
        { userId }
      )
      return response.data
    } catch (error) {
      throw error
    }
  },

  getAnalytics: async (id) => {
    if (USE_MOCK_DATA) {
      const company = mockCompanies.find((c) => c._id === id)
      return Promise.resolve({ analytics: company?.analytics || {} })
    }

    try {
      const response = await client.get(`/companies/${id}/analytics`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  updateSettings: async (id, settings) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ company: mockCompanies[0] })
    }

    try {
      const response = await client.put(`/companies/${id}/settings`, {
        settings,
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  getAdmins: async (id) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ admins: [] })
    }

    try {
      const response = await client.get(`/companies/${id}/admins`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  getProjects: async (id, params = {}) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ projects: [] })
    }

    try {
      const response = await client.get(`/companies/${id}/projects`, {
        params,
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  uploadLogo: async (id, file) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({ company: mockCompanies[0] })
    }

    try {
      const formData = new FormData()
      formData.append('logo', file)
      const response = await client.post(
        `/companies/${id}/upload-logo`,
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

  exportData: async (id, format = 'csv') => {
    if (USE_MOCK_DATA) {
      // Return mock CSV data
      const csv = 'id,name,status\n1,Test,Active'
      return Promise.resolve(new Blob([csv], { type: 'text/csv' }))
    }

    try {
      const response = await client.get(
        `/companies/${id}/export?format=${format}`,
        {
          responseType: 'blob',
        }
      )
      return response.data
    } catch (error) {
      throw error
    }
  },
}