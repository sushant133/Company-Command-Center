import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsAPI } from '../api/projects'
import { showError, showSuccess } from '../store/notificationStore'

/**
 * useProjects Hook
 * Manages project data and operations
 */
export const useProjects = (params = {}, options = {}) => {
  const queryClient = useQueryClient()
  const {
    enabled = true,
    staleTime = 1000 * 60 * 5,
    gcTime = 1000 * 60 * 10,
  } = options

  /**
   * Fetch all projects
   */
  const {
    data: projectsData = {},
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['projects', params],
    queryFn: async () => {
      const response = await projectsAPI.getAll(params)
      return response
    },
    enabled,
    staleTime,
    gcTime,
  })

  const projects = projectsData?.projects || []
  const total = projectsData?.total || 0
  const pages = projectsData?.pages || 0

  /**
   * Create project mutation
   */
  const createMutation = useMutation({
    mutationFn: projectsAPI.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      showSuccess('Project created successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to create project')
    },
  })

  /**
   * Update project mutation
   */
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => projectsAPI.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      showSuccess('Project updated successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to update project')
    },
  })

  /**
   * Delete project mutation
   */
  const deleteMutation = useMutation({
    mutationFn: projectsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      showSuccess('Project deleted successfully!')
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete project')
    },
  })

  /**
   * Update progress mutation
   */
  const updateProgressMutation = useMutation({
    mutationFn: ({ id, progress }) => projectsAPI.updateProgress(id, progress),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to update progress')
    },
  })

  /**
   * Update health status mutation
   */
  const updateHealthMutation = useMutation({
    mutationFn: ({ id, health }) => projectsAPI.updateHealth(id, health),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to update health status')
    },
  })

  /**
   * Add spent amount mutation
   */
  const addSpentMutation = useMutation({
    mutationFn: ({ id, amount }) => projectsAPI.addSpent(id, amount),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      showSuccess('Expense added successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to add expense')
    },
  })

  /**
   * Get project by ID
   */
  const getProjectById = async (id) => {
    try {
      const response = await projectsAPI.getById(id)
      return response.project
    } catch (error) {
      showError(error.message || 'Failed to fetch project')
      throw error
    }
  }

  /**
   * Upload attachment mutation
   */
  const uploadAttachmentMutation = useMutation({
    mutationFn: ({ id, file }) => projectsAPI.uploadAttachment(id, file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      showSuccess('Attachment uploaded successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to upload attachment')
    },
  })

  /**
   * Archive project mutation
   */
  const archiveMutation = useMutation({
    mutationFn: projectsAPI.archive,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      showSuccess('Project archived successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to archive project')
    },
  })

  /**
   * Clone project mutation
   */
  const cloneMutation = useMutation({
    mutationFn: ({ id, data }) => projectsAPI.clone(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      showSuccess('Project cloned successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to clone project')
    },
  })

  return {
    // State
    projects,
    total,
    pages,
    isLoading,
    isFetching,
    error,

    // Mutations
    createProject: createMutation.mutate,
    createLoading: createMutation.isPending,
    updateProject: updateMutation.mutate,
    updateLoading: updateMutation.isPending,
    deleteProject: deleteMutation.mutate,
    deleteLoading: deleteMutation.isPending,
    updateProgress: updateProgressMutation.mutate,
    updateProgressLoading: updateProgressMutation.isPending,
    updateHealth: updateHealthMutation.mutate,
    updateHealthLoading: updateHealthMutation.isPending,
    addSpent: addSpentMutation.mutate,
    addSpentLoading: addSpentMutation.isPending,
    uploadAttachment: uploadAttachmentMutation.mutate,
    uploadAttachmentLoading: uploadAttachmentMutation.isPending,
    archiveProject: archiveMutation.mutate,
    archiveLoading: archiveMutation.isPending,
    cloneProject: cloneMutation.mutate,
    cloneLoading: cloneMutation.isPending,

    // Methods
    refetch,
    getProjectById,
  }
}