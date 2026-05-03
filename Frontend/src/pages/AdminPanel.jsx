import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/Common/Header'
import Sidebar from '../components/Common/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { AlertTriangle, Users, Building2, Briefcase, Settings } from 'lucide-react'

export default function AdminPanel() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'super_admin') {
      navigate('/dashboard')
    }
  }, [isAuthenticated, user, navigate])

  if (!user) return null

  const adminActions = [
    {
      icon: Building2,
      title: 'Manage Companies',
      description: 'Create, edit, and manage companies',
      link: '/companies',
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Manage users and their roles',
      link: '/admin/users',
    },
    {
      icon: Briefcase,
      title: 'Project Oversight',
      description: 'Monitor all projects across companies',
      link: '/projects',
    },
    {
      icon: Settings,
      title: 'System Settings',
      description: 'Configure system-wide settings',
      link: '/admin/settings',
    },
  ]

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <p className="text-slate-600 mt-1">System administration and management</p>
              </div>

              {/* Admin Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adminActions.map((action, index) => (
                  <Card
                    key={index}
                    className="rounded-2xl hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate(action.link)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-slate-100">
                          <action.icon className="h-6 w-6 text-slate-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">
                            {action.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* System Status */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">API Server</p>
                      <p className="text-sm text-slate-600">Backend connectivity</p>
                    </div>
                    <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">Database</p>
                      <p className="text-sm text-slate-600">Data persistence</p>
                    </div>
                    <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">WebSocket</p>
                      <p className="text-sm text-slate-600">Real-time updates</p>
                    </div>
                    <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}