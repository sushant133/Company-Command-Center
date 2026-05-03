import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from './ui/Card'
import Badge from './ui/Badge'
import Button from './ui/Button'
import Input from './ui/Input'
import Textarea from './ui/Textarea'
import Select from './ui/Select'
import { Modal } from './ui/Modal'
import { Surface } from './app/AppShell'
import { Search, Send, Reply, MessageSquare, AlertCircle, Plus } from 'lucide-react'
import { commentsAPI } from '../api/comments'

/**
 * CommentsModule Component
 * Displays comments/messages with filtering, search, reply, and NEW MESSAGE compose functionality
 * Accepts isSuperAdmin prop to conditionally render company-level features
 */
export default function CommentsModule({ isSuperAdmin = false, user = {}, companies = [] }) {
  const queryClient = useQueryClient()

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, sent, read, responded
  const [companyFilter, setCompanyFilter] = useState('') // for superadmin only

  // Reply state
  const [selectedComment, setSelectedComment] = useState(null)
  const [replyText, setReplyText] = useState('')

  // Compose (New Message) state
  const [showCompose, setShowCompose] = useState(false)
  const [composeText, setComposeText] = useState('')
  const [composeCompanyId, setComposeCompanyId] = useState('')
  const [composePriority, setComposePriority] = useState('medium')
  const [composeType, setComposeType] = useState('general')

  // Toast state
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success') // success | error

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Determine active company ID for API calls
  const activeCompanyId = isSuperAdmin
    ? (companyFilter || companies[0]?._id || '')
    : (user?.companyId || '')

  // Fetch comments from API
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', activeCompanyId, statusFilter],
    queryFn: async () => {
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      return commentsAPI.list(activeCompanyId, params)
    },
    enabled: !!activeCompanyId,
    staleTime: 30000, // 30 seconds
  })

  const comments = commentsData?.comments || []

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Create new message
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const companyId = isSuperAdmin ? (composeCompanyId || companies[0]?._id) : user?.companyId
      if (!companyId) throw new Error('Company ID is required')
      return commentsAPI.create(companyId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      setShowCompose(false)
      resetComposeForm()
      showToast('Message sent successfully!', 'success')
    },
    onError: (error) => {
      showToast(`Error: ${error.message}`, 'error')
    },
  })

  // Reply to existing message
  const replyMutation = useMutation({
    mutationFn: async ({ commentId, message }) => {
      // Update original comment status to 'responded'
      await commentsAPI.update(activeCompanyId, commentId, { status: 'responded' })
      // Create reply comment
      return commentsAPI.create(activeCompanyId, {
        message,
        priority: 'medium',
        type: 'general',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      setSelectedComment(null)
      setReplyText('')
      showToast('Reply sent successfully!', 'success')
    },
    onError: (error) => {
      showToast(`Error: ${error.message}`, 'error')
    },
  })

  // ============================================================================
  // HELPERS
  // ============================================================================

  const showToast = (message, type = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setTimeout(() => {
      setToastMessage('')
      setToastType('success')
    }, 3000)
  }

  const resetComposeForm = () => {
    setComposeText('')
    setComposeCompanyId('')
    setComposePriority('medium')
    setComposeType('general')
  }

  // ============================================================================
  // FILTERING & SEARCH LOGIC
  // ============================================================================

  const filteredComments = useMemo(() => {
    let result = [...comments]

    // Status filter (already handled by API, but double-filter for safety)
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter)
    }

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        c =>
          (c.message && c.message.toLowerCase().includes(searchLower)) ||
          (c.companyId?.name && c.companyId.name.toLowerCase().includes(searchLower)) ||
          (c.fromUserId?.name && c.fromUserId.name.toLowerCase().includes(searchLower))
      )
    }

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [comments, search, statusFilter])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSendNewMessage = async () => {
    if (!composeText.trim()) return

    const payload = {
      message: composeText,
      priority: composePriority,
      type: composeType,
    }

    // For superadmin, include the selected company
    if (isSuperAdmin && composeCompanyId) {
      payload.companyId = composeCompanyId
    }

    createMutation.mutate(payload)
  }

  const handleReply = async () => {
    if (!replyText.trim() || !selectedComment) return
    replyMutation.mutate({ commentId: selectedComment._id, message: replyText })
  }

  const handleOpenReplyModal = comment => {
    setSelectedComment(comment)
    setReplyText('')
  }

  const handleCloseReplyModal = () => {
    setSelectedComment(null)
    setReplyText('')
  }

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const getStatusColor = status => {
    switch (status) {
      case 'sent':
        return 'bg-sky-50 text-sky-700 border-sky-200'
      case 'read':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'responded':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200'
    }
  }

  const getStatusLabel = status => {
    switch (status) {
      case 'sent':
        return 'Unread'
      case 'read':
        return 'Read'
      case 'responded':
        return 'Responded'
      default:
        return 'Sent'
    }
  }

  const formatDate = dateString => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  const unreadCount = comments.filter(c => c.status === 'sent').length

  return (
    <div className="space-y-6">
      {/* Toast Message */}
      {toastMessage && (
        <div className={`rounded-[1.25rem] border px-4 py-3 text-sm animate-in ${
          toastType === 'error'
            ? 'border-rose-200 bg-rose-50 text-rose-700'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            {isSuperAdmin ? 'Stakeholder Conversations' : 'Messages'}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isSuperAdmin
              ? 'View and respond to comments from all companies'
              : 'Messages from superadmin and communication history'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge className="bg-sky-50 text-sky-700 border-sky-200">
              <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
              {unreadCount} Unread
            </Badge>
          )}
          {/* NEW MESSAGE BUTTON */}
          <Button
            onClick={() => setShowCompose(true)}
            className="gap-2 rounded-xl"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            {isSuperAdmin ? 'New Message' : 'Message Superadmin'}
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Surface title="Search & Filter" eyebrow="Find conversations">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by keyword, company, or sender..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 rounded-xl"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl"
          >
            <option value="all">All Status</option>
            <option value="sent">Unread</option>
            <option value="read">Read</option>
            <option value="responded">Responded</option>
          </Select>

          {/* Company Filter (Superadmin only) */}
          {isSuperAdmin && (
            <Select
              value={companyFilter}
              onChange={e => setCompanyFilter(e.target.value)}
              className="rounded-xl"
            >
              <option value="">All Companies</option>
              {companies.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}

          {/* Clear Filters Button */}
          <Button
            variant="outline"
            onClick={() => {
              setSearch('')
              setStatusFilter('all')
              setCompanyFilter('')
            }}
            className="rounded-xl"
            size="sm"
          >
            Reset Filters
          </Button>
        </div>
      </Surface>

      {/* Comments List */}
      <Surface
        title={`Messages (${filteredComments.length})`}
        eyebrow={isSuperAdmin ? 'All Companies' : 'Your Messages'}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 px-4">
            <MessageSquare className="h-10 w-10 text-slate-300 mb-3" />
            <h3 className="text-sm font-semibold text-slate-700 mb-1">
              {search ? 'No messages match your search' : 'No messages yet'}
            </h3>
            <p className="text-xs text-slate-500">
              {search
                ? 'Try adjusting your filters or search terms'
                : 'Click "New Message" to start a conversation'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredComments.map(comment => (
              <Card
                key={comment._id}
                className={`rounded-xl border ${
                  comment.status === 'sent'
                    ? 'border-sky-200 bg-sky-50/40'
                    : 'border-slate-200 bg-white/80'
                } transition-colors hover:border-slate-300`}
              >
                <CardContent className="p-4">
                  {/* Comment Header */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <p className="font-semibold text-slate-950">
                          {comment.fromUserId?.name || 'Unknown'}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {comment.fromUserId?.role || 'User'}
                        </Badge>
                        {isSuperAdmin && comment.companyId?.name && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-slate-100 text-slate-700 border-slate-200"
                          >
                            {comment.companyId.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(comment.status)}`}>
                      {getStatusLabel(comment.status)}
                    </Badge>
                  </div>

                  {/* Message Content */}
                  <div className="mb-4 rounded-lg bg-white/80 p-3 border border-slate-200/50">
                    <p className="text-sm text-slate-700 leading-relaxed">{comment.message}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    {comment.status === 'sent' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Mark as read
                          commentsAPI.markAsRead(activeCompanyId, comment._id)
                            .then(() => queryClient.invalidateQueries({ queryKey: ['comments'] }))
                            .catch(() => {})
                        }}
                        className="gap-2 rounded-lg"
                      >
                        Mark as Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenReplyModal(comment)}
                      className="gap-2 rounded-lg"
                    >
                      <Reply className="h-4 w-4" />
                      Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Surface>

      {/* Compose New Message Modal */}
      <Modal
        isOpen={showCompose}
        onClose={() => {
          setShowCompose(false)
          resetComposeForm()
        }}
        title={isSuperAdmin ? 'New Company Message' : 'Message to Superadmin'}
        size="lg"
      >
        <div className="space-y-4">
          {/* Company Selector (Superadmin only) */}
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-semibold text-slate-950 mb-2">
                Select Company *
              </label>
              <Select
                value={composeCompanyId}
                onChange={e => setComposeCompanyId(e.target.value)}
                className="rounded-xl"
              >
                <option value="">Choose a company...</option>
                {companies.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Priority & Type */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-950 mb-2">
                Priority
              </label>
              <Select
                value={composePriority}
                onChange={e => setComposePriority(e.target.value)}
                className="rounded-xl"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-950 mb-2">
                Type
              </label>
              <Select
                value={composeType}
                onChange={e => setComposeType(e.target.value)}
                className="rounded-xl"
              >
                <option value="general">General</option>
                <option value="instruction">Instruction</option>
                <option value="followup">Follow-up</option>
                <option value="approval">Approval</option>
              </Select>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-sm font-semibold text-slate-950 mb-2">
              Your Message *
            </label>
            <Textarea
              value={composeText}
              onChange={e => setComposeText(e.target.value)}
              placeholder="Write your message here..."
              className="rounded-xl min-h-32 p-3 border border-slate-200 bg-white"
            />
            <p className="mt-1 text-xs text-slate-500">
              {composeText.length}/500 characters
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCompose(false)
                resetComposeForm()
              }}
              disabled={createMutation.isPending}
              className="flex-1 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendNewMessage}
              disabled={!composeText.trim() || createMutation.isPending || (isSuperAdmin && !composeCompanyId)}
              className="flex-1 gap-2 rounded-lg"
            >
              <Send className="h-4 w-4" />
              {createMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reply Modal */}
      <Modal
        isOpen={!!selectedComment}
        onClose={handleCloseReplyModal}
        title="Reply to Message"
        size="lg"
      >
        {selectedComment && (
          <div className="space-y-4">
            {/* Original Message Info */}
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <div className="mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  From
                </p>
                <p className="font-medium text-slate-950">
                  {selectedComment.fromUserId?.name || 'Unknown'}
                </p>
                {isSuperAdmin && (
                  <p className="text-sm text-slate-600">
                    {selectedComment.companyId?.name || ''}
                  </p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Original Message
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedComment.message}
                </p>
              </div>
            </div>

            {/* Reply Textarea */}
            <div>
              <label className="block text-sm font-semibold text-slate-950 mb-2">
                Your Reply *
              </label>
              <Textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write your reply here..."
                className="rounded-xl min-h-32 p-3 border border-slate-200 bg-white"
              />
              <p className="mt-1 text-xs text-slate-500">
                {replyText.length}/500 characters
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleCloseReplyModal}
                disabled={replyMutation.isPending}
                className="flex-1 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReply}
                disabled={!replyText.trim() || replyMutation.isPending}
                className="flex-1 gap-2 rounded-lg"
              >
                <Send className="h-4 w-4" />
                {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
