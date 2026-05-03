import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronDown,
  Plus,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Zap,
  TrendingUp,
  Upload,
  X,
  File,
  Download,
  Trash2,
} from 'lucide-react'
import { approvalsAPI } from '../../api/approvals'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import Badge from '../ui/Badge'
import { Card, CardContent } from '../ui/Card'

export default function AdminApprovalRequests({ companyId, userId }) {
  const queryClient = useQueryClient()
  const [expandedId, setExpandedId] = useState(null)
  const [expandedNewRequest, setExpandedNewRequest] = useState(false)
  const [questionText, setQuestionText] = useState('')
  const [selectedApprovalForQuestion, setSelectedApprovalForQuestion] = useState(null)

  const [createFormData, setCreateFormData] = useState({
    item: '',
    description: '',
    type: 'expense',
    priority: 'medium',
    amount: '',
    currency: 'NPR',
  })
  const [autoSaveStatus, setAutoSaveStatus] = useState('') // '', 'saving', 'saved'
  const [attachedFiles, setAttachedFiles] = useState([])
  const [submissionStatus, setSubmissionStatus] = useState(null) // null, 'submitting', 'submitted'

  // Auto-save draft functionality
  useEffect(() => {
    if (expandedNewRequest && (createFormData.item || attachedFiles.length > 0)) {
      setAutoSaveStatus('saving')
      const timeoutId = setTimeout(() => {
        localStorage.setItem('approvalDraft', JSON.stringify(createFormData))
        localStorage.setItem('approvalDraftFiles', JSON.stringify(attachedFiles.map(f => ({ ...f, file: null }))))
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus(''), 2000) // Clear status after 2 seconds
      }, 1000) // Auto-save after 1 second of inactivity

      return () => clearTimeout(timeoutId)
    }
  }, [createFormData, attachedFiles, expandedNewRequest])

  const { data: approvals = [], isLoading, error } = useQuery({
    queryKey: ['approvals', companyId],
    queryFn: () => approvalsAPI.list(companyId, { limit: 50 }),
    enabled: !!companyId,
  })

  // Filter approvals for user's own requests
  const userApprovals = approvals.filter((a) => a.requestedBy?._id === userId)

  const createMutation = useMutation({
    mutationFn: (data) => approvalsAPI.create(companyId, data, attachedFiles),
    onSuccess: (newApproval) => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      setSubmissionStatus('submitted')
      // Clear draft after successful submission
      localStorage.removeItem('approvalDraft')
      localStorage.removeItem('approvalDraftFiles')
      setCreateFormData({
        item: '',
        description: '',
        type: 'expense',
        priority: 'medium',
        amount: '',
        currency: 'NPR',
      })
      setAttachedFiles([])
      setExpandedNewRequest(false)
      alert('Approval request submitted successfully!')
      
      // Reset submission status after 3 seconds
      setTimeout(() => setSubmissionStatus(null), 3000)
    },
    onError: (error) => {
      console.error('Error submitting approval request:', error)
      setSubmissionStatus(null)
      alert(`Failed to submit approval request: ${error.message || 'Unknown error'}`)
    },
  })

  const addQuestionMutation = useMutation({
    mutationFn: ({ approvalId, question }) =>
      approvalsAPI.addQuestion(companyId, approvalId, question),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-approvals'] })
      setQuestionText('')
      setSelectedApprovalForQuestion(null)
    },
  })

  const deleteApprovalMutation = useMutation({
    mutationFn: (approvalId) => approvalsAPI.delete(companyId, approvalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals', companyId] })
      alert('Approval request deleted successfully!')
    },
    onError: (error) => {
      console.error('Error deleting approval:', error)
      alert(`Failed to delete approval: ${error.message || 'Unknown error'}`)
    },
  })

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'red',
      high: 'orange',
      medium: 'yellow',
      low: 'gray'
    }
    return colors[priority] || 'gray'
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <Zap className="h-4 w-4 text-red-600" />
      case 'high':
        return <TrendingUp className="h-4 w-4 text-orange-600" />
      default:
        return null
    }
  }

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50'
      case 'rejected':
        return 'bg-red-50'
      case 'under-review':
        return 'bg-yellow-50'
      case 'pending':
        return 'bg-blue-50'
      default:
        return 'bg-slate-50'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'under-review':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-blue-600" />
    }
  }

  const handleCreateApproval = () => {
    if (!createFormData.item.trim()) {
      alert('Please fill in all required fields')
      return
    }
    createMutation.mutate(createFormData)
  }

  const handleAddQuestion = () => {
    if (!questionText.trim()) {
      alert('Please write a question')
      return
    }
    addQuestionMutation.mutate({
      approvalId: selectedApprovalForQuestion,
      question: questionText,
    })
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = files.map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
    }))
    setAttachedFiles(prev => [...prev, ...newFiles])
  }

  const handleRemoveFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Group approvals by priority
  const approvalsByPriority = {
    urgent: userApprovals.filter(a => a.priority === 'urgent'),
    high: userApprovals.filter(a => a.priority === 'high'),
    medium: userApprovals.filter(a => a.priority === 'medium'),
    low: userApprovals.filter(a => a.priority === 'low'),
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading approvals...</div>
  }

  const stats = [
    { label: 'Total Requests', value: userApprovals.length, color: 'blue' },
    { label: 'Pending', value: userApprovals.filter(a => a.status === 'pending').length, color: 'gray' },
    { label: 'Under Review', value: userApprovals.filter(a => a.status === 'under-review').length, color: 'yellow' },
    { label: 'Approved', value: userApprovals.filter(a => a.status === 'approved').length, color: 'green' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
              <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Request Section */}
      <Card className={expandedNewRequest ? 'bg-blue-50 border-blue-200' : ''}>
        <div
          className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => setExpandedNewRequest(!expandedNewRequest)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Create New Request</h3>
                <p className="text-sm text-slate-600">Submit a new approval request for superadmin review</p>
                <div className="flex items-center gap-2 mt-1">
                  {localStorage.getItem('approvalDraft') && (
                    <p className="text-xs text-blue-600">📝 Draft available</p>
                  )}
                  {autoSaveStatus === 'saving' && (
                    <p className="text-xs text-amber-600">💾 Saving draft...</p>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <p className="text-xs text-green-600">✅ Draft saved</p>
                  )}
                </div>
              </div>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-slate-400 transition-transform ${
                expandedNewRequest ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {expandedNewRequest && (
          <CardContent className="border-t border-blue-200 bg-white p-6 space-y-4">
            <Input
              label="Item/Title *"
              value={createFormData.item}
              onChange={(e) =>
                setCreateFormData({ ...createFormData, item: e.target.value })
              }
              placeholder="e.g., Budget for marketing campaign"
            />

            <Textarea
              label="Description"
              value={createFormData.description}
              onChange={(e) =>
                setCreateFormData({ ...createFormData, description: e.target.value })
              }
              placeholder="Provide details about this request..."
              rows={3}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Type"
                value={createFormData.type}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, type: e.target.value })
                }
              >
                <option value="expense">Expense</option>
                <option value="budget">Budget</option>
                <option value="contract">Contract</option>
                <option value="hire">Hire</option>
                <option value="other">Other</option>
              </Select>

              <Select
                label="Priority *"
                value={createFormData.priority}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, priority: e.target.value })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Amount"
                type="number"
                value={createFormData.amount}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, amount: e.target.value })
                }
                placeholder="0"
              />

              <Select
                label="Currency"
                value={createFormData.currency}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, currency: e.target.value })
                }
              >
                <option value="NPR">NPR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </Select>
            </div>

            {/* File Upload Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Attach Files (Optional)
              </label>
              
              {/* File Input */}
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="*/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full h-12 px-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-slate-600">
                    <Upload className="h-5 w-5" />
                    <span>Click to upload files or drag and drop</span>
                  </div>
                </label>
              </div>

              {/* Attached Files List */}
              {attachedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Attached files:</p>
                  {attachedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Upload className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="flex-shrink-0 p-1 text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Premium Action Buttons */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => {
                    setExpandedNewRequest(false)
                    // Reset form to default values when cancelled
                    setCreateFormData({
                      item: '',
                      description: '',
                      type: 'expense',
                      priority: 'medium',
                      amount: '',
                      currency: 'NPR',
                    })
                    setAttachedFiles([])
                    // Clear any drafts
                    localStorage.removeItem('approvalDraft')
                    localStorage.removeItem('approvalDraftFiles')
                  }}
                  variant="outline"
                  className="px-6 py-2.5 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 font-medium"
                >
                  Cancel Request
                </Button>
                <Button
                  onClick={() => {
                    // Submit the approval request
                    if (!createFormData.item.trim()) {
                      alert('Please enter an item/title for the approval request')
                      return
                    }
                    setSubmissionStatus('submitting')
                    createMutation.mutate(createFormData)
                  }}
                  disabled={createMutation.isPending || submissionStatus === 'submitted'}
                  className={`px-6 py-2.5 transition-all duration-300 font-medium text-white ${
                    submissionStatus === 'submitted'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {submissionStatus === 'submitted'
                    ? 'Submitted'
                    : createMutation.isPending || submissionStatus === 'submitting'
                    ? 'Submitting...'
                    : 'Submit Request'}
                </Button>
                <Button
                  onClick={() => {
                    // Delete draft functionality
                    localStorage.removeItem('approvalDraft')
                    localStorage.removeItem('approvalDraftFiles')
                    setCreateFormData({
                      item: '',
                      description: '',
                      type: 'expense',
                      priority: 'medium',
                      amount: '',
                      currency: 'NPR',
                    })
                    setAttachedFiles([])
                    alert('Draft deleted successfully!')
                  }}
                  variant="destructive"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Delete Draft
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Loading and Error States */}
      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Loading approval requests...
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="py-12 text-center text-red-500">
            <p className="font-semibold">Error loading approvals</p>
            <p className="text-sm mt-2">{error.message || 'Something went wrong'}</p>
          </CardContent>
        </Card>
      )}

      {/* Total Requests Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-950">All Company Approval Requests</h3>
        
        {approvals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              No approval requests in the company yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {approvals.map((approval) => (
              <Card key={approval._id} className={`overflow-hidden ${getStatusBgColor(approval.status)}`}>
                <div
                  className="p-6 cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => setExpandedId(expandedId === approval._id ? null : approval._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-slate-900">{approval.item}</h4>
                        <Badge variant={getPriorityColor(approval.priority)} className="capitalize">
                          {approval.priority}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {approval.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{approval.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Requested by: {approval.requestedBy?.name || 'Unknown'}</span>
                        <span>{new Date(approval.createdAt).toLocaleDateString()}</span>
                        {approval.amount && <span>Amount: NPR {approval.amount}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(approval.status)}
                      {approval.requestedBy?._id === userId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm('Are you sure you want to delete this approval request? This action cannot be undone.')) {
                              deleteApprovalMutation.mutate(approval._id)
                            }
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 hover:text-red-700"
                          title="Delete approval request"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                      <ChevronDown
                        className={`h-5 w-5 text-slate-400 transition-transform ${
                          expandedId === approval._id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {expandedId === approval._id && (
                  <CardContent className="border-t border-slate-200 bg-slate-50">
                    <div className="space-y-4">
                      {/* Files Section */}
                      {approval.fileIds && approval.fileIds.length > 0 && (
                        <div>
                          <h5 className="font-medium text-slate-900 mb-2">Attached Files</h5>
                          <div className="space-y-2">
                            {approval.fileIds.map((file) => (
                              <div key={file._id} className="flex items-center gap-2 p-2 bg-white rounded border">
                                <File className="h-4 w-4 text-slate-600" />
                                <span className="text-sm text-slate-900 flex-1">{file.originalName}</span>
                                <span className="text-xs text-slate-500">
                                  {(file.size / 1024).toFixed(1)} KB
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(file.storageUrl, '_blank')}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Questions Section */}
                      {approval.questions && approval.questions.length > 0 && (
                        <div>
                          <h5 className="font-medium text-slate-900 mb-2">Questions</h5>
                          <div className="space-y-2">
                            {approval.questions.map((question, index) => (
                              <div key={index} className="p-3 bg-white rounded border">
                                <p className="text-sm text-slate-900 mb-1">
                                  <strong>{question.questioner?.name || 'Unknown'}:</strong> {question.question}
                                </p>
                                {question.answer && (
                                  <p className="text-sm text-slate-600">
                                    <strong>Answer:</strong> {question.answer}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Reviews Section */}
                      {approval.reviews && approval.reviews.length > 0 && (
                        <div>
                          <h5 className="font-medium text-slate-900 mb-2">Reviews</h5>
                          <div className="space-y-2">
                            {approval.reviews.map((review, index) => (
                              <div key={index} className="p-3 bg-white rounded border">
                                <div className="flex items-center gap-2 mb-1">
                                  {getStatusIcon(review.status)}
                                  <span className="text-sm font-medium capitalize">{review.status}</span>
                                  <span className="text-xs text-slate-500">by {review.reviewer?.name || 'Unknown'}</span>
                                </div>
                                <p className="text-sm text-slate-600">{review.review}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add Question Form */}
                      {selectedApprovalForQuestion === approval._id && (
                        <div className="space-y-3 pt-4 border-t border-slate-300">
                          <Textarea
                            label="Ask a question"
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="Write your question here..."
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAddQuestion()}
                              disabled={addQuestionMutation.isPending}
                              size="sm"
                            >
                              {addQuestionMutation.isPending ? 'Sending...' : 'Send Question'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedApprovalForQuestion(null)
                                setQuestionText('')
                              }}
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {!selectedApprovalForQuestion && (
                        <div className="pt-4 border-t border-slate-300">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedApprovalForQuestion(approval._id)}
                            size="sm"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Ask Question
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* My Requests Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-950">My Approval Requests by Priority</h3>
        
        {userApprovals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              No approval requests yet. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Urgent Priority */}
            {approvalsByPriority.urgent.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-900">Urgent Priority ({approvalsByPriority.urgent.length})</h4>
                </div>
{approvalsByPriority.urgent.map((approval) => (
                  <ApprovalCard
                    key={approval._id}
                    approval={approval}
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                    questionText={questionText}
                    setQuestionText={setQuestionText}
                    selectedApprovalForQuestion={selectedApprovalForQuestion}
                    setSelectedApprovalForQuestion={setSelectedApprovalForQuestion}
                    handleAddQuestion={handleAddQuestion}
                    addQuestionMutation={addQuestionMutation}
                    deleteApprovalMutation={deleteApprovalMutation}
                    userId={userId}
                    getStatusBgColor={getStatusBgColor}
                    getStatusIcon={getStatusIcon}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </div>
            )}

            {/* High Priority */}
            {approvalsByPriority.high.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-900">High Priority ({approvalsByPriority.high.length})</h4>
                </div>
{approvalsByPriority.high.map((approval) => (
                  <ApprovalCard
                    key={approval._id}
                    approval={approval}
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                    questionText={questionText}
                    setQuestionText={setQuestionText}
                    selectedApprovalForQuestion={selectedApprovalForQuestion}
                    setSelectedApprovalForQuestion={setSelectedApprovalForQuestion}
                    handleAddQuestion={handleAddQuestion}
                    addQuestionMutation={addQuestionMutation}
                    deleteApprovalMutation={deleteApprovalMutation}
                    userId={userId}
                    getStatusBgColor={getStatusBgColor}
                    getStatusIcon={getStatusIcon}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </div>
            )}

            {/* Medium Priority */}
            {approvalsByPriority.medium.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-yellow-900">Medium Priority ({approvalsByPriority.medium.length})</h4>
{approvalsByPriority.medium.map((approval) => (
                  <ApprovalCard
                    key={approval._id}
                    approval={approval}
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                    questionText={questionText}
                    setQuestionText={setQuestionText}
                    selectedApprovalForQuestion={selectedApprovalForQuestion}
                    setSelectedApprovalForQuestion={setSelectedApprovalForQuestion}
                    handleAddQuestion={handleAddQuestion}
                    addQuestionMutation={addQuestionMutation}
                    deleteApprovalMutation={deleteApprovalMutation}
                    userId={userId}
                    getStatusBgColor={getStatusBgColor}
                    getStatusIcon={getStatusIcon}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </div>
            )}

            {/* Low Priority */}
            {approvalsByPriority.low.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Low Priority ({approvalsByPriority.low.length})</h4>
{approvalsByPriority.low.map((approval) => (
                  <ApprovalCard
                    key={approval._id}
                    approval={approval}
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                    questionText={questionText}
                    setQuestionText={setQuestionText}
                    selectedApprovalForQuestion={selectedApprovalForQuestion}
                    setSelectedApprovalForQuestion={setSelectedApprovalForQuestion}
                    handleAddQuestion={handleAddQuestion}
                    addQuestionMutation={addQuestionMutation}
                    deleteApprovalMutation={deleteApprovalMutation}
                    userId={userId}
                    getStatusBgColor={getStatusBgColor}
                    getStatusIcon={getStatusIcon}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Approval Card Component
function ApprovalCard({
  approval,
  expandedId,
  setExpandedId,
  questionText,
  setQuestionText,
  selectedApprovalForQuestion,
  setSelectedApprovalForQuestion,
  handleAddQuestion,
  addQuestionMutation,
  deleteApprovalMutation,
  userId,
  getStatusBgColor,
  getStatusIcon,
  getPriorityColor,
}) {
  return (
    <Card className={`overflow-hidden ${getStatusBgColor(approval.status)}`}>
      <div
        className="p-6 cursor-pointer hover:opacity-75 transition-opacity"
        onClick={() => setExpandedId(expandedId === approval._id ? null : approval._id)}
      >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {getStatusIcon(approval.status)}
                <h3 className="font-semibold text-slate-950">{approval.item}</h3>
              </div>
              <p className="text-sm text-slate-600 mt-2">{approval.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge
                  variant={
                    approval.status === 'approved'
                      ? 'green'
                      : approval.status === 'rejected'
                      ? 'red'
                      : approval.status === 'under-review'
                      ? 'yellow'
                      : 'outline'
                  }
                >
                  {approval.status}
                </Badge>
                <Badge variant={getPriorityColor(approval.priority)}>
                  {approval.priority}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {approval.requestedBy?._id === userId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm('Are you sure you want to delete this approval request? This action cannot be undone.')) {
                      deleteApprovalMutation.mutate(approval._id)
                    }
                  }}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 hover:text-red-700"
                  title="Delete approval request"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
              <ChevronDown
                className={`h-5 w-5 text-slate-400 transition-transform ${
                  expandedId === approval._id ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>
      </div>

      {expandedId === approval._id && (
        <CardContent className="border-t border-slate-200 bg-white/70 p-6 space-y-6">
          {/* Details */}
          <div>
            <h4 className="font-semibold text-slate-950 mb-3">Details</h4>
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <p className="text-slate-600">Type</p>
                <p className="font-medium">{approval.type}</p>
              </div>
              <div>
                <p className="text-slate-600">Priority</p>
                <p className="font-medium capitalize">{approval.priority}</p>
              </div>
              <div>
                <p className="text-slate-600">Status</p>
                <p className="font-medium capitalize">{approval.status}</p>
              </div>
              {approval.amount > 0 && (
                <div>
                  <p className="text-slate-600">Amount</p>
                  <p className="font-medium">
                    {approval.currency} {approval.amount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Attached Files */}
          {approval.fileIds && approval.fileIds.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-950 mb-3">Attached Files</h4>
              <div className="space-y-2">
                {approval.fileIds.map((file) => (
                  <div
                    key={file._id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Upload className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {file.originalName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={file.storageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews from Superadmin */}
          {approval.reviews && approval.reviews.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-950 mb-3">Superadmin Reviews</h4>
              <div className="space-y-3">
                {approval.reviews.map((review) => (
                  <div
                            key={review._id}
                            className={`rounded-lg p-3 border-l-4 ${
                              review.status === 'approved'
                                ? 'border-l-green-500 bg-green-50'
                                : review.status === 'rejected'
                                ? 'border-l-red-500 bg-red-50'
                                : 'border-l-yellow-500 bg-yellow-50'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-slate-950 text-sm">
                                {review.reviewer?.name}
                              </p>
                              <Badge
                                variant={
                                  review.status === 'approved'
                                    ? 'green'
                                    : review.status === 'rejected'
                                    ? 'red'
                                    : 'yellow'
                                }
                              >
                                {review.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-700">{review.review}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Approval Comments */}
                  {approval.approvalComments && (
                    <div>
                      <h4 className="font-semibold text-slate-950 mb-2">Approval Comments</h4>
                      <p className="text-sm text-slate-700 bg-white rounded-lg p-3 border border-slate-200">
                        {approval.approvalComments}
                      </p>
                    </div>
                  )}

                  {/* Questions Section */}
                  <div>
                    <h4 className="font-semibold text-slate-950 mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Questions ({approval.questions?.length || 0})
                    </h4>
                    <div className="space-y-3 mb-4">
                      {approval.questions && approval.questions.length > 0 ? (
                        approval.questions.map((q) => (
                          <div
                            key={q._id}
                            className="bg-white rounded-lg p-3 border border-slate-200"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-slate-950 text-sm">
                                {q.questioner?.name}
                              </p>
                              <span className="text-xs text-slate-500">
                                {new Date(q.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 mb-2">{q.question}</p>
                            {q.answer ? (
                              <div className="bg-green-50 rounded p-2 border border-green-200">
                                <p className="text-xs font-medium text-green-700 mb-1">
                                  Your Answer
                                </p>
                                <p className="text-sm text-green-900">{q.answer}</p>
                              </div>
                            ) : (
                              <p className="text-xs text-red-600 italic">Pending your answer</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 italic">No questions yet</p>
                      )}
                    </div>

                    {/* Add Question Form */}
                    {selectedApprovalForQuestion === approval._id && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <Textarea
                          label="Ask a Question"
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          placeholder="Write your question here..."
                          rows={3}
                        />
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={handleAddQuestion}
                            disabled={addQuestionMutation.isPending}
                            icon={Send}
                            className="flex-1"
                          >
                            {addQuestionMutation.isPending ? 'Sending...' : 'Send Question'}
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedApprovalForQuestion(null)
                              setQuestionText('')
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedApprovalForQuestion !== approval._id && (
                      <Button
                        onClick={() => setSelectedApprovalForQuestion(approval._id)}
                        variant="outline"
                        icon={MessageSquare}
                        className="w-full"
                      >
                        Ask a Question
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
    </Card>
  )
}
