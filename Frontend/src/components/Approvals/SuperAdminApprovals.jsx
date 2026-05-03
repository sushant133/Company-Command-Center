import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, MessageSquare, CheckCircle, XCircle, AlertCircle, Download, File, Trash2 } from 'lucide-react'
import { approvalsAPI } from '../../api/approvals'
import Button from '../ui/Button'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import Badge from '../ui/Badge'
import { Card, CardContent } from '../ui/Card'

export default function SuperAdminApprovals({ companyId, companies = [], onCompanyChange }) {
  const queryClient = useQueryClient()
  const [expandedId, setExpandedId] = useState(null)
  const [selectedApproval, setSelectedApproval] = useState(null)
  const [reviewText, setReviewText] = useState('')
  const [reviewStatus, setReviewStatus] = useState('approved')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [localCompanyId, setLocalCompanyId] = useState(companyId || '')

  // Update local company ID when prop changes
  useEffect(() => {
    if (companyId && companyId !== localCompanyId) {
      setLocalCompanyId(companyId)
    }
  }, [companyId, localCompanyId])

  const { data: approvals = [], isLoading, error } = useQuery({
    queryKey: ['approvals', localCompanyId, filterStatus, filterPriority],
    queryFn: () => approvalsAPI.list(localCompanyId, {
      status: filterStatus !== 'all' ? filterStatus : undefined,
      priority: filterPriority !== 'all' ? filterPriority : undefined,
      limit: 50
    }),
    enabled: !!localCompanyId,
  })

  const addReviewMutation = useMutation({
    mutationFn: ({ approvalId, review, status }) =>
      approvalsAPI.addReview(localCompanyId, approvalId, review, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      setReviewText('')
      setReviewStatus('approved')
      setSelectedApproval(null)
    },
  })

  const deleteApprovalMutation = useMutation({
    mutationFn: (approvalId) => approvalsAPI.delete(localCompanyId, approvalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      alert('Approval deleted successfully')
    },
    onError: (error) => {
      alert(`Failed to delete approval: ${error.message}`)
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

  const handleSubmitReview = (approvalId) => {
    if (!reviewText.trim()) {
      alert('Please write a review')
      return
    }
    addReviewMutation.mutate({
      approvalId,
      review: reviewText,
      status: reviewStatus
    })
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading approvals...</div>
  }

  const stats = [
    { label: 'Pending', value: approvals.filter(a => a.status === 'pending').length, color: 'blue' },
    { label: 'Under Review', value: approvals.filter(a => a.status === 'under-review').length, color: 'yellow' },
    { label: 'Approved', value: approvals.filter(a => a.status === 'approved').length, color: 'green' },
    { label: 'Rejected', value: approvals.filter(a => a.status === 'rejected').length, color: 'red' },
  ]

  return (
    <div className="space-y-6">
      {/* Company Selector */}
      {companies.length > 0 && (
        <Select
          label="Select Company"
          value={localCompanyId}
          onChange={(e) => {
            setLocalCompanyId(e.target.value)
            onCompanyChange?.(e.target.value)
          }}
        >
          {companies.map(company => (
            <option key={company._id} value={company._id}>{company.name}</option>
          ))}
        </Select>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-3xl font-bold text-${stat.color}-600 mb-1`}>{stat.value}</p>
                  <p className="text-sm font-medium text-slate-700">{stat.label}</p>
                </div>
                <div className={`p-2 rounded-full bg-${stat.color}-100`}>
                  {stat.label === 'Pending' && <AlertCircle className={`h-6 w-6 text-${stat.color}-600`} />}
                  {stat.label === 'Under Review' && <MessageSquare className={`h-6 w-6 text-${stat.color}-600`} />}
                  {stat.label === 'Approved' && <CheckCircle className={`h-6 w-6 text-${stat.color}-600`} />}
                  {stat.label === 'Rejected' && <XCircle className={`h-6 w-6 text-${stat.color}-600`} />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-950 mb-4">Filter Approvals</h3>
          <div className="flex gap-4 flex-wrap">
            <div className="min-w-[120px] sm:min-w-[180px] lg:min-w-[200px] flex-1">
              <Select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white"
              >
                <option value="pending">⏳ Pending</option>
                <option value="under-review">🔄 Under Review</option>
                <option value="approved">✅ Approved</option>
                <option value="rejected">❌ Rejected</option>
                <option value="all">📋 All Statuses</option>
              </Select>
            </div>
            <div className="min-w-[120px] sm:min-w-[180px] lg:min-w-[200px] flex-1">
              <Select
                label="Priority"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-white"
              >
                <option value="urgent">🚨 Urgent</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
                <option value="all">📊 All Priorities</option>
              </Select>
            </div>
          </div>
        </CardContent>
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

      {/* Approvals List */}
      <div className="space-y-4">
        {approvals.length === 0 && !isLoading && !error ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              No approvals found for the selected company
            </CardContent>
          </Card>
        ) : (
          approvals.map((approval) => (
            <Card key={approval._id} className="overflow-hidden">
              <div
                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
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
                      <Badge variant="outline">{approval.status}</Badge>
                      <Badge variant={getPriorityColor(approval.priority)}>
                        {approval.priority}
                      </Badge>
                      {approval.amount > 0 && (
                        <Badge variant="outline">
                          {approval.currency} {approval.amount.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${
                        expandedId === approval._id ? 'rotate-180' : ''
                      }`}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm('Are you sure you want to delete this approval?')) {
                          deleteApprovalMutation.mutate(approval._id)
                        }
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                      title="Delete approval"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {expandedId === approval._id && (
                <CardContent className="border-t border-slate-200 bg-slate-50 p-6 space-y-6">
                  {/* Request Details */}
                  <div>
                    <h4 className="font-semibold text-slate-950 mb-3">Request Details</h4>
                    <div className="grid gap-4 md:grid-cols-2 text-sm">
                      <div>
                        <p className="text-slate-600">Type</p>
                        <p className="font-medium">{approval.type}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Requested by</p>
                        <p className="font-medium">{approval.requestedBy?.name}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Created</p>
                        <p className="font-medium">
                          {new Date(approval.createdAt).toLocaleDateString()}
                        </p>
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

                  {/* Questions Section */}
                  {approval.questions && approval.questions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-950 mb-3 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Questions ({approval.questions.length})
                      </h4>
                      <div className="space-y-3">
                        {approval.questions.map((q) => (
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
                                  Answer by {q.answeredBy?.name}
                                </p>
                                <p className="text-sm text-green-900">{q.answer}</p>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 italic">Awaiting answer</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Previous Reviews */}
                  {approval.reviews && approval.reviews.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-950 mb-3">Previous Reviews</h4>
                      <div className="space-y-3">
                        {approval.reviews.map((review) => (
                          <div
                            key={review._id}
                            className={`bg-white rounded-lg p-3 border-l-4 ${
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
                                    ? 'success'
                                    : review.status === 'rejected'
                                    ? 'destructive'
                                    : 'warning'
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

                  {/* Attached Files */}
                  {approval.fileIds && approval.fileIds.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-950 mb-3 flex items-center gap-2">
                        <File className="h-4 w-4" />
                        Attached Files ({approval.fileIds.length})
                      </h4>
                      <div className="space-y-2">
                        {approval.fileIds.map((file) => (
                          <div
                            key={file._id}
                            className="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-200"
                          >
                            <div className="flex items-center gap-3">
                              <File className="h-4 w-4 text-slate-500" />
                              <div>
                                <p className="text-sm font-medium text-slate-950">{file.originalName}</p>
                                <p className="text-xs text-slate-500">
                                  {(file.size / 1024).toFixed(1)} KB • {file.mimeType}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(file.storageUrl, '_blank')}
                              className="flex items-center gap-2"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Form */}
                  {approval.status !== 'approved' && approval.status !== 'rejected' && (
                    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                      <h4 className="font-semibold text-slate-950 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        Add Review
                      </h4>
                      <div className="space-y-4">
                        <Textarea
                          label="Review Comments"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Write your detailed review and decision rationale here..."
                          rows={4}
                          className="resize-none"
                        />
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Decision
                          </label>
                          <Select
                            value={reviewStatus}
                            onChange={(e) => setReviewStatus(e.target.value)}
                            className="w-full"
                          >
                            <option value="approved">✅ Approve Request</option>
                            <option value="rejected">❌ Reject Request</option>
                            <option value="request-changes">🔄 Request Changes</option>
                          </Select>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => handleSubmitReview(approval._id)}
                            disabled={addReviewMutation.isPending || !reviewText.trim()}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200"
                          >
                            {addReviewMutation.isPending ? 'Submitting Review...' : 'Submit Review'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setReviewText('')
                              setReviewStatus('approved')
                              setSelectedApproval(null)
                            }}
                            className="px-4 py-2.5 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
