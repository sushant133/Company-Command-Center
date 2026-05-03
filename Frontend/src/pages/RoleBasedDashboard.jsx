import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import SuperAdminDashboard from './SuperAdminDashboard'
import CompanyAdminDashboard from './CompanyAdminDashboard'
import ManagerDashboard from './ManagerDashboard'
import LoadingSpinner from '../components/Common/LoadingSpinner'

/**
 * Role-Based Dashboard Router
 * Directs users to appropriate dashboard based on their role
 */
export default function RoleBasedDashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login')
    }
  }, [isAuthenticated, loading, navigate])

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />
  }

  if (!user) {
    return null
  }

  // Route based on user role
  switch (user.role) {
    case 'super_admin':
      return <SuperAdminDashboard user={user} />
    case 'company_admin':
      return <CompanyAdminDashboard user={user} />
    case 'manager':
      return <ManagerDashboard user={user} />
    default:
      return <ManagerDashboard user={user} />
  }
}