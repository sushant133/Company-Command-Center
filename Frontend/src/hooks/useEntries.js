import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { entriesAPI } from '../api/entries'
import { showError, showSuccess } from '../store/notificationStore'

/**
 * useEntries Hook
 * Manages entry data and operations
 */
export const useEntries = (params = {}, options = {}) => {
  const queryClient = useQueryClient()
  const {
    enabled = true,
    staleTime = 1000 * 60 * 5,
    gcTime = 1000 * 60 * 10,
  } = options

  /**
   * Fetch all entries
   */
  const {
    data: entriesData = {},
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['entries', params],
    queryFn: async () => {
      const response = await entriesAPI.getAll(params)
      return response
    },
    enabled,
    staleTime,
    gcTime,
  })

  const entries = entriesData?.entries || []
  const total = entriesData?.total || 0
  const pages = entriesData?.pages || 0

  /**
   * Create entry mutation
   */
  const createMutation = useMutation({
    mutationFn: ({ data, files }) => entriesAPI.create(data, files),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      showSuccess('Entry created successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to create entry')
    },
  })

  /**
   * Update entry mutation
   */
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => entriesAPI.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      showSuccess('Entry updated successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to update entry')
    },
  })

  /**
   * Delete entry mutation
   */
  const deleteMutation = useMutation({
    mutationFn: entriesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      showSuccess('Entry deleted successfully!')
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete entry')
    },
  })

  /**
   * Approve entry mutation
   */
  const approveMutation = useMutation({
    mutationFn: entriesAPI.approve,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      showSuccess('Entry approved successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to approve entry')
    },
  })

  /**
   * Reject entry mutation
   */
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => entriesAPI.reject(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      showSuccess('Entry rejected successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to reject entry')
    },
  })

  /**
   * Bulk approve mutation
   */
  const bulkApproveMutation = useMutation({
    mutationFn: entriesAPI.bulkApprove,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      showSuccess(`${data.count} entries approved successfully!`)
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to bulk approve entries')
    },
  })

  /**
   * Get entry by ID
   */
  const getEntryById = async (id) => {
    try {
      const response = await entriesAPI.getById(id)
      return response.entry
    } catch (error) {
      showError(error.message || 'Failed to fetch entry')
      throw error
    }
  }

  /**
   * Export entries
   */
  const exportEntries = async (exportParams = {}, format = 'csv') => {
    try {
      const blob = await entriesAPI.export(exportParams, format)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `entries.${format}`
      link.click()
      URL.revokeObjectURL(url)
      showSuccess('Data exported successfully!')
    } catch (error) {
      showError(error.message || 'Failed to export data')
    }
  }

  /**
   * Download attachment
   */
  const downloadAttachment = async (entryId, attachmentId, fileName) => {
    try {
      const blob = await entriesAPI.downloadAttachment(entryId, attachmentId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || 'attachment'
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      showError(error.message || 'Failed to download attachment')
    }
  }

  return {
    // State
    entries,
    total,
    pages,
    isLoading,
    isFetching,
    error,

    // Mutations
    createEntry: createMutation.mutate,
    createLoading: createMutation.isPending,
    updateEntry: updateMutation.mutate,
    updateLoading: updateMutation.isPending,
    deleteEntry: deleteMutation.mutate,
    deleteLoading: deleteMutation.isPending,
    approveEntry: approveMutation.mutate,
    approveLoading: approveMutation.isPending,
    rejectEntry: rejectMutation.mutate,
    rejectLoading: rejectMutation.isPending,
    bulkApproveEntries: bulkApproveMutation.mutate,
    bulkApproveLoading: bulkApproveMutation.isPending,

    // Methods
    refetch,
    getEntryById,
    exportEntries,
    downloadAttachment,
  }
}