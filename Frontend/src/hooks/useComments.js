import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsAPI } from '../api/comments'
import { showError, showSuccess } from '../store/notificationStore'

/**
 * useComments Hook
 * Manages comment data and operations
 */
export const useComments = (params = {}, options = {}) => {
  const queryClient = useQueryClient()
  const {
    enabled = true,
    staleTime = 1000 * 60 * 5,
    gcTime = 1000 * 60 * 10,
  } = options

  /**
   * Fetch all comments
   */
  const {
    data: commentsData = {},
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['comments', params],
    queryFn: async () => {
      const response = await commentsAPI.getAll(params)
      return response
    },
    enabled,
    staleTime,
    gcTime,
  })

  const comments = commentsData?.comments || []
  const total = commentsData?.total || 0
  const pages = commentsData?.pages || 0

  /**
   * Create comment mutation
   */
  const createMutation = useMutation({
    mutationFn: commentsAPI.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      showSuccess('Comment posted successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to post comment')
    },
  })

  /**
   * Update comment mutation
   */
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => commentsAPI.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      showSuccess('Comment updated successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to update comment')
    },
  })

  /**
   * Delete comment mutation
   */
  const deleteMutation = useMutation({
    mutationFn: commentsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      showSuccess('Comment deleted successfully!')
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete comment')
    },
  })

  /**
   * Mark as read mutation
   */
  const markAsReadMutation = useMutation({
    mutationFn: commentsAPI.markAsRead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      return data
    },
    onError: (error) => {
      console.error('Failed to mark as read:', error)
    },
  })

  /**
   * Reply to comment mutation
   */
  const replyMutation = useMutation({
    mutationFn: ({ id, message }) => commentsAPI.reply(id, message),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      showSuccess('Reply posted successfully!')
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to post reply')
    },
  })

  /**
   * Add reaction mutation
   */
  const addReactionMutation = useMutation({
    mutationFn: ({ id, emoji }) => commentsAPI.addReaction(id, emoji),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      return data
    },
    onError: (error) => {
      showError(error.message || 'Failed to add reaction')
    },
  })

  /**
   * Fetch notifications
   */
  const {
    data: notificationsData = {},
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await commentsAPI.getNotifications()
      return response
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  })

  const notifications = notificationsData?.notifications || []
  const unreadCount = notificationsData?.unread || 0

  /**
   * Get comments for target
   */
  const getForTarget = async (targetType, targetId) => {
    try {
      const response = await commentsAPI.getForTarget(targetType, targetId)
      return response.comments
    } catch (error) {
      showError(error.message || 'Failed to fetch comments')
      throw error
    }
  }

  /**
   * Search comments
   */
  const searchComments = async (searchParams) => {
    try {
      const response = await commentsAPI.search(searchParams)
      return response.comments
    } catch (error) {
      showError(error.message || 'Failed to search comments')
      throw error
    }
  }

  /**
   * Mark all as read
   */
  const markAllAsRead = async () => {
    try {
      await commentsAPI.markAllAsRead()
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      showSuccess('All notifications marked as read!')
    } catch (error) {
      showError(error.message || 'Failed to mark all as read')
    }
  }

  return {
    // State
    comments,
    total,
    pages,
    isLoading,
    isFetching,
    error,

    // Notifications
    notifications,
    unreadCount,
    notificationsLoading,

    // Mutations
    createComment: createMutation.mutate,
    createLoading: createMutation.isPending,
    updateComment: updateMutation.mutate,
    updateLoading: updateMutation.isPending,
    deleteComment: deleteMutation.mutate,
    deleteLoading: deleteMutation.isPending,
    markAsRead: markAsReadMutation.mutate,
    replyComment: replyMutation.mutate,
    replyLoading: replyMutation.isPending,
    addReaction: addReactionMutation.mutate,

    // Methods
    refetch,
    refetchNotifications,
    getForTarget,
    searchComments,
    markAllAsRead,
  }
}