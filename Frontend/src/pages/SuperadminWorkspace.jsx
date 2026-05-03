import { useMemo, useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  Bot,
  Boxes,
  Briefcase,
  Building2,
  CheckCircle,
  ClipboardList,
  DollarSign,
  Files,
  Info,
  LayoutPanelLeft,
  LineChart,
  Plus,
  Sparkles,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react'
import { entriesAPI } from '../api/entries'
import {
  aiAPI,
  analyticsAPI,
  companiesAPI,
  filesAPI,
  notificationsAPI,
  sectionsAPI,
  smartAlertsAPI,
  submissionsAPI,
  tasksAPI,
  usersAPI,
} from '../api/platform'
import AppShell, { EmptyPanel, MetricCard, Surface } from '../components/app/AppShell'
import DynamicFieldRenderer from '../components/app/DynamicFieldRenderer'
import CompanyCredentialWizard from '../components/ui/CompanyCredentialWizard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Badge from '../components/ui/Badge'
import { ConfirmDialog } from '../components/ui/Modal'
import Toast from '../components/ui/Toast'
import Select from '../components/ui/Select'
import { Card, CardContent } from '../components/ui/Card'
import SuperAdminApprovals from '../components/Approvals/SuperAdminApprovals'
import HRModule from '../components/HRModule'
import FinanceModule from '../components/FinanceModule'
import CommentsModule from '../components/CommentsModule'
import AnalyticsModule from '../components/AnalyticsModule'
import AIInsightsModule from '../components/AIInsightsModule'
import AIChatbot from '../components/AIPortfolioChatbot'
import { useAuth } from '../hooks/useAuth'
import { useOffline } from '../hooks/useOffline'
import { useRealtime } from '../hooks/useRealtime'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutPanelLeft, description: 'Global command center' },
  { id: 'portfolio', label: 'Portfolio', icon: Building2, description: 'Portfolio view and company health' },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList, description: 'Instructions and follow-up' },
  { id: 'approvals', label: 'Approvals', icon: Briefcase, description: 'Pending approval workflow' },
  { id: 'hr', label: 'HR', icon: BellRing, description: 'Team and people insights' },
  { id: 'budget', label: 'Finance', icon: DollarSign, description: 'Financial tracking' },
  { id: 'companies', label: 'Companies', icon: Boxes, description: 'Multi-company control' },
  { id: 'admins', label: 'Admins', icon: Users, description: 'Assign company operators' },
  { id: 'files', label: 'Files', icon: Files, description: 'Upload and manage documents' },
  { id: 'comments', label: 'Comments', icon: Sparkles, description: 'Stakeholder conversations' },
  { id: 'submissions', label: 'Portfolio updates', icon: Briefcase, description: 'Live company updates' },
  { id: 'analytics', label: 'Analytics', icon: LineChart, description: 'Cross-company performance' },
  { id: 'ai', label: 'AI Insights', icon: Bot, description: 'Realtime intelligence' },
  { id: 'notifications', label: 'Notifications', icon: BellRing, description: 'Operational signal feed' },
]

const emptyFieldDraft = {
  label: '',
  key: '',
  type: 'text',
  required: false,
  options: '',
  placeholder: '',
}

export default function SuperadminWorkspace() {
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()
  const { isOnline, createOfflineAction } = useOffline()
  const { connected } = useRealtime()
  const [activeView, setActiveView] = useState('overview')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [companyForm, setCompanyForm] = useState({ name: '', code: '', industry: '', description: '' })
  const [adminForm, setAdminForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', companyId: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [sectionForm, setSectionForm] = useState({ name: '', slug: '', description: '' })
  const [fieldForm, setFieldForm] = useState(emptyFieldDraft)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    companyIds: [],
    sectionId: '',
    priority: 'medium',
    dueDate: '',
    budget: '',
    budgetCurrency: 'USD',
    owner: '',
    startDate: '',
    endDate: '',
    spent: '',
    progress: '',
    blockers: '',
    followUp: '',
  })
  const [taskAttachments, setTaskAttachments] = useState([])
  const [taskErrors, setTaskErrors] = useState({ title: '', companyIds: '' })
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [aiForm, setAiForm] = useState({ companyId: '', type: 'summary' })
  const [surfaceError, setSurfaceError] = useState('')
  const [deleteModal, setDeleteModal] = useState({ open: false, type: '', id: '', name: '' })
  const [toast, setToast] = useState(null)
  const [showCredentialWizard, setShowCredentialWizard] = useState(false)
  const [newlyCreatedCompany, setNewlyCreatedCompany] = useState(null)
  const [fileUploadCompanyId, setFileUploadCompanyId] = useState('')
  const [fileUpload, setFileUpload] = useState(null)
  const [fileUploadError, setFileUploadError] = useState('')
  // Portfolio feature state
  const [portfolioSearch, setPortfolioSearch] = useState('')
  const [portfolioFilter, setPortfolioFilter] = useState('all') // all, active, inactive, suspended, at-risk
  const [portfolioSort, setPortfolioSort] = useState('health-score') // health-score, tasks, submissions, recent, budget

  const companiesQuery = useQuery({ queryKey: ['companies'], queryFn: companiesAPI.list })
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: usersAPI.list })
  const sectionsQuery = useQuery({ queryKey: ['sections'], queryFn: sectionsAPI.list })
  const tasksQuery = useQuery({ queryKey: ['tasks'], queryFn: tasksAPI.list })
  const submissionsQuery = useQuery({ queryKey: ['submissions'], queryFn: submissionsAPI.list })
  const notificationsQuery = useQuery({ queryKey: ['notifications'], queryFn: notificationsAPI.list })
  const filesQuery = useQuery({
    queryKey: ['files', fileUploadCompanyId],
    queryFn: () => filesAPI.list(fileUploadCompanyId || null),
  })
  const entriesOverviewQuery = useQuery({ queryKey: ['entries-overview'], queryFn: () => entriesAPI.getAll({ limit: 5 }) })
  const smartAlertsQuery = useQuery({ queryKey: ['smart-alerts'], queryFn: smartAlertsAPI.list })
  const insightsQuery = useQuery({ queryKey: ['insights'], queryFn: aiAPI.list })
  const overviewQuery = useQuery({ queryKey: ['analytics-overview'], queryFn: analyticsAPI.overview })
  const rankingsQuery = useQuery({ queryKey: ['analytics-rankings'], queryFn: analyticsAPI.rankings })
  const sectionDetailQuery = useQuery({
    queryKey: ['section-detail', selectedSectionId],
    queryFn: () => sectionsAPI.getById(selectedSectionId),
    enabled: Boolean(selectedSectionId),
  })

  const companies = companiesQuery.data || []
  const admins = (usersQuery.data || []).filter((member) => member.role === 'admin')
  const sections = sectionsQuery.data || []
  const tasks = tasksQuery.data || []
  const submissions = submissionsQuery.data || []
  const notifications = notificationsQuery.data || []
  const files = filesQuery.data || []
  const insights = insightsQuery.data || []
  const rankings = rankingsQuery.data || []
  const overview = overviewQuery.data || {}
  const unreadNotifications = notifications.filter((item) => !item.isRead).length
  const recentAdminEntries = (entriesOverviewQuery.data?.entries || []).slice(0, 3).map((entry) => ({
    title: entry.title || 'Untitled entry',
    company: entry.companyId?.name || 'Portfolio company',
    author: entry.submittedBy?.name || 'Company admin',
    category:
      entry.entryType === 'hr_metric'
        ? 'HR'
        : entry.entryType === 'financial_metric'
        ? 'Finance'
        : entry.entryType === 'task'
        ? 'Task'
        : entry.entryType === 'approval'
        ? 'Approval'
        : 'Project',
    note: entry.status || 'Company Admin Entry',
    description: entry.description || 'Company admin submission awaiting review.',
  }))
  const smartAlerts = (smartAlertsQuery.data || []).map((alert) => {
    // Map severity/type to UI alert type
    let type = 'info'
    if (
      alert.severity === 'critical' ||
      alert.severity === 'high' ||
      alert.type === 'risk' ||
      alert.type === 'deadline' ||
      alert.type === 'compliance'
    ) {
      type = 'warning'
    } else if (alert.type === 'budget' || alert.type === 'milestone' || alert.type === 'performance') {
      type = 'success'
    }

    // Derive action and navigation view from alert type
    const viewMap = {
      deadline: 'tasks',
      budget: 'budget',
      performance: 'hr',
      risk: 'hr',
      milestone: 'portfolio',
      compliance: 'approvals',
      system: 'notifications',
    }
    const actionMap = {
      deadline: 'View',
      budget: 'View',
      performance: 'Take Action',
      risk: 'Take Action',
      milestone: 'View',
      compliance: 'Review',
      system: 'View',
    }

    const company = companies.find(
      (c) => String(c._id) === String(alert.companyId?._id || alert.companyId)
    )

    return {
      id: alert._id,
      type,
      title: alert.title,
      message: alert.message,
      company: company?.name || alert.targetName || 'Portfolio',
      action: actionMap[alert.type] || 'View',
      view: viewMap[alert.type] || 'notifications',
    }
  })
  const approvalSummaries = [
    { title: 'Pending approvals', value: '8', subtitle: 'Needs review' },
    { title: 'Approved this week', value: '14', subtitle: 'Completed requests' },
    { title: 'Urgent approvals', value: '3', subtitle: 'High-priority items' },
    { title: 'Approval value', value: 'NPR 4.2M', subtitle: 'Pending + approved' },
  ]
  const hrSummaries = [
    { title: 'Attendance rate', value: '93%', subtitle: 'Company-wide daily average' },
    { title: 'Open hiring', value: '12', subtitle: 'Active recruitment pipelines' },
    { title: 'Turnover', value: '4.5%', subtitle: 'Last 30 days' },
    { title: 'Satisfaction', value: '4.2/5', subtitle: 'Latest survey index' },
  ]

  // Initialize selectedCompanyId when companies load
  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0]._id)
    }
  }, [companies, selectedCompanyId])

  // Portfolio Helper Functions
  const calculateHealthScore = (companyId) => {
    const companyTasks = tasks.filter((task) => task.companyIds?.includes(companyId))
    const companySubmissions = submissions.filter((sub) => String(sub.companyId) === String(companyId))
    
    let score = 100
    
    // Deduct for overdue tasks
    const overdueTasks = companyTasks.filter((t) => t.status === 'overdue').length
    score -= overdueTasks * 15
    
    // Deduct for blocked tasks
    const blockedTasks = companyTasks.filter((t) => t.blockers > 0).length
    score -= blockedTasks * 10
    
    // Boost for completed tasks
    const completedTasks = companyTasks.filter((t) => t.status === 'completed').length
    score += Math.min(completedTasks * 2, 15)
    
    // Deduct for low submission rate
    if (companyTasks.length > 0 && companySubmissions.length === 0) {
      score -= 20
    }
    
    // Budget utilization penalty (over 90% spent)
    const budgetUsed = companyTasks.reduce((sum, t) => {
      if (t.budget > 0 && t.spent > 0) {
        return sum + (t.spent / t.budget > 0.9 ? 5 : 0)
      }
      return sum
    }, 0)
    score -= Math.min(budgetUsed, 15)
    
    return Math.max(0, Math.min(100, score))
  }

  const getRiskIndicators = (companyId) => {
    const companyTasks = tasks.filter((task) => task.companyIds?.includes(companyId))
    const companySubmissions = submissions.filter((sub) => String(sub.companyId) === String(companyId))
    const overdueTasks = companyTasks.filter((t) => t.status === 'overdue').length
    const blockedTasks = companyTasks.filter((t) => t.blockers > 0).length
    
    return {
      overdue: overdueTasks,
      blocked: blockedTasks,
      noRecentSubmission: companySubmissions.length === 0,
      highBudgetUtilization: companyTasks.some((t) => t.spent > 0 && t.budget > 0 && t.spent / t.budget > 0.9),
    }
  }

  const getHealthStatus = (score) => {
    if (score >= 75) return { label: 'Healthy', color: 'emerald', icon: '🟢' }
    if (score >= 50) return { label: 'At Risk', color: 'amber', icon: '🟡' }
    return { label: 'Critical', color: 'red', icon: '🔴' }
  }

  // Filter and sort portfolio companies
  const filteredPortfolioCompanies = companies
    .filter((company) => {
      // Search filter
      if (portfolioSearch && !company.name.toLowerCase().includes(portfolioSearch.toLowerCase())) {
        return false
      }
      
      // Status filter
      if (portfolioFilter === 'all') return true
      if (portfolioFilter === 'at-risk') {
        const healthScore = calculateHealthScore(company._id)
        return healthScore < 75
      }
      return company.status === portfolioFilter
    })
    .sort((a, b) => {
      switch (portfolioSort) {
        case 'health-score': {
          const scoreA = calculateHealthScore(a._id)
          const scoreB = calculateHealthScore(b._id)
          return scoreA - scoreB // Worst first
        }
        case 'tasks': {
          const tasksA = tasks.filter((t) => t.companyIds?.includes(a._id)).length
          const tasksB = tasks.filter((t) => t.companyIds?.includes(b._id)).length
          return tasksB - tasksA
        }
        case 'submissions': {
          const subA = submissions.filter((s) => String(s.companyId) === String(a._id)).length
          const subB = submissions.filter((s) => String(s.companyId) === String(b._id)).length
          return subB - subA
        }
        case 'recent': {
          const lastSubA = submissions
            .filter((s) => String(s.companyId) === String(a._id))
            .sort((x, y) => new Date(y.submittedAt) - new Date(x.submittedAt))[0]?.submittedAt || 0
          const lastSubB = submissions
            .filter((s) => String(s.companyId) === String(b._id))
            .sort((x, y) => new Date(y.submittedAt) - new Date(x.submittedAt))[0]?.submittedAt || 0
          return new Date(lastSubB) - new Date(lastSubA)
        }
        case 'budget': {
          const budgetA = tasks
            .filter((t) => t.companyIds?.includes(a._id))
            .reduce((sum, t) => sum + (t.spent || 0), 0)
          const budgetB = tasks
            .filter((t) => t.companyIds?.includes(b._id))
            .reduce((sum, t) => sum + (t.spent || 0), 0)
          return budgetB - budgetA
        }
        default:
          return 0
      }
    })

  const createCompanyMutation = useMutation({
    mutationFn: companiesAPI.create,
    onSuccess: (createdCompany) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      setCompanyForm({ name: '', code: '', industry: '', description: '' })
      setSurfaceError('')
      // Show credential setup wizard
      setNewlyCreatedCompany(createdCompany)
      setShowCredentialWizard(true)
    },
    onError: (error) => setSurfaceError(error.message),
  })

  const createAdminMutation = useMutation({
    mutationFn: usersAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      setAdminForm({ name: '', email: '', phone: '', password: '', confirmPassword: '', companyId: '' })
      setSurfaceError('')
    },
    onError: (error) => setSurfaceError(error.message),
  })

  const createSectionMutation = useMutation({
    mutationFn: sectionsAPI.create,
    onSuccess: (createdSection) => {
      queryClient.invalidateQueries({ queryKey: ['sections'] })
      setSectionForm({ name: '', slug: '', description: '' })
      setSelectedSectionId(createdSection._id)
      setSurfaceError('')
    },
    onError: (error) => setSurfaceError(error.message),
  })

  const addFieldMutation = useMutation({
    mutationFn: ({ sectionId, payload }) => sectionsAPI.addField(sectionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['section-detail', selectedSectionId] })
      setFieldForm(emptyFieldDraft)
      setSurfaceError('')
    },
    onError: (error) => setSurfaceError(error.message),
  })

  const createTaskMutation = useMutation({
    mutationFn: tasksAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setTaskForm({
        title: '',
        description: '',
        companyIds: [],
        sectionId: '',
        priority: 'medium',
        dueDate: '',
        budget: '',
        budgetCurrency: 'USD',
      })
      setTaskAttachments([])
      setSurfaceError('')
    },
    onError: (error) => setSurfaceError(error.message),
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, payload }) => tasksAPI.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setTaskForm({
        title: '',
        description: '',
        companyIds: [],
        sectionId: '',
        priority: 'medium',
        dueDate: '',
        budget: '',
        budgetCurrency: 'USD',
      })
      setTaskAttachments([])
      setEditingTaskId(null)
      setSurfaceError('')
      setToast({ type: 'success', message: 'Task updated successfully' })
    },
    onError: (error) => {
      setSurfaceError(error.message)
      setToast({ type: 'error', message: error.message || 'Failed to update task' })
    },
  })

  const uploadFileMutation = useMutation({
    mutationFn: ({ file, companyId }) => filesAPI.upload({ file, companyId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', fileUploadCompanyId] })
      setFileUpload(null)
      setFileUploadError('')
      setSurfaceError('')
    },
    onError: (error) => {
      setFileUploadError(error.message)
      setSurfaceError(error.message)
    },
  })

  const generateInsightMutation = useMutation({
    mutationFn: aiAPI.generate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] })
      setSurfaceError('')
    },
    onError: (error) => setSurfaceError(error.message),
  })
  const deleteCompanyMutation = useMutation({
    mutationFn: companiesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      setToast({ type: 'success', message: 'Company deleted successfully' })
      setDeleteModal({ open: false, type: '', id: '', name: '' })
    },
    onError: (error) => {
      setToast({ type: 'error', message: error.message || 'Failed to delete company' })
      setDeleteModal({ open: false, type: '', id: '', name: '' })
    },
  })

  const deleteAdminMutation = useMutation({
    mutationFn: usersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setToast({ type: 'success', message: 'Admin deleted successfully' })
      setDeleteModal({ open: false, type: '', id: '', name: '' })
    },
    onError: (error) => {
      setToast({ type: 'error', message: error.message || 'Failed to delete admin' })
      setDeleteModal({ open: false, type: '', id: '', name: '' })
    },
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
      queryClient.invalidateQueries({ queryKey: ['files', fileUploadCompanyId] })
      setToast({ type: 'success', message: 'File deleted successfully' })
      setDeleteModal({ open: false, type: '', id: '', name: '' })
    },
    onError: (error) => {
      setToast({ type: 'error', message: error.message || 'Failed to delete file' })
      setDeleteModal({ open: false, type: '', id: '', name: '' })
    },
  })

  const deleteSubmissionMutation = useMutation({
    mutationFn: submissionsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
      setToast({ type: 'success', message: 'Submission deleted successfully' })
      setDeleteModal({ open: false, type: '', id: '', name: '' })
    },
    onError: (error) => {
      setToast({ type: 'error', message: error.message || 'Failed to delete submission' })
      setDeleteModal({ open: false, type: '', id: '', name: '' })
    },
  })

  const markNotificationMutation = useMutation({
    mutationFn: notificationsAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const handleCredentialWizardComplete = async (credentialData) => {
    try {
      // Create admin user for the company
      await usersAPI.create({
        name: credentialData.adminName,
        email: credentialData.adminEmail,
        password: credentialData.adminPassword,
        role: 'admin',
        companyId: credentialData.companyId,
      })

      // Close wizard and refresh data
      setShowCredentialWizard(false)
      setNewlyCreatedCompany(null)
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    } catch (error) {
      throw new Error(error.message || 'Failed to create admin credentials')
    }
  }

  const handleCredentialWizardCancel = () => {
    setShowCredentialWizard(false)
    setNewlyCreatedCompany(null)
  }

  const handleCreateCompany = (payload) => {
    if (!isOnline) {
      createOfflineAction('create-company', payload, 'companies')
      setSurfaceError('You are offline. Company creation will sync once you reconnect.')
      setCompanyForm({ name: '', code: '', industry: '', description: '' })
      return
    }
    createCompanyMutation.mutate(payload)
  }

  const handleCreateAdmin = (payload) => {
    if (payload.password !== payload.confirmPassword) {
      setSurfaceError('Passwords do not match.')
      return
    }
    if (!payload.password || payload.password.length < 6) {
      setSurfaceError('Password must be at least 6 characters.')
      return
    }
    const { confirmPassword, ...adminPayload } = payload
    if (!isOnline) {
      createOfflineAction('create-admin', adminPayload, 'users')
      setSurfaceError('You are offline. Admin account will sync once you reconnect.')
      setAdminForm({ name: '', email: '', phone: '', password: '', confirmPassword: '', companyId: '' })
      return
    }
    createAdminMutation.mutate(adminPayload)
  }

  const handleCreateSection = (payload) => {
    if (!isOnline) {
      createOfflineAction('create-section', payload, 'sections')
      setSurfaceError('You are offline. Section creation will sync once you reconnect.')
      setSectionForm({ name: '', slug: '', description: '' })
      return
    }
    createSectionMutation.mutate(payload)
  }

  const handleAddField = ({ sectionId, payload }) => {
    if (!isOnline) {
      createOfflineAction('add-field', { sectionId, field: payload }, `section_${sectionId}_fields`)
      setSurfaceError('You are offline. Field will be queued for sync.')
      setFieldForm(emptyFieldDraft)
      return
    }
    addFieldMutation.mutate({ sectionId, payload })
  }

  const validateTask = (payload) => {
    const errors = {}

    if (!payload.title?.trim()) {
      errors.title = 'Task title is required.'
    }

    if (!payload.companyIds?.length) {
      errors.companyIds = 'Select at least one company.'
    }

    return errors
  }

  const handleCreateTask = (payload) => {
    const validationErrors = validateTask(payload)
    if (Object.keys(validationErrors).length) {
      setTaskErrors(validationErrors)
      return
    }

    const normalizedPayload = {
      ...payload,
      sectionId: payload.sectionId ? payload.sectionId : undefined,
      budget: payload.budget ? Number(payload.budget) : undefined,
      owner: payload.owner ? payload.owner : undefined,
      startDate: payload.startDate ? payload.startDate : undefined,
      endDate: payload.endDate ? payload.endDate : undefined,
      spent: payload.spent ? Number(payload.spent) : undefined,
      progress: payload.progress ? Number(payload.progress) : undefined,
      blockers: payload.blockers ? Number(payload.blockers) : undefined,
    }

    setTaskErrors({ title: '', companyIds: '' })

    if (!isOnline) {
      const actionType = editingTaskId ? 'update-task' : 'create-task'
      createOfflineAction(actionType, { id: editingTaskId, ...normalizedPayload }, 'tasks')
      setSurfaceError(`You are offline. Task will be queued for sync once online.`)
      setTaskForm({
        title: '',
        description: '',
        companyIds: [],
        sectionId: '',
        priority: 'medium',
        dueDate: '',
        budget: '',
        budgetCurrency: 'USD',
        owner: '',
        startDate: '',
        endDate: '',
        spent: '',
        progress: '',
        blockers: '',
        followUp: '',
      })
      setTaskAttachments([])
      setEditingTaskId(null)
      return
    }

    // If editing, use updateTaskMutation; otherwise use createTaskMutation
    if (editingTaskId) {
      if (taskAttachments.length > 0) {
        const formData = new FormData()
        Object.keys(normalizedPayload).forEach((key) => {
          if (Array.isArray(normalizedPayload[key])) {
            normalizedPayload[key].forEach((item) => {
              formData.append(key, item)
            })
          } else if (normalizedPayload[key] !== undefined && normalizedPayload[key] !== null && normalizedPayload[key] !== '') {
            formData.append(key, normalizedPayload[key])
          }
        })
        taskAttachments.forEach((file) => {
          formData.append('attachments', file)
        })
        updateTaskMutation.mutate({ id: editingTaskId, payload: formData })
      } else {
        updateTaskMutation.mutate({ id: editingTaskId, payload: normalizedPayload })
      }
    } else {
      // If there are attachments, use FormData
      if (taskAttachments.length > 0) {
        const formData = new FormData()
        Object.keys(normalizedPayload).forEach((key) => {
          if (Array.isArray(normalizedPayload[key])) {
            normalizedPayload[key].forEach((item) => {
              formData.append(key, item)
            })
          } else if (normalizedPayload[key] !== undefined && normalizedPayload[key] !== null && normalizedPayload[key] !== '') {
            formData.append(key, normalizedPayload[key])
          }
        })
        taskAttachments.forEach((file) => {
          formData.append('attachments', file)
        })
        createTaskMutation.mutate(formData)
      } else {
        createTaskMutation.mutate(normalizedPayload)
      }
    }
  }



  const handleDelete = (type, id, name) => {
    setDeleteModal({ open: true, type, id, name })
  }

  const confirmDelete = () => {
    const { type, id } = deleteModal
    if (!type || !id) return
    if (type === 'company') deleteCompanyMutation.mutate(id)
    else if (type === 'admin') deleteAdminMutation.mutate(id)
    else if (type === 'task') deleteTaskMutation.mutate(id)
    else if (type === 'file') deleteFileMutation.mutate(id)
    else if (type === 'submission') deleteSubmissionMutation.mutate(id)
  }
  const handleGenerateInsight = (payload) => {
    if (!isOnline) {
      createOfflineAction('generate-insight', payload, 'insights')
      setSurfaceError('You are offline. Insight generation will sync once you reconnect.')
      return
    }
    generateInsightMutation.mutate(payload)
  }

  const handleTaskCompanyToggle = (companyId) => {
    setTaskForm(prev => ({
      ...prev,
      companyIds: prev.companyIds.includes(companyId)
        ? prev.companyIds.filter(id => id !== companyId)
        : [...prev.companyIds, companyId]
    }))
  }

  const handleFileUpload = () => {
    if (!fileUpload) {
      setFileUploadError('Select a file before uploading.')
      return
    }

    if (!fileUploadCompanyId) {
      setFileUploadError('Select a company to assign this upload.')
      return
    }

    if (!isOnline) {
      createOfflineAction('upload-file', { file: fileUpload, companyId: fileUploadCompanyId }, 'files')
      setFileUpload(null)
      setFileUploadError('You are offline. File upload will sync once you reconnect.')
      return
    }

    uploadFileMutation.mutate({ file: fileUpload, companyId: fileUploadCompanyId })
  }

  const handleEditTask = (task) => {
    setTaskForm({
      title: task.title,
      description: task.description || '',
      companyIds: task.companyIds?.map((c) => (typeof c === 'object' ? c._id : c)) || [],
      sectionId: task.sectionId?._id || task.sectionId || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      budget: task.budget || '',
      budgetCurrency: task.budgetCurrency || 'USD',
      owner: task.owner?._id || task.owner || '',
      startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
      endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '',
      spent: task.spent || '',
      progress: task.progress || '',
      blockers: task.blockers || '',
      followUp: task.followUp || '',
    })
    setEditingTaskId(task._id)
    setTaskAttachments([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEditTask = () => {
    setEditingTaskId(null)
    setTaskForm({
      title: '',
      description: '',
      companyIds: [],
      sectionId: '',
      priority: 'medium',
      dueDate: '',
      budget: '',
      budgetCurrency: 'USD',
      owner: '',
      startDate: '',
      endDate: '',
      spent: '',
      progress: '',
      blockers: '',
      followUp: '',
    })
    setTaskAttachments([])
  }

  const rankingChartData = useMemo(
    () =>
      rankings.map((item) => ({
        name: item.code,
        submissions: item.submissionCount,
      })),
    [rankings]
  )

  const trendChartData = useMemo(() => {
    const grouped = submissions.reduce((accumulator, submission) => {
      const month = new Date(submission.createdAt || submission.submittedAt).toLocaleDateString('en-US', {
        month: 'short',
      })
      accumulator[month] = (accumulator[month] || 0) + 1
      return accumulator
    }, {})

    return Object.entries(grouped).map(([month, total]) => ({ month, total }))
  }, [submissions])

  const renderOverview = () => {
    // Calculate actual metrics from data
    const pendingSubmissionsCount = submissions.filter(s => s.status === 'pending' || s.status === 'awaiting_review' || s.status === 'submitted').length
    const openTasksCount = tasks.filter(t => t.status !== 'completed').length
    const overdueTasksCount = tasks.filter(t => t.status === 'overdue').length

    const summaryCards = [
      {
        title: 'Total Companies',
        value: companies.length || 0,
        subtitle: 'Active operating units',
        icon: Building2,
        tone: 'slate',
      },
      {
        title: 'Total Employees',
        value: overview.totalEmployees || 0,
        subtitle: 'Across all companies',
        icon: Users,
        tone: 'sky',
      },
      {
        title: 'Pending Submissions',
        value: pendingSubmissionsCount,
        subtitle: 'Awaiting review',
        icon: Briefcase,
        tone: 'amber',
      },
      {
        title: 'Open Tasks',
        value: openTasksCount,
        subtitle: `${overdueTasksCount} overdue`,
        icon: ClipboardList,
        tone: 'rose',
      },
    ]

    const recentActivities = [
      {
        id: 1,
        title: 'New submission received',
        detail: 'Embark College submitted Q3 financial report',
        time: '15 minutes ago',
        type: 'submission',
      },
      {
        id: 2,
        title: 'Task completed',
        detail: 'Marketing strategy review marked done by Global Tech Ltd',
        time: '1 hour ago',
        type: 'task',
      },
      {
        id: 3,
        title: 'Company added',
        detail: 'Superadmin added NexGen Solutions to the portfolio',
        time: '3 hours ago',
        type: 'company',
      },
      {
        id: 4,
        title: 'AI Insight generated',
        detail: 'High turnover risk alert generated for Embark College',
        time: '5 hours ago',
        type: 'ai',
      },
      {
        id: 5,
        title: 'Budget alert',
        detail: 'NexGen Solutions budget utilization crossed 90%',
        time: 'Yesterday',
        type: 'budget',
      },
    ]

    const alertStyles = {
      warning: {
        border: 'border-amber-200',
        bg: 'bg-amber-50/90',
        icon: AlertTriangle,
        iconColor: 'text-amber-600',
        textTitle: 'text-amber-900',
        textMsg: 'text-amber-800',
        btn: 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200',
      },
      info: {
        border: 'border-sky-200',
        bg: 'bg-sky-50/90',
        icon: Info,
        iconColor: 'text-sky-600',
        textTitle: 'text-sky-900',
        textMsg: 'text-sky-800',
        btn: 'bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200',
      },
      success: {
        border: 'border-emerald-200',
        bg: 'bg-emerald-50/90',
        icon: CheckCircle,
        iconColor: 'text-emerald-600',
        textTitle: 'text-emerald-900',
        textMsg: 'text-emerald-800',
        btn: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200',
      },
    }

    return (
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
                </div>
                <div className={`rounded-xl bg-${card.tone}-50 p-3`}>
                  <card.icon className={`h-6 w-6 text-${card.tone}-600`} />
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500">{card.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Smart Alerts */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-900">Smart Alerts</h2>
            <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              {smartAlerts.length} active
            </span>
          </div>
          {smartAlertsQuery.isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-500">Loading alerts...</p>
            </div>
          ) : smartAlerts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-500">No active alerts</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
              {smartAlerts.map((alert) => {
                const style = alertStyles[alert.type]
                const Icon = style.icon
                return (
                  <div
                    key={alert.id}
                    className={`flex flex-col rounded-2xl border ${style.border} ${style.bg} p-5`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconColor}`} />
                      <div className="flex-1">
                        <h3 className={`text-sm font-semibold ${style.textTitle}`}>{alert.title}</h3>
                        <p className={`mt-1 text-sm ${style.textMsg}`}>{alert.message}</p>
                        {alert.company && (
                          <p className="mt-2 text-xs font-medium text-slate-500">{alert.company}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setActiveView(alert.view)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${style.btn}`}
                      >
                        {alert.action}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.6fr]">
          {/* Recent Activity */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50/50"
                >
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-slate-300" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{activity.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setActiveView('companies')}
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-950 hover:bg-slate-950 hover:text-white group"
              >
                <div className="rounded-xl bg-slate-100 p-3 group-hover:bg-white/10">
                  <Plus className="h-5 w-5 text-slate-700 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Add New Company</p>
                  <p className="text-xs text-slate-500 group-hover:text-slate-300">Register a new portfolio company</p>
                </div>
              </button>

              <button
                onClick={() => setActiveView('submissions')}
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-sky-600 hover:bg-sky-600 hover:text-white group"
              >
                <div className="rounded-xl bg-sky-50 p-3 group-hover:bg-white/10">
                  <Briefcase className="h-5 w-5 text-sky-600 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">View Submissions</p>
                  <p className="text-xs text-slate-500 group-hover:text-sky-100">Check pending portfolio updates</p>
                </div>
              </button>

              <button
                onClick={() => setActiveView('ai')}
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-600 hover:bg-emerald-600 hover:text-white group"
              >
                <div className="rounded-xl bg-emerald-50 p-3 group-hover:bg-white/10">
                  <Sparkles className="h-5 w-5 text-emerald-600 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Generate AI Insights</p>
                  <p className="text-xs text-slate-500 group-hover:text-emerald-100">Run intelligence across your portfolio</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderPortfolio = () => {
    const portfolioHealthScores = companies.map((c) => calculateHealthScore(c._id))
    const avgHealthScore = portfolioHealthScores.length > 0 ? Math.round(portfolioHealthScores.reduce((a, b) => a + b) / portfolioHealthScores.length) : 0
    const companiesAtRisk = companies.filter((c) => calculateHealthScore(c._id) < 75).length
    const totalOverdueTasks = tasks.filter((t) => t.status === 'overdue').length
    const portfolioHealthStatus = getHealthStatus(avgHealthScore)

    return (
      <div className="space-y-6">
        {/* Portfolio Summary Dashboard */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className={`border-l-4 border-l-${portfolioHealthStatus.color}-500`}>
            <CardContent className="pt-6">
              <p className="text-xs text-slate-600 uppercase tracking-wide">Portfolio Health</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-3xl font-bold text-slate-900">{avgHealthScore}</span>
                <span className="text-2xl">{portfolioHealthStatus.icon}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{portfolioHealthStatus.label}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-slate-600 uppercase tracking-wide">Companies at Risk</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">{companiesAtRisk}</p>
              <p className="mt-1 text-xs text-slate-500">Need immediate attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-slate-600 uppercase tracking-wide">Overdue Tasks</p>
              <p className={`mt-2 text-3xl font-bold ${totalOverdueTasks > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{totalOverdueTasks}</p>
              <p className="mt-1 text-xs text-slate-500">Across portfolio</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-slate-600 uppercase tracking-wide">Active Companies</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{companies.filter((c) => c.status === 'active').length}</p>
              <p className="mt-1 text-xs text-slate-500">Operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Search, Filter, Sort Controls */}
        <Surface title="Portfolio companies" eyebrow="Company health & performance">
          <div className="space-y-4">
            {/* Controls Row */}
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                placeholder="Search companies..."
                value={portfolioSearch}
                onChange={(e) => setPortfolioSearch(e.target.value)}
              />
              <Select
                options={[
                  { label: 'All Companies', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                  { label: 'At Risk', value: 'at-risk' },
                ]}
                value={portfolioFilter}
                onChange={(e) => setPortfolioFilter(e.target.value)}
              />
              <Select
                options={[
                  { label: 'Sort by Health Score', value: 'health-score' },
                  { label: 'Sort by Tasks', value: 'tasks' },
                  { label: 'Sort by Submissions', value: 'submissions' },
                  { label: 'Sort by Recent Activity', value: 'recent' },
                  { label: 'Sort by Budget', value: 'budget' },
                ]}
                value={portfolioSort}
                onChange={(e) => setPortfolioSort(e.target.value)}
              />
            </div>

            {/* Companies List */}
            <div className="mt-6 space-y-4">
              {filteredPortfolioCompanies.length ? (
                filteredPortfolioCompanies.map((company) => {
                  const companyTasks = tasks.filter((task) => task.companyIds?.includes(company._id))
                  const healthScore = calculateHealthScore(company._id)
                  const healthStatus = getHealthStatus(healthScore)
                  const risks = getRiskIndicators(company._id)
                  const companySubmissions = submissions.filter((sub) => String(sub.companyId) === String(company._id))
                  const lastSubmission = companySubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0]

                  return (
                    <div key={company._id} className={`rounded-[1.35rem] border-l-4 border-l-${healthStatus.color}-500 border border-slate-200 bg-white/90 p-5 shadow-sm`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-950">{company.name}</p>
                            <span className="text-xl">{healthStatus.icon}</span>
                            <Badge variant="outline" className={`text-${healthStatus.color}-600 border-${healthStatus.color}-300`}>
                              {healthStatus.label}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{company.industry || 'General business'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">{healthScore}</p>
                          <p className="text-xs text-slate-500">Health Score</p>
                        </div>
                      </div>

                      {/* Risk Indicators */}
                      {(risks.overdue > 0 || risks.blocked > 0 || risks.noRecentSubmission || risks.highBudgetUtilization) && (
                        <div className="mt-3 rounded-lg bg-amber-50 p-3">
                          <p className="mb-2 text-xs font-semibold text-amber-900">⚠️ Risk Indicators:</p>
                          <div className="flex flex-wrap gap-2">
                            {risks.overdue > 0 && <Badge variant="outline" className="text-red-600 border-red-300">🔴 {risks.overdue} Overdue Task{risks.overdue > 1 ? 's' : ''}</Badge>}
                            {risks.blocked > 0 && <Badge variant="outline" className="text-red-600 border-red-300">⛔ {risks.blocked} Blocked</Badge>}
                            {risks.noRecentSubmission && <Badge variant="outline" className="text-amber-600 border-amber-300">📭 No Recent Submission</Badge>}
                            {risks.highBudgetUtilization && <Badge variant="outline" className="text-orange-600 border-orange-300">💰 High Budget Use</Badge>}
                          </div>
                        </div>
                      )}

                      {/* Stats Grid */}
                      <div className="mt-4 grid gap-3 sm:grid-cols-4">
                        <div>
                          <p className="text-xs text-slate-500">Tasks</p>
                          <p className="font-semibold text-slate-900">{companyTasks.length}</p>
                          {companyTasks.filter((t) => t.status === 'completed').length > 0 && (
                            <p className="mt-1 text-xs text-emerald-600">✓ {companyTasks.filter((t) => t.status === 'completed').length} completed</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Submissions</p>
                          <p className="font-semibold text-slate-900">{companySubmissions.length}</p>
                          {lastSubmission && (
                            <p className="mt-1 text-xs text-slate-500">{new Date(lastSubmission.submittedAt).toLocaleDateString()}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Files</p>
                          <p className="font-semibold text-slate-900">{files.filter((file) => String(file.companyId) === String(company._id)).length}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Status</p>
                          <p className="font-semibold text-slate-900 capitalize">{company.status}</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <EmptyPanel title="No companies match" description={portfolioSearch || portfolioFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Create companies to start building your portfolio.'} />
              )}
            </div>
          </div>
        </Surface>
      </div>
    )
  }


  const renderApprovals = () => (
    <SuperAdminApprovals 
      companyId={selectedCompanyId} 
      companies={companies}
      onCompanyChange={setSelectedCompanyId}
    />
  )

  const renderHR = () => <HRModule isSuperAdmin={true} />

  const renderFinance = () => <FinanceModule isSuperAdmin={true} />

  // ============================================================================
  // RENDER COMMENTS - Stakeholder conversations from all companies
  // ============================================================================
  const renderComments = () => <CommentsModule isSuperAdmin={true} user={user} companies={companies} />

  const renderFiles = () => (
    <div className="space-y-6">
      <Surface title="Superadmin file upload" eyebrow="Document management">
        <div className="space-y-4">
          <Select label="Company target" value={fileUploadCompanyId} onChange={(event) => setFileUploadCompanyId(event.target.value)} className="rounded-2xl border-slate-200 bg-white/90">
            <option value="">Select a company</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.name}
              </option>
            ))}
          </Select>
          <input
            type="file"
            onChange={(event) => setFileUpload(event.target.files?.[0] || null)}
            className="block w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700"
          />
          {fileUploadError ? <p className="text-sm text-rose-600">{fileUploadError}</p> : null}
          <Button isLoading={uploadFileMutation.isPending} size="lg" className="rounded-2xl" onClick={handleFileUpload}>
            Upload file
          </Button>
        </div>
      </Surface>

      <Surface title="Uploaded files" eyebrow="Shared documents">
        <div className="space-y-4">
          {files.length ? (
            files.map((file) => (
              <div key={file._id} className="rounded-[1.35rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{file.originalName}</p>
                    <p className="text-sm text-slate-500">{file.companyId?.name || 'No company'}</p>
                  </div>
                  <Badge variant="outline">{new Date(file.createdAt).toLocaleDateString()}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}</span>
                  <span>{file.mimeType || file.type || 'File'}</span>
                  <button
                    onClick={() => handleDelete('file', file._id, file.originalName)}
                    className="ml-auto inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    title="Delete file"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyPanel title="No files uploaded yet" description="Upload supporting documents to make them available across companies." />
          )}
        </div>
      </Surface>
    </div>
  )

  const renderCompanies = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <Surface title="Create a new company" eyebrow="Portfolio setup">
        <div className="space-y-4">
          <Input label="Company name" value={companyForm.name} onChange={(event) => setCompanyForm({ ...companyForm, name: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
          <Input label="Company code" value={companyForm.code} onChange={(event) => setCompanyForm({ ...companyForm, code: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
          <Input label="Industry" value={companyForm.industry} onChange={(event) => setCompanyForm({ ...companyForm, industry: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
          <Textarea label="Description" value={companyForm.description} onChange={(event) => setCompanyForm({ ...companyForm, description: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
          <Button isLoading={createCompanyMutation.isPending} size="lg" className="rounded-2xl" onClick={() => handleCreateCompany(companyForm)}>
            Save company
          </Button>
        </div>
      </Surface>

      <Surface title="Company directory" eyebrow="Workspace inventory">
        <div className="space-y-4">
          {companies.length ? (
            companies.map((company) => (
              <div key={company._id} className="rounded-[1.35rem] border border-slate-200 bg-white/80 p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{company.name}</p>
                    <p className="text-sm text-slate-500">
                      {company.code} • {company.industry || 'General business'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{company.status}</Badge>
                    <Badge variant="outline">{company.adminIds?.length || 0} admins</Badge>
                    <button
                      onClick={() => handleDelete('company', company._id, company.name)}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      title="Delete company"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
                {company.description ? (
                  <p className="mt-3 text-sm leading-6 text-slate-500">{company.description}</p>
                ) : null}
              </div>
            ))
          ) : (
            <EmptyPanel title="No companies yet" description="Create your first company to activate the command center." />
          )}
        </div>
      </Surface>
    </div>
  )

  const renderAdmins = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <Surface title="Assign a company admin" eyebrow="Tenant access">
        <div className="space-y-4">
          <Select label="Company" value={adminForm.companyId} onChange={(event) => setAdminForm({ ...adminForm, companyId: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90">
            <option value="">Select company</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.name}
              </option>
            ))}
          </Select>
          <Input label="Full name" value={adminForm.name} onChange={(event) => setAdminForm({ ...adminForm, name: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
          <Input label="Email" type="email" autoComplete="off" value={adminForm.email} onChange={(event) => setAdminForm({ ...adminForm, email: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
          <Input label="Phone number" type="tel" autoComplete="off" value={adminForm.phone} onChange={(event) => setAdminForm({ ...adminForm, phone: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
          <div className="relative">
            <Input label="Create password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={adminForm.password} onChange={(event) => setAdminForm({ ...adminForm, password: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90 pr-12" />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[2.1rem] text-sm text-slate-500 hover:text-slate-700"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="relative">
            <Input label="Confirm password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" value={adminForm.confirmPassword} onChange={(event) => setAdminForm({ ...adminForm, confirmPassword: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90 pr-12" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-[2.1rem] text-sm text-slate-500 hover:text-slate-700"
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <Button isLoading={createAdminMutation.isPending} size="lg" className="rounded-2xl" onClick={() => handleCreateAdmin({ ...adminForm, role: 'admin' })}>
            Create admin
          </Button>
        </div>
      </Surface>

      <Surface title="Admin access directory" eyebrow="Operators">
        <div className="space-y-4">
          {admins.length ? (
            admins.map((admin) => (
              <div key={admin._id} className="rounded-[1.35rem] border border-slate-200 bg-white/80 p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{admin.name}</p>
                    <p className="text-sm text-slate-500">{admin.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{admin.isActive ? 'Active' : 'Inactive'}</Badge>
                    <Badge variant="outline">{admin.companyId?.name || 'No company'}</Badge>
                    <button
                      onClick={() => handleDelete('admin', admin._id, admin.name)}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      title="Delete admin"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyPanel title="No admins assigned" description="Create company admins so each company gets its own secure workspace." />
          )}
        </div>
      </Surface>
    </div>
  )
  const renderSections = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <Surface title="Create a dynamic section" eyebrow="Form engine">
        <div className="space-y-4">
          <Input label="Section name" value={sectionForm.name} onChange={(event) => setSectionForm({ ...sectionForm, name: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
          <Input label="Slug" value={sectionForm.slug} onChange={(event) => setSectionForm({ ...sectionForm, slug: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
          <Textarea label="Description" value={sectionForm.description} onChange={(event) => setSectionForm({ ...sectionForm, description: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
          <Button isLoading={createSectionMutation.isPending} size="lg" className="rounded-2xl" onClick={() => handleCreateSection(sectionForm)}>
            Save section
          </Button>
        </div>
      </Surface>

      <div className="space-y-6">
        <Surface
          title="Section builder"
          eyebrow="Dynamic fields"
          action={
            <Select value={selectedSectionId} onChange={(event) => setSelectedSectionId(event.target.value)} className="w-full sm:w-[260px] rounded-2xl border-slate-200 bg-white/90">
              <option value="">Select a section to build</option>
              {sections.map((section) => (
                <option key={section._id} value={section._id}>
                  {section.name}
                </option>
              ))}
            </Select>
          }
        >
          {selectedSectionId ? (
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-4">
                <Input label="Field label" value={fieldForm.label} onChange={(event) => setFieldForm({ ...fieldForm, label: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
                <Input label="Field key" value={fieldForm.key} onChange={(event) => setFieldForm({ ...fieldForm, key: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
                <Select label="Type" value={fieldForm.type} onChange={(event) => setFieldForm({ ...fieldForm, type: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90">
                  {['text', 'textarea', 'number', 'date', 'select', 'checkbox', 'file'].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
                {fieldForm.type === 'select' ? (
                  <Input label="Options (comma separated)" value={fieldForm.options} onChange={(event) => setFieldForm({ ...fieldForm, options: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
                ) : null}
                <Input label="Placeholder" value={fieldForm.placeholder} onChange={(event) => setFieldForm({ ...fieldForm, placeholder: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={fieldForm.required} onChange={(event) => setFieldForm({ ...fieldForm, required: event.target.checked })} className="h-4 w-4 rounded border-slate-300" />
                  Required field
                </label>
                <Button
                  isLoading={addFieldMutation.isPending}
                  size="lg"
                  className="w-full rounded-2xl"
                  onClick={() =>
                    handleAddField({
                      sectionId: selectedSectionId,
                      payload: {
                        ...fieldForm,
                        options:
                          fieldForm.type === 'select'
                            ? fieldForm.options
                                .split(',')
                                .map((item) => item.trim())
                                .filter(Boolean)
                            : [],
                      },
                    })
                  }
                >
                  Add field
                </Button>
              </div>

              <div className="space-y-4">
                {(sectionDetailQuery.data?.fields || []).length ? (
                  <>
                    <div className="rounded-[1.35rem] border border-slate-200 bg-white/80 p-4">
                      <p className="text-sm font-semibold text-slate-900">Current field map</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {sectionDetailQuery.data.fields.map((field) => (
                          <Badge key={field._id} variant="outline">
                            {field.label} • {field.type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-4">
                      <p className="mb-4 text-sm font-semibold text-slate-900">Live preview</p>
                      <DynamicFieldRenderer
                        fields={sectionDetailQuery.data.fields}
                        values={{}}
                        uploads={{}}
                        onChange={() => {}}
                        onUpload={() => {}}
                        disabled
                      />
                    </div>
                  </>
                ) : (
                  <EmptyPanel title="No fields in this section yet" description="Add the first field to turn this section into a reusable dynamic form." />
                )}
              </div>
            </div>
          ) : (
            <EmptyPanel title="Pick a section to build" description="Create or select a section, then add structured fields and preview the admin form instantly." />
          )}
        </Surface>
      </div>
    </div>
  )

  const renderTasks = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <Surface title={editingTaskId ? "Edit task" : "Create an instruction or task"} eyebrow="Execution engine">
        <div className="space-y-4">
          <Input
            label="Task title"
            value={taskForm.title}
            error={taskErrors.title}
            onChange={(event) => {
              setTaskForm({ ...taskForm, title: event.target.value })
              if (taskErrors.title) {
                setTaskErrors((prev) => ({ ...prev, title: '' }))
              }
            }}
            className="rounded-2xl border-slate-200 bg-white/90"
          />
          <Textarea label="Instruction" value={taskForm.description} onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-900">Assign companies</p>
            <div className="flex flex-wrap gap-2">
              {companies.map((company) => {
                const active = taskForm.companyIds.includes(company._id)
                return (
                  <button
                    key={company._id}
                    type="button"
                    onClick={() => {
                      handleTaskCompanyToggle(company._id)
                      if (taskErrors.companyIds) {
                        setTaskErrors((prev) => ({ ...prev, companyIds: '' }))
                      }
                    }}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      active
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950'
                    }`}
                  >
                    {company.name}
                  </button>
                )
              })}
            </div>
            {taskErrors.companyIds ? <p className="mt-2 text-sm text-rose-600">{taskErrors.companyIds}</p> : null}
          </div>
          <Select label="Linked section" value={taskForm.sectionId} onChange={(event) => setTaskForm({ ...taskForm, sectionId: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90">
            <option value="">No section</option>
            {sections.map((section) => (
              <option key={section._id} value={section._id}>
                {section.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Priority" value={taskForm.priority} onChange={(event) => setTaskForm({ ...taskForm, priority: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <Input label="Due date" type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Budget amount"
              type="number"
              value={taskForm.budget}
              onChange={(event) => setTaskForm({ ...taskForm, budget: event.target.value })}
              placeholder="0.00"
              className="rounded-2xl border-slate-200 bg-white/90"
            />
            <Select label="Currency" value={taskForm.budgetCurrency} onChange={(event) => setTaskForm({ ...taskForm, budgetCurrency: event.target.value })} className="rounded-2xl border-slate-200 bg-white/90">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="NPR">NPR (₨)</option>
            </Select>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-900">Attach files (optional)</p>
            <div className="relative rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 transition hover:border-slate-300">
              <input
                type="file"
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files || [])
                  setTaskAttachments((prev) => [...prev, ...files])
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                accept="*/*"
              />
              <div className="text-center pointer-events-none">
                <p className="text-sm font-medium text-slate-600">Drop files here or click to browse</p>
                <p className="mt-1 text-xs text-slate-500">Max 10 files, up to 10MB each</p>
              </div>
            </div>
            {taskAttachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {taskAttachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="truncate text-sm text-slate-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTaskAttachments((prev) => prev.filter((_, i) => i !== index))
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button isLoading={createTaskMutation.isPending || updateTaskMutation.isPending} size="lg" className="rounded-2xl" onClick={() => handleCreateTask(taskForm)}>
              {editingTaskId ? 'Update task' : 'Publish task'}
            </Button>
            {editingTaskId && (
              <Button variant="outline" size="lg" className="rounded-2xl" onClick={handleCancelEditTask}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Surface>

      <Surface title="Task broadcast board" eyebrow="Assigned work">
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
                    {task.budget ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {task.budgetCurrency} {parseFloat(task.budget).toLocaleString()}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(task.companyIds || []).map((company) => (
                    <Badge key={company._id} variant="outline">
                      {company.name}
                    </Badge>
                  ))}
                  <button
                    onClick={() => handleEditTask(task)}
                    className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                    title="Edit task"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete('task', task._id, task.title)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    title="Delete task"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
                {task.attachments && task.attachments.length > 0 && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <p className="mb-3 text-sm font-semibold text-slate-900">Attachments ({task.attachments.length})</p>
                    <div className="space-y-2">
                      {task.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.storageUrl}
                          download={attachment.originalName}
                          className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 hover:bg-amber-100 transition"
                          title={attachment.originalName}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-amber-900">{attachment.originalName}</p>
                            <p className="text-xs text-amber-700">{(attachment.size / 1024).toFixed(2)} KB</p>
                          </div>
                          <span className="ml-2 text-xs font-semibold text-amber-600">Download</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <EmptyPanel title="No tasks published yet" description="Create the first company instruction to activate the execution flow." />
          )}
        </div>
      </Surface>
    </div>
  )

  const renderBudget = () => {
    const totalBudget = tasks.reduce((sum, task) => sum + (parseFloat(task.budget) || 0), 0)
    const activeTasks = tasks.filter(task => task.status !== 'completed')
    const activeBudget = activeTasks.reduce((sum, task) => sum + (parseFloat(task.budget) || 0), 0)
    const completedTasks = tasks.filter(task => task.status === 'completed')
    const spentBudget = completedTasks.reduce((sum, task) => sum + (parseFloat(task.budget) || 0), 0)

    const budgetByCompany = companies.map(company => {
      const companyTasks = tasks.filter(task => task.companyIds?.includes(company._id))
      const companyBudget = companyTasks.reduce((sum, task) => sum + (parseFloat(task.budget) || 0), 0)
      const companySpent = companyTasks.filter(task => task.status === 'completed').reduce((sum, task) => sum + (parseFloat(task.budget) || 0), 0)
      return {
        ...company,
        totalBudget: companyBudget,
        spentBudget: companySpent,
        remainingBudget: companyBudget - companySpent,
      }
    }).filter(company => company.totalBudget > 0)

    return (
      <div className="space-y-6">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total budget"
            value={`$${totalBudget.toLocaleString()}`}
            subtitle="Across all tasks"
            icon={DollarSign}
            tone="emerald"
          />
          <MetricCard
            title="Active budget"
            value={`$${activeBudget.toLocaleString()}`}
            subtitle="In progress tasks"
            icon={ClipboardList}
            tone="sky"
          />
          <MetricCard
            title="Spent budget"
            value={`$${spentBudget.toLocaleString()}`}
            subtitle="Completed tasks"
            icon={Building2}
            tone="amber"
          />
          <MetricCard
            title="Budget utilization"
            value={`${totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0}%`}
            subtitle="Completion rate"
            icon={LineChart}
            tone="slate"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Surface title="Budget by company" eyebrow="Financial overview">
            <div className="space-y-4">
              {budgetByCompany.length ? (
                budgetByCompany.map((company) => (
                  <div key={company._id} className="rounded-[1.35rem] border border-slate-200 bg-white/80 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-950">{company.name}</h3>
                      <Badge variant="outline">{company.code}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-slate-500">Total</p>
                        <p className="font-semibold text-slate-900">${company.totalBudget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Spent</p>
                        <p className="font-semibold text-green-600">${company.spentBudget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Remaining</p>
                        <p className="font-semibold text-blue-600">${company.remainingBudget.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${company.totalBudget > 0 ? (company.spentBudget / company.totalBudget) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyPanel title="No budget data yet" description="Assign budgets to tasks to see company financial tracking here." />
              )}
            </div>
          </Surface>

          <Surface title="Task budget breakdown" eyebrow="Detailed tracking">
            <div className="space-y-4">
              {tasks.filter(task => task.budget && parseFloat(task.budget) > 0).length ? (
                tasks
                  .filter(task => task.budget && parseFloat(task.budget) > 0)
                  .map((task) => (
                    <div key={task._id} className="rounded-[1.35rem] border border-slate-200 bg-white/80 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-950 text-sm">{task.title}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {task.budgetCurrency} {parseFloat(task.budget).toLocaleString()}
                          </Badge>
                          <Badge variant={task.status === 'completed' ? 'success' : 'outline'} className="text-xs">
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {task.companyIds?.map(companyId => {
                          const company = companies.find(c => c._id === companyId)
                          return company ? (
                            <Badge key={companyId} variant="outline" className="text-xs">
                              {company.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>
                  ))
              ) : (
                <EmptyPanel title="No budgeted tasks yet" description="Add budget amounts to tasks to track financial progress." />
              )}
            </div>
          </Surface>
        </div>
      </div>
    )
  }
  const renderAnalytics = () => (
    <AnalyticsModule
      isSuperAdmin={true}
      companies={companies}
      users={usersQuery.data || []}
      submissions={submissions}
      tasks={tasks}
    />
  )

  const renderAI = () => (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Main Chatbot */}
        <div className="h-[calc(100vh-200px)] lg:h-[600px]">
          <AIChatbot companies={companies} insights={insights} />
        </div>
        
        {/* Insights Summary Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              Recent Insights
            </h3>
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight) => (
                <div key={insight.id} className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-sm cursor-pointer hover:border-violet-300 hover:bg-violet-50 transition">
                  <p className="font-medium text-slate-900 line-clamp-1">{insight.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{insight.companyName}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence}% confident
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
            <h3 className="font-semibold text-slate-900 mb-2">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Insights</span>
                <span className="font-semibold text-slate-900">{insights.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">High Priority</span>
                <span className="font-semibold text-red-600">{insights.filter(i => i.priority === 'high').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Avg Confidence</span>
                <span className="font-semibold text-emerald-600">{Math.round(insights.reduce((s, i) => s + i.confidence, 0) / insights.length)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotifications = () => (
    <Surface title="Operational notifications" eyebrow="Signal center">
      <div className="space-y-4">
        {notifications.length ? (
          notifications.map((notification) => (
            <div key={notification._id} className="flex flex-col gap-3 rounded-[1.35rem] border border-slate-200 bg-white/80 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-950">{notification.title}</p>
                <p className="mt-1 text-sm text-slate-500">{notification.message}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={notification.isRead ? 'outline' : 'success'}>
                  {notification.isRead ? 'Read' : 'Unread'}
                </Badge>
                {!notification.isRead ? (
                  <Button variant="outline" onClick={() => markNotificationMutation.mutate(notification._id)} className="rounded-2xl">
                    Mark as read
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <EmptyPanel title="No notifications yet" description="Task assignments, submission updates, and alert signals will appear here." />
        )}
      </div>
    </Surface>
  )

  const renderSubmissions = () => (
    <Surface title="All submissions" eyebrow="Cross-company updates">
      <div className="space-y-4">
        {submissions.length ? (
          submissions.map((submission) => {
            const company = companies.find(c => c._id === submission.companyId || (submission.companyId?._id));
            return (
              <div key={submission._id} className="rounded-[1.35rem] border border-slate-200 bg-white/80 p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {submission.taskId?.title || 'General submission'} {company ? `• ${company.name}` : ''}
                    </p>
                    <p className="text-sm text-slate-500">
                      {submission.sectionId?.name || 'General'} • {new Date(submission.createdAt || submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge>{submission.status}</Badge>
                    <Badge variant="outline">{submission.submittedBy?.name || 'Admin'}</Badge>
                    <button
                      onClick={() => setDeleteModal({ open: true, type: 'submission', id: submission._id, name: submission.taskId?.title || 'Submission' })}
                      className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                      title="Delete submission"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {submission.values && Object.keys(submission.values).length ? (
                  <pre className="mt-4 overflow-x-auto rounded-[1.15rem] bg-slate-950 px-4 py-3 text-xs text-sky-50">
                    {JSON.stringify(submission.values, null, 2)}
                  </pre>
                ) : (
                  <p className="mt-4 text-sm text-slate-500 italic">No structured data submitted</p>
                )}
              </div>
            )
          })
        ) : (
          <EmptyPanel title="No submissions yet" description="Company submissions will appear here across your entire portfolio." />
        )}
      </div>
    </Surface>
  )

  const viewMap = {
    overview: renderOverview,
    portfolio: renderPortfolio,
    tasks: renderTasks,
    approvals: renderApprovals,
    hr: renderHR,
    budget: renderFinance,
    companies: renderCompanies,
    admins: renderAdmins,
    files: renderFiles,
    comments: renderComments,
    submissions: renderSubmissions,
    analytics: renderAnalytics,
    ai: renderAI,
    notifications: renderNotifications,
  }

  return (
    <AppShell
      title="Superadmin Command Center"
      subtitle="Create companies, assign admins, design dynamic sections, orchestrate tasks, review submissions, and surface AI insights from one premium workspace."
      navItems={navItems}
      activeView={activeView}
      onChangeView={setActiveView}
      user={user}
      connected={connected}
      notificationCount={unreadNotifications}
      onLogout={logout}
    >
      {surfaceError ? (
        <div className="mb-6 rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {surfaceError}
        </div>
      ) : null}
      {viewMap[activeView]()}
      <ConfirmDialog
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: "", id: "", name: "" })}
        onConfirm={confirmDelete}
        title={"Delete " + deleteModal.type}
        description={"Are you sure you want to delete \"" + deleteModal.name + "\"? This action cannot be undone."}
        danger={true}
      />
      {toast && <div className="mb-4"><Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} /></div>}
      <CompanyCredentialWizard
        company={newlyCreatedCompany}
        onComplete={handleCredentialWizardComplete}
        onCancel={handleCredentialWizardCancel}
        isOpen={showCredentialWizard}
      />
    </AppShell>
  )
}
