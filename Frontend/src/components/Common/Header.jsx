import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotificationStore, showError } from '../../store/notificationStore'
import Button from '../ui/Button'
import {
  Bell,
  User,
  LogOut,
  Settings,
  Menu,
  X,
  Search,
  ChevronDown,
} from 'lucide-react'

export default function Header() {
  const navigate = useNavigate()
  const { user, logoutUser } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Mock notifications - replace with real API call
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'project',
        message: 'Project "Skill Week 2026" requires your attention',
        time: '5 minutes ago',
        read: false,
      },
      {
        id: 2,
        type: 'comment',
        message: 'Asha Sharma commented on "Training Lab Upgrade"',
        time: '1 hour ago',
        read: false,
      },
      {
        id: 3,
        type: 'approval',
        message: 'Budget approval request from Finance Team',
        time: '3 hours ago',
        read: true,
      },
    ]
    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }, [])

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implement global search
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  const handleNotificationClick = (notification) => {
    // Mark as read and navigate
    if (!notification.read) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'project':
        navigate('/projects')
        break
      case 'comment':
        navigate('/entries')
        break
      case 'approval':
        navigate('/dashboard')
        break
      default:
        break
    }

    setShowNotifications(false)
  }

  const getNotificationIcon = (type) => {
    const icons = {
      project: '📊',
      comment: '💬',
      approval: '✅',
      alert: '⚠️',
    }
    return icons[type] || '📢'
  }

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold">
            AD
          </div>
          <span className="font-semibold text-slate-900 hidden sm:inline">
            Dashboard
          </span>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="w-full relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search Button - Mobile */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Search"
          >
            <Search className="h-5 w-5 text-slate-600" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {notifications.map(notification => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                            !notification.read ? 'bg-slate-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-lg flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-slate-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-slate-200">
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium w-full py-1">
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-xl transition-colors"
              title="Profile"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-900 max-w-xs truncate">
                {user?.name}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-600 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                {/* User Info */}
                <div className="px-4 py-4 border-b border-slate-200">
                  <p className="font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-600 mt-1">{user?.email}</p>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      navigate('/settings')
                      setShowProfileMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors group"
                  >
                    <Settings className="h-4 w-4 text-slate-600 group-hover:text-slate-900" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/profile')
                      setShowProfileMenu(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors group"
                  >
                    <User className="h-4 w-4 text-slate-600 group-hover:text-slate-900" />
                    <span>View Profile</span>
                  </button>

                  <hr className="my-2 border-slate-200" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                  >
                    <LogOut className="h-4 w-4 text-red-600 group-hover:text-red-700" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="md:hidden px-6 pb-4 border-t border-slate-200">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </form>
        </div>
      )}

      {/* Close menus when clicking outside */}
      {(showProfileMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowProfileMenu(false)
            setShowNotifications(false)
          }}
        />
      )}
    </header>
  )
}