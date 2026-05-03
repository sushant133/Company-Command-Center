import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BellRing,
  Bot,
  Briefcase,
  Building2,
  ClipboardCheck,
  DollarSign,
  Files,
  LayoutDashboard,
  Send,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react'
import {
  aiAPI,
  analyticsAPI,
  filesAPI,
  notificationsAPI,
  sectionsAPI,
  submissionsAPI,
  tasksAPI,
} from '../api/platform'
import AppShell, { EmptyPanel, MetricCard, Surface } from '../components/app/AppShell'
import DynamicFieldRenderer from '../components/app/DynamicFieldRenderer'
import Badge from '../components/ui/Badge'
import { ConfirmDialog } from '../components/ui/Modal'
import Toast from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import { Card, CardContent } from '../components/ui/Card'
import AdminApprovalRequests from '../components/Approvals/AdminApprovalRequests'
import HRModule from '../components/HRModule'
import FinanceModule from '../components/FinanceModule'
import CommentsModule from '../components/CommentsModule'
import { useAuth } from '../hooks/useAuth'
import { useOffline } from '../hooks/useOffline'
import { useRealtime } from '../hooks/useRealtime'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, description: 'Company command view' },
  { id: 'approvals', label: 'Approvals', icon: Briefcase, description: 'Request & track approvals' },
  { id: 'tasks', label: 'Tasks', icon: ClipboardCheck, description: 'Assigned instructions' },
  { id: 'submit', label: 'Submit update', icon: Send, description: 'Dynamic response center' },
  { id: 'submissions', label: 'History', icon: Briefcase, description: 'Submitted records' },
  { id: 'files', label: 'Files', icon: Files, description: 'Documents and uploads' },
  { id: 'hr', label: 'HR', icon: Users, description: 'Team and people insights' },
  { id: 'budget', label: 'Finance', icon: DollarSign, description: 'Financial tracking' },
  { id: 'ai', label: 'AI insights', icon: Bot, description: 'Company intelligence' },
  { id: 'comments', label: 'Messages', icon: Sparkles, description: 'Stakeholder communication' },
  { id: 'notifications', label: 'Notifications', icon: BellRing, description: 'Admin signal feed' },
]

export default function AdminWorkspace() {
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()
  const { connected } = useRealtime()
  const [activeView, setActiveView] = useState('overview')
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [formValues, setFormValues] = useState({})
  const [uploadedFields, setUploadedFields] = useState({})
  const [uploadingKey, setUploadingKey] = useState(null)
  const [submissionNote, setSubmissionNote] = useState('')
  const [surfaceError, setSurfaceError] = useState('')
  const [deleteModal, setDeleteModal] = useState({ open: false, type: '', id: '', name: '' })
  const [toast, setToast] = useState(null)

  const tasksQuery = useQuery({ queryKey: ['tasks'], queryFn: tasksAPI.list })
  const submissionsQuery = useQuery({ queryKey: ['submissions'], queryFn: submissionsAPI.list })
  const notificationsQuery = useQuery({ queryKey: ['notifications'], queryFn: notificationsAPI.list })
  const filesQuery = useQuery({
    queryKey: ['files', user?.companyId],
    queryFn: () => filesAPI.list(user.companyId),
    enabled: Boolean(user?.companyId),
  })
  const insightsQuery = useQuery({
    queryKey: ['insights', user?.companyId],
    queryFn: () => aiAPI.listByCompany(user.companyId),
    enabled: Boolean(user?.companyId),
  })
  const companyAnalyticsQuery = useQuery({
    queryKey: ['company-analytics', user?.companyId],
    queryFn: () => analyticsAPI.company(user.companyId),
    enabled: Boolean(user?.companyId),
  })

  const tasks = tasksQuery.data || []
  const submissions = submissionsQuery.data || []
  const notifications = notificationsQuery.data || []
  const files = filesQuery.data || []
  const insights = insightsQuery.data || []
  const companyAnalytics = companyAnalyticsQuery.data || {}
  const unreadNotifications = notifications.filter((item) => !item.isRead).length

  const selectedTask = tasks.find((task) => task._id === selectedTaskId) || tasks[0] || null
  const selectedSectionId = selectedTask?.sectionId?._id || ''

  const sectionDetailQuery = useQuery({
    queryKey: ['admin-section-detail', selectedSectionId],
    queryFn: () => sectionsAPI.getById(selectedSectionId),
    enabled: Boolean(selectedSectionId),
  })

  const submitMutation = useMutation({
    mutationFn: submissionsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setFormValues({})
      setUploadedFields({})
      setSubmissionNote('')
      setSurfaceError('')
    },
    onError: (error) => setSurfaceError(error.message),
  })

  const taskStatusMutation = useMutation({
    mutationFn: ({ id, status }) => tasksAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setSurfaceError('')
    },
    onError: (error) => setSurfaceError(error.message),
  })

  const markNotificationMutation = useMutation({
    mutationFn: notificationsAPI.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
  const deleteTaskMutation = useMutation({
    mutationFn: tasksAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setToast({ type: 'success', message: 'Task deleted successfully' })
      setDeleteModal({ open: false, type: '', id: '', name: '' })
    },
    onError: (error) => {
      setToast({ type: 'error', message: error.message || 'Failed to delete task' })
      setDeleteModal({ open: false, type: '', id: '', name: '' })
    },
  })

  const deleteFileMutation = useMutation({
    mutationFn: filesAPI.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', user?.companyId] })
      setToast({ type: 'success', message: 'File deleted successfully' })
      setDeleteModal({ open: false, type: '', id: '', name: '' })
    },
    onError: (error) => {
      setToast({ type: 'error', message: error.message || 'Failed to delete file' })
      setDeleteModal({ open: false, type: '', id: '', name: '' })
    },
  })


  const handleDelete = (type, id, name) => {
    setDeleteModal({ open: true, type, id, name })
  }

  const confirmDelete = () => {
    const { type, id } = deleteModal
    if (!type || !id) return
    if (type === 'task') deleteTaskMutation.mutate(id)
    else if (type === 'file') deleteFileMutation.mutate(id)
  }
  const { isOnline, createOfflineAction } = useOffline()

  const handleSubmit = async (payload) => {
    if (!isOnline) {
      createOfflineAction('create-submission', { ...payload, companyId: user.companyId }, 'submissions')
      setSurfaceError('You are offline. Submission will be synced once you reconnect.')
      setFormValues({})
      setUploadedFields({})
      setSubmissionNote('')
      return
    }

    submitMutation.mutate(payload)
  }

  const standaloneUploadMutation = useMutation({
    mutationFn: (file) => filesAPI.upload({ file, companyId: user.companyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', user?.companyId] })
      setSurfaceError('')
    },
    onError: (error) => setSurfaceError(error.message),
  })

  const overviewCards = useMemo(
    () => [
      {
        title: 'Active tasks',
        value: companyAnalytics.activeTaskCount || tasks.filter((task) => task.status !== 'completed').length,
        subtitle: 'Live company execution queue',
        icon: ClipboardCheck,
        tone: 'slate',
      },
      {
        title: 'Submissions',
        value: companyAnalytics.submissionCount || submissions.length,
        subtitle: 'Records sent to superadmin',
        icon: Briefcase,
        tone: 'sky',
      },
      {
        title: 'Files',
        value: files.length,
        subtitle: 'Supporting documents uploaded',
        icon: Files,
        tone: 'emerald',
      },
      {
        title: 'Notifications',
        value: unreadNotifications,
        subtitle: 'Unread operating signals',
        icon: BellRing,
        tone: 'amber',
      },
    ],
    [companyAnalytics.activeTaskCount, companyAnalytics.submissionCount, tasks, submissions.length, files.length, unreadNotifications]
  )

  const handleFieldChange = (key, value) => {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleFileUpload = async (field, file) => {
    try {
      setUploadingKey(field.key)
      const uploaded = await filesAPI.upload({ file, companyId: user.companyId })
      queryClient.invalidateQueries({ queryKey: ['files', user?.companyId] })
      setUploadedFields((current) => ({
        ...current,
        [field.key]: uploaded,
      }))
      setFormValues((current) => ({
        ...current,
        [field.key]: uploaded.storageUrl,
      }))
      setSurfaceError('')
    } catch (error) {
      setSurfaceError(error.message)
    } finally {
      setUploadingKey(null)
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card) => (
          <MetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Surface title="Active task queue" eyebrow="Current priorities">
          <div className="space-y-3">
            {tasks.filter((task) => task.status !== 'completed').length ? (
              tasks
                .filter((task) => task.status !== 'completed')
                .map((task) => (
                  <div key={task._id} className="rounded-[1.25rem] border border-slate-200 bg-white/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{task.title}</p>
                        <p className="text-sm text-slate-500">{task.description || 'No description'}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{task.status}</Badge>
                        <Badge variant="outline">{task.priority}</Badge>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <EmptyPanel title="No active tasks" description="Superadmin will assign tasks that appear here automatically." />
            )}
          </div>
        </Surface>

        <Surface title="Recent activity" eyebrow="Company pulse">
          <div className="space-y-3">
            {submissions.slice(0, 5).length ? (
              submissions.slice(0, 5).map((submission) => (
                <div key={submission._id} className="rounded-[1.25rem] border border-slate-200 bg-white/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{submission.taskId?.title || 'Task submission'}</p>
                      <p className="text-sm text-slate-500">{submission.status}</p>
                    </div>
                    <Badge variant="outline">{new Date(submission.createdAt || submission.submittedAt).toLocaleDateString()}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <EmptyPanel title="No recent activity" description="Task submissions and updates will appear here." />
            )}
          </div>
        </Surface>
      </div>
    </div>
  )

  const renderTasks = () => (
    <Surface title="Assigned tasks" eyebrow="Superadmin instructions">
      <div className="space-y-4">
        {tasks.length ? (
          tasks.map((task) => (
            <div key={task._id} className="rounded-[1.35rem] border border-slate-200 bg-white/80 p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{task.title}</p>
                  <p className="text-sm text-slate-500">{task.description || 'No description provided'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{task.status}</Badge>
                  <Badge variant="outline">{task.priority}</Badge>
                  {task.sectionId?.name ? <Badge variant="outline">{task.sectionId.name}</Badge> : null}
                  <button
                    onClick={() => handleDelete('task', task._id, task.title)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    title="Delete task"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
              {task.dueDate ? (
                <div className="mt-3">
                  <Badge variant="outline">Due: {new Date(task.dueDate).toLocaleDateString()}</Badge>
                </div>
              ) : null}
              {task.status !== 'completed' ? (
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTaskId(task._id)
                      setActiveView('submit')
                    }}
                    className="rounded-2xl"
                  >
                    Submit response
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => taskStatusMutation.mutate({ id: task._id, status: 'completed' })}
                    className="rounded-2xl"
                  >
                    Mark complete
                  </Button>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <EmptyPanel title="No tasks assigned yet" description="Superadmin will assign tasks that appear here automatically." />
        )}
      </div>
    </Surface>
  )

  const renderSubmit = () => {
    if (!selectedTask) {
      return (
        <Surface title="Submit task response" eyebrow="Dynamic form center">
          <EmptyPanel title="No task selected" description="Select a task from the Tasks tab to submit a response." />
        </Surface>
      )
    }

    const section = sectionDetailQuery.data
    const fields = section?.fields || []

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Surface title="Task details" eyebrow="Current assignment">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-950">{selectedTask.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{selectedTask.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>{selectedTask.status}</Badge>
              <Badge variant="outline">{selectedTask.priority}</Badge>
              {selectedTask.dueDate ? (
                <Badge variant="outline">Due: {new Date(selectedTask.dueDate).toLocaleDateString()}</Badge>
              ) : null}
            </div>
            {selectedTask.sectionId ? (
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold text-slate-900">Form section: {selectedTask.sectionId.name}</p>
                <p className="mt-1 text-xs text-slate-500">{fields.length} fields to complete</p>
              </div>
            ) : (
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-semibold text-slate-900">Free-form submission</p>
                <p className="mt-1 text-xs text-slate-500">No specific form required</p>
              </div>
            )}
          </div>
        </Surface>

        <Surface title="Submit response" eyebrow="Complete assignment">
          {fields.length ? (
            <div className="space-y-6">
              <DynamicFieldRenderer
                fields={fields}
                values={formValues}
                uploads={uploadedFields}
                onChange={handleFieldChange}
                onUpload={handleFileUpload}
                uploadingKey={uploadingKey}
              />
              <Textarea
                label="Optional message to superadmin"
                value={submissionNote}
                onChange={(event) => setSubmissionNote(event.target.value)}
                placeholder="Add any context, questions, or follow-up notes here"
                className="rounded-2xl border-slate-200 bg-white/90"
              />
              <Button
                isLoading={submitMutation.isPending}
                size="lg"
                className="w-full rounded-2xl"
                onClick={() => handleSubmit({
                  taskId: selectedTask._id,
                  sectionId: selectedSectionId,
                  values: formValues,
                  note: submissionNote,
                })}
              >
                Submit response
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm text-slate-600">This task doesn't require a specific form. You can submit a general response or mark it as complete.</p>
              </div>
              <Textarea
                label="Optional message to superadmin"
                value={submissionNote}
                onChange={(event) => setSubmissionNote(event.target.value)}
                placeholder="Add any context, questions, or follow-up notes here"
                className="rounded-2xl border-slate-200 bg-white/90"
              />
              <Button
                isLoading={submitMutation.isPending}
                size="lg"
                className="w-full rounded-2xl"
                onClick={() => handleSubmit({
                  taskId: selectedTask._id,
                  sectionId: selectedSectionId,
                  values: { note: 'Task completed without specific form requirements' },
                  note: submissionNote,
                })}
              >
                Submit completion
              </Button>
            </div>
          )}
        </Surface>
      </div>
    )
  }

  const renderSubmissions = () => (
    <Surface title="Submission history" eyebrow="Past responses">
      <div className="space-y-4">
        {submissions.length ? (
          submissions.map((submission) => (
            <div key={submission._id} className="rounded-[1.35rem] border border-slate-200 bg-white/80 p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{submission.taskId?.title || 'Task submission'}</p>
                  <p className="text-sm text-slate-500">
                    {submission.sectionId?.name || 'General'} • {new Date(submission.createdAt || submission.submittedAt).toLocaleString()}
                  </p>
                  {submission.note ? <p className="mt-2 text-sm text-slate-600">Note: {submission.note}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>{submission.status}</Badge>
                  <Badge variant="outline">{submission.submittedBy?.name || 'You'}</Badge>
                </div>
              </div>
              <pre className="mt-4 overflow-x-auto rounded-[1.15rem] bg-slate-950 px-4 py-3 text-xs text-sky-50">
                {JSON.stringify(submission.values || {}, null, 2)}
              </pre>
            </div>
          ))
        ) : (
          <EmptyPanel title="No submissions yet" description="Your task responses will appear here once submitted." />
        )}
      </div>
    </Surface>
  )

  const renderFiles = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <Surface title="Upload document" eyebrow="File management">
        <div className="space-y-4">
          <div className="rounded-[1.25rem] border-2 border-dashed border-slate-300 bg-slate-50/80 p-6 text-center">
            <Files className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600">Drag and drop files here, or click to browse</p>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                files.forEach((file) => standaloneUploadMutation.mutate(file))
              }}
              id="file-upload"
            />
            <Button
              variant="outline"
              className="mt-4 rounded-2xl"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Choose files
            </Button>
          </div>
          <p className="text-xs text-slate-500">Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP (max 10MB each)</p>
        </div>
      </Surface>

      <Surface title="Document library" eyebrow="Company files">
        <div className="space-y-4">
          {files.length ? (
            files.map((file) => (
              <div key={file._id} className="rounded-[1.35rem] border border-slate-200 bg-white/80 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                      <Files className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">{file.originalName}</p>
                      <p className="text-sm text-slate-500">
                        {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(file.storageUrl, '_blank')}
                    className="rounded-2xl"
                  >
                    Download
                  </Button>
                  <button
                    onClick={() => handleDelete('file', file._id, file.originalName)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    title="Delete file"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyPanel title="No files uploaded yet" description="Upload supporting documents that will be available to your company workspace." />
          )}
        </div>
      </Surface>
    </div>
  )

  const renderAI = () => (
    <Surface title="AI insights" eyebrow="Company intelligence">
      <div className="space-y-4">
        {insights.length ? (
          insights.map((insight) => (
            <div key={insight._id} className="rounded-[1.35rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{insight.type}</Badge>
                <Badge variant="outline">{insight.severity}</Badge>
                <Badge variant="outline">{new Date(insight.createdAt).toLocaleDateString()}</Badge>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{insight.content}</p>
            </div>
          ))
        ) : (
          <EmptyPanel title="No AI insights yet" description="AI-generated insights about your company performance will appear here." />
        )}
      </div>
    </Surface>
  )

  const renderNotifications = () => (
    <Surface title="Notifications" eyebrow="Operating signals">
      <div className="space-y-4">
        {notifications.length ? (
          notifications.map((notification) => (
            <div key={notification._id} className="flex flex-col gap-3 rounded-[1.35rem] border border-slate-200 bg-white/80 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-950">{notification.title}</p>
                <p className="mt-1 text-sm text-slate-500">{notification.message}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={notification.isRead ? 'outline' : 'success'}>
                  {notification.isRead ? 'Read' : 'Unread'}
                </Badge>
                {!notification.isRead ? (
                  <Button
                    variant="outline"
                    onClick={() => markNotificationMutation.mutate(notification._id)}
                    className="rounded-2xl"
                  >
                    Mark as read
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <EmptyPanel title="No notifications yet" description="Task assignments, updates, and alerts will appear here." />
        )}
      </div>
    </Surface>
  )

  const renderApprovals = () => (
    <AdminApprovalRequests companyId={user?.companyId} userId={user?._id} />
  )

  const renderHR = () => <HRModule isSuperAdmin={false} />

  const renderFinance = () => <FinanceModule isSuperAdmin={false} />

  // ============================================================================
  // RENDER COMMENTS - Messages from superadmin and company communication
  // ============================================================================
  const renderComments = () => <CommentsModule isSuperAdmin={false} user={user} />

  const viewMap = {
    overview: renderOverview,
    approvals: renderApprovals,
    tasks: renderTasks,
    submit: renderSubmit,
    submissions: renderSubmissions,
    files: renderFiles,
    hr: renderHR,
    budget: renderFinance,
    ai: renderAI,
    comments: renderComments,
    notifications: renderNotifications,
  }

  return (
    <AppShell
      title="Company Admin Workspace"
      subtitle="Run your company operations, respond to superadmin instructions, submit dynamic updates, and keep your workspace premium, organized, and realtime."
      navItems={navItems}
      activeView={activeView}
      onChangeView={setActiveView}
      user={user}
      connected={connected}
      notificationCount={unreadNotifications}
      onLogout={logout}
    >
      <ConfirmDialog
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: "", id: "", name: "" })}
        onConfirm={confirmDelete}
        title={"Delete " + deleteModal.type}
        description={"Are you sure you want to delete \"" + deleteModal.name + "\"? This action cannot be undone."}
        danger={true}
      />
      {toast && <div className="mb-4"><Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /></div>}
      {surfaceError ? (
        <div className="mb-6 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {surfaceError}
        </div>
      ) : null}
      {viewMap[activeView]()}
    </AppShell>
  )
}
