import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import Header from '../components/Common/Header'
import Sidebar from '../components/Common/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import EmptyState from '../components/Common/EmptyState'
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'

/**
 * Manager Dashboard
 * View and manage assigned tasks/projects
 */
export default function ManagerDashboard({ user }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { projects = [], isLoading } = useProjects()

  // Filter projects assigned to this manager
  const myProjects = useMemo(() => {
    if (!projects) return []
    return projects.filter(
      (p) => p.owner?._id === user?.id || p.owner?.email === user?.email
    )
  }, [projects, user])

  const filteredProjects = useMemo(() => {
    return myProjects.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [myProjects, search])

  const stats = {
    total: myProjects.length,
    completed: myProjects.filter((p) => p.status === 'Completed').length,
    inProgress: myProjects.filter((p) => p.status === 'In Progress').length,
    atRisk: myProjects.filter((p) => p.health === 'Red').length,
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    My Projects
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Track your assigned projects and tasks
                  </p>
                </div>
                <Button onClick={() => navigate('/projects')} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your projects..."
                  className="pl-10"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="rounded-2xl">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-slate-500">Total Projects</div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.completed}
                    </div>
                    <div className="text-sm text-slate-500">Completed</div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.inProgress}
                    </div>
                    <div className="text-sm text-slate-500">In Progress</div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.atRisk}
                    </div>
                    <div className="text-sm text-slate-500">At Risk</div>
                  </CardContent>
                </Card>
              </div>

              {/* Projects List */}
              {isLoading ? (
                <LoadingSpinner text="Loading projects..." />
              ) : filteredProjects.length > 0 ? (
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Projects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {filteredProjects.map((project) => (
                      <div
                        key={project._id}
                        className="border rounded-xl p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/projects/${project._id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{project.name}</h3>
                            <p className="text-sm text-slate-500">
                              {project.timeline?.startDate &&
                                `${new Date(project.timeline.startDate).toLocaleDateString()} - ${new Date(project.timeline.endDate).toLocaleDateString()}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge
                              variant={
                                project.status === 'Completed'
                                  ? 'outline'
                                  : 'secondary'
                              }
                            >
                              {project.status}
                            </Badge>
                            <Badge
                              variant={
                                project.health === 'Green'
                                  ? 'outline'
                                  : project.health === 'Amber'
                                    ? 'secondary'
                                    : 'destructive'
                              }
                            >
                              {project.health}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-slate-600">
                              Budget: NPR{' '}
                              {project.budget?.total.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-slate-900"
                              style={{
                                width: `${Math.min(100, (project.budget?.spent / project.budget?.total) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <EmptyState
                  title="No projects assigned"
                  description="You don't have any projects yet. Contact your admin to get started."
                  size="lg"
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}