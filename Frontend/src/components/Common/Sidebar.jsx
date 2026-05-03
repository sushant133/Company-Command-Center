import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { USER_ROLES } from '../../utils/constants'
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  FileText,
  Settings,
  Menu,
  X,
  BarChart3,
  Users,
  LogOut,
  ChevronDown,
  Home,
  Calendar,
  TrendingUp,
} from 'lucide-react'

const navigationItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY_ADMIN, USER_ROLES.MANAGER],
  },
  {
    label: 'Projects',
    icon: Briefcase,
    path: '/projects',
    roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY_ADMIN, USER_ROLES.MANAGER],
  },
  {
    label: 'Companies',
    icon: Building2,
    path: '/companies',
    roles: [USER_ROLES.SUPER_ADMIN],
  },
  {
    label: 'Entries',
    icon: FileText,
    path: '/entries',
    roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY_ADMIN, USER_ROLES.MANAGER],
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
    roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY_ADMIN],
  },
  {
    label: 'Admin Panel',
    icon: Users,
    path: '/admin',
    roles: [USER_ROLES.SUPER_ADMIN],
  },
  {
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    roles: [USER_ROLES.SUPER_ADMIN, USER_ROLES.COMPANY_ADMIN, USER_ROLES.MANAGER],
  },
]

export default function Sidebar({ user }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const { logoutUser } = useAuth()

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  // Auto-close sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!user) return null

  // Filter navigation items based on user role
  const filteredItems = navigationItems.filter(item =>
    item.roles.includes(user.role)
  )

  const handleLogout = () => {
    logoutUser()
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white border border-slate-200 shadow-sm"
        title="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="h-6 w-6 text-slate-900" />
        ) : (
          <Menu className="h-6 w-6 text-slate-900" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative left-0 top-0 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 z-40 md:z-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-slate-900 text-lg">AD</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p className="text-xs text-slate-400">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {filteredItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Quick Stats */}
        <div className="px-3 py-4 border-t border-slate-800 space-y-2">
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">Logged in as</p>
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-900/30 hover:text-red-200 transition-all duration-200"
            title="Logout"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>

        {/* Sidebar Toggle for Desktop */}
        <div className="hidden md:flex px-3 py-2 border-t border-slate-800 justify-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            title="Toggle sidebar"
          >
            {isOpen ? (
              <ChevronDown className="h-5 w-5 rotate-90" />
            ) : (
              <ChevronDown className="h-5 w-5 -rotate-90" />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}