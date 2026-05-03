import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companiesAPI } from '../api/companies'
import { showError, showSuccess } from '../store/notificationStore'

/**
 * useCompanies Hook
 * Manages company data and operations
 */
export const useCompanies = (params = {}, options = {}) => {
  const queryClient = useQueryClient()
  const {
    enabled = true,
    staleTime = 1000 * 60 * 5,
    gcTime = 1000 * 60 * 10,
  } = options

  /**
   * Fetch all companies
   */
  const {
    data: companiesData = {},
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['companies', params],
    queryFn: async () => {
      const response = await companiesAPI.getAll(params)
      return response
    },
    enabled,
    staleTime,
    gcTime,
  })

  const companies = companiesData?.companies || []
  const total = companiesData?.total || 0
  const pages = companiesData?.pages || 0

  /**
   * Create company mutation
   */
  const createMutation = useMutation({
    mutationFn: companiesAPI.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      showSuccess('Company created successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to create company')
    },
  })

  /**
   * Update company mutation
   */
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => companiesAPI.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      showSuccess('Company updated successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to update company')
    },
  })

  /**
   * Delete company mutation
   */
  const deleteMutation = useMutation({
    mutationFn: companiesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      showSuccess('Company deleted successfully!')
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete company')
    },
  })

  /**
   * Add admin mutation
   */
  const addAdminMutation = useMutation({
    mutationFn: ({ companyId, userId }) =>
      companiesAPI.addAdmin(companyId, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      showSuccess('Admin added successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to add admin')
    },
  })

  /**
   * Remove admin mutation
   */
  const removeAdminMutation = useMutation({
    mutationFn: ({ companyId, userId }) =>
      companiesAPI.removeAdmin(companyId, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      showSuccess('Admin removed successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to remove admin')
    },
  })

  /**
   * Get company by ID
   */
  const getCompanyById = async (id) => {
    try {
      const response = await companiesAPI.getById(id)
      return response.company
    } catch (error) {
      showError(error.message || 'Failed to fetch company')
      throw error
    }
  }

  /**
   * Get company analytics
   */
  const getAnalytics = async (id) => {
    try {
      const response = await companiesAPI.getAnalytics(id)
      return response.analytics
    } catch (error) {
      showError(error.message || 'Failed to fetch analytics')
      throw error
    }
  }

  /**
   * Upload company logo
   */
  const uploadLogo = useMutation({
    mutationFn: ({ id, file }) => companiesAPI.uploadLogo(id, file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      showSuccess('Logo uploaded successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to upload logo')
    },
  })

  /**
   * Export company data
   */
  const exportData = async (id, format = 'csv') => {
    try {
      const blob = await companiesAPI.exportData(id, format)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `company-${id}.${format}`
      link.click()
      URL.revokeObjectURL(url)
      showSuccess('Data exported successfully!')
    } catch (error) {
      showError(error.message || 'Failed to export data')
    }
  }

  return {
    // State
    companies,
    total,
    pages,
    isLoading,
    isFetching,
    error,

    // Mutations
    createCompany: createMutation.mutate,
    createLoading: createMutation.isPending,
    updateCompany: updateMutation.mutate,
    updateLoading: updateMutation.isPending,
    deleteCompany: deleteMutation.mutate,
    deleteLoading: deleteMutation.isPending,
    addAdmin: addAdminMutation.mutate,
    addAdminLoading: addAdminMutation.isPending,
    removeAdmin: removeAdminMutation.mutate,
    removeAdminLoading: removeAdminMutation.isPending,
    uploadLogo: uploadLogo.mutate,
    uploadLogoLoading: uploadLogo.isPending,

    // Methods
    refetch,
    getCompanyById,
    getAnalytics,
    exportData,
  }
}