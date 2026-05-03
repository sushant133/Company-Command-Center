import { format, formatDistanceToNow, parse } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return ''
  try {
    return format(new Date(date), 'MMM dd, yyyy')
  } catch (e) {
    return ''
  }
}

export const formatDateTime = (date) => {
  if (!date) return ''
  try {
    return format(new Date(date), 'MMM dd, yyyy HH:mm')
  } catch (e) {
    return ''
  }
}

export const formatTimeAgo = (date) => {
  if (!date) return ''
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch (e) {
    return ''
  }
}

export const formatCurrency = (amount, currency = 'NPR') => {
  if (!amount && amount !== 0) return `${currency} 0`
  return `${currency} ${Math.floor(amount).toLocaleString('en-US')}`
}

export const getProgressColor = (progress) => {
  if (progress <= 33) return 'bg-red-500'
  if (progress <= 66) return 'bg-amber-500'
  return 'bg-green-500'
}

export const getHealthColor = (health) => {
  const colors = {
    Green: 'bg-green-100 text-green-700 border-green-200',
    Amber: 'bg-amber-100 text-amber-700 border-amber-200',
    Red: 'bg-red-100 text-red-700 border-red-200',
  }
  return colors[health] || 'bg-slate-100 text-slate-700 border-slate-200'
}

export const getPriorityColor = (priority) => {
  const colors = {
    Low: 'bg-blue-100 text-blue-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    High: 'bg-red-100 text-red-700',
  }
  return colors[priority] || 'bg-slate-100 text-slate-700'
}

export const getStatusColor = (status) => {
  const colors = {
    Planning: 'bg-slate-100 text-slate-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'On Hold': 'bg-yellow-100 text-yellow-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-slate-100 text-slate-700'
}