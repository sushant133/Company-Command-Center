import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  BellRing,
  Lock,
  LogOut,
  Save,
  Shield,
  User,
  Eye,
  EyeOff,
} from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../api/auth'
import { usersAPI } from '../api/platform'
import { showSuccess, showError } from '../store/notificationStore'

export default function Settings() {
  const navigate = useNavigate()
  const { user, logout, refreshCurrentUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }))
    }
  }, [user])

  const [notifications, setNotifications] = useState({
    email: localStorage.getItem('notif_email') !== 'false',
    push: localStorage.getItem('notif_push') !== 'false',
    tasks: localStorage.getItem('notif_tasks') !== 'false',
    submissions: localStorage.getItem('notif_submissions') !== 'false',
  })

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      showError('Name cannot be empty')
      return
    }
    if (!formData.email.includes('@')) {
      showError('Please enter a valid email')
      return
    }

    setIsLoading(true)
    try {
      await usersAPI.update(user._id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
      })
      showSuccess('Profile updated successfully!')
      await refreshCurrentUser()
    } catch (err) {
      showError(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!formData.currentPassword) {
      showError('Please enter your current password')
      return
    }
    if (formData.newPassword.length < 6) {
      showError('New password must be at least 6 characters')
      return
    }
    if (formData.newPassword !== formData.confirmPassword) {
      showError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })
      showSuccess('Password changed successfully!')
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
    } catch (err) {
      showError(err.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationChange = (key, value) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem(`notif_${key}`, value)
      return updated
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      showError('Logout failed')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100/95 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-sky-500">Workspace settings</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Professional control center</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Customize your account, security, and notifications from a polished, premium settings experience.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="rounded-lg border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Back to dashboard</span>
          </Button>
        </div>

        <Card className="overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-slate-900/5">
          <div className="relative overflow-hidden bg-slate-950 px-6 py-10 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.16),_transparent_30%)]" />
            <div className="relative">
              <div className="flex items-center gap-3 text-sky-300">
                <Award className="h-5 w-5" />
                <p className="text-sm uppercase tracking-[0.28em]">Premium experience</p>
              </div>
              <h2 className="mt-4 text-3xl font-semibold text-white">Secure account administration</h2>
              <p className="mt-3 max-w-3xl text-sm text-slate-300">
                Your settings are organized for speed, clarity, and enterprise-grade control across both admin and superadmin workspaces.
              </p>
            </div>
          </div>
          <div className="grid gap-4 border-t border-slate-200 bg-slate-50 px-6 py-6 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Role</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{user?.role === 'superadmin' ? 'Superadmin' : 'Company Admin'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Status</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">Active</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Support</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">24/7 enterprise support</p>
            </div>
          </div>
        </Card>

        {/* Profile Card */}
        <Card className="border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm">
          <CardContent className="p-6">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-2xl font-bold text-white">
                {user?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                <p className="text-sm text-slate-600">{user?.role === 'superadmin' ? 'Superadmin' : 'Company Admin'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="rounded-lg border-slate-200 bg-white text-slate-900 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="Enter your email"
                  className="rounded-lg border-slate-200 bg-white text-slate-900 placeholder-slate-500"
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="w-full gap-2 rounded-lg bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <Lock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                <div className="relative">
                  <Input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => handleFormChange('currentPassword', e.target.value)}
                    placeholder="Enter your current password"
                    className="rounded-lg border-slate-200 bg-white text-slate-900 placeholder-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => handleFormChange('newPassword', e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className="rounded-lg border-slate-200 bg-white text-slate-900 placeholder-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                    className="rounded-lg border-slate-200 bg-white text-slate-900 placeholder-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={isLoading}
                className="w-full gap-2 rounded-lg bg-blue-600 hover:bg-blue-700"
              >
                <Lock className="h-4 w-4" />
                {isLoading ? 'Updating...' : 'Change Password'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Card */}
        <Card className="border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <BellRing className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
            </div>

            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Alerts', description: 'Receive important updates via email' },
                { key: 'push', label: 'Push Notifications', description: 'Get real-time notifications in browser' },
                { key: 'tasks', label: 'Task Updates', description: 'Notify me about task changes' },
                { key: 'submissions', label: 'Submission Alerts', description: 'Notify me about new submissions' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={(e) => handleNotificationChange(item.key, e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-600">{item.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logout Card */}
        <Card className="border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm">
          <CardContent className="p-6">
            <Button
              onClick={handleLogout}
              className="w-full gap-2 rounded-lg bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
