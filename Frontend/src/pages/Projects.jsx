import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProjects } from '../hooks/useProjects'
import { useCompanies } from '../hooks/useCompanies'
import Header from '../components/Common/Header'
import Sidebar from '../components/Common/Sidebar'
import ProjectDetail from '../components/Projects/ProjectDetail'
import ProjectForm from '../components/Projects/ProjectForm'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import EmptyState from '../components/Common/EmptyState'
import { Plus, Search, ArrowLeft, Eye, Edit2, Trash2 } from 'lucide-react'

export default function Projects() {
  const navigate = useNavigate()
  const location = useLocation()
  const { projectId } = useParams()
  const { user, isAuthenticated } = useAuth()
  const { companies } = useCompanies()
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  const params = {}
  if (selectedCompany !== 'all') params.company = selectedCompany
  if (status !== 'all') params.status = status
  if (priority !== 'all') params.priority = priority

  const {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    refetch,
  } = useProjects(params)

  const isCreateRoute = location.pathname === '/projects/new'
  const isEditRoute = location.pathname.endsWith('/edit')
  const isDetailRoute = Boolean(projectId) && !isEditRoute

  const filteredProjects = useMemo(() => {
    if (!projects) return []
    return projects.filter(p =>
      [p.name, p.owner?.name].join(' ').toLowerCase().includes(search.toLowerCase())
    )
  }, [projects, search])

  if (!user) return null

  const selectedProject = projects?.find(p => p._id === projectId)

  const handleCloseForm = () => {
    navigate('/projects')
  }

  const handleCreateProject = (data) => {
    createProject(
      {
        ...data,
        company:
          companies?.find((company) => company._id === selectedCompany) ||
          companies?.[0] ||
          null,
        owner: {
          _id: user._id,
          name: user.name,
        },
        budget: {
          total: data.budget,
          spent: 0,
        },
        timeline: {
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        },
        entries: [],
      },
      {
        onSuccess: (response) => {
          navigate(`/projects/${response.project._id}`)
        },
      }
    )
  }

  const handleUpdateProject = (data) => {
    if (!selectedProject) return

    updateProject(
      {
        id: selectedProject._id,
        data: {
          ...data,
          budget: {
            total: data.budget,
            spent: selectedProject.budget?.spent || 0,
          },
        },
      },
      {
        onSuccess: () => {
          navigate(`/projects/${selectedProject._id}`)
        },
      }
    )
  }

  if (isDetailRoute) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="max-w-7xl mx-auto space-y-6">
                {selectedProject ? (
                  <>
                    <button
                      onClick={() => navigate('/projects')}
                      className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      Back to Projects
                    </button>
                    <ProjectDetail
                      project={selectedProject}
                      loading={isLoading}
                      onBack={() => navigate('/projects')}
                      onEdit={() => navigate(`/projects/${selectedProject._id}/edit`)}
                      onAddEntry={() => navigate('/entries')}
                    />
                  </>
                ) : (
                  <EmptyState
                    title="Project not found"
                    description="The project route is valid, but this project could not be loaded."
                    action={{ label: 'Back to Projects', onClick: () => navigate('/projects') }}
                  />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    )
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Projects</h1>
                  <p className="text-slate-600 mt-1">Manage all your projects in one place</p>
                </div>
                <Button onClick={() => navigate('/projects/new')} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>

              {/* Filters */}
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                    >
                      <option value="all">All Companies</option>
                      {companies?.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </Select>

                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search projects..."
                        className="pl-10"
                      />
                    </div>

                    <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                    </Select>

                    <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                      <option value="all">All Priority</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Projects Grid */}
              {isLoading ? (
                <LoadingSpinner text="Loading projects..." />
              ) : filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map(project => (
                    <Card key={project._id} className="rounded-2xl hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{project.name}</h3>
                            <p className="text-sm text-slate-600">
                              {project.owner?.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{project.priority}</Badge>
                          <Badge variant="outline">{project.status}</Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full">
                            <div
                              className="h-full bg-slate-900 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate(`/projects/${project._id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate(`/projects/${project._id}/edit`)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-red-600"
                            onClick={() => deleteProject(project._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-600 mb-4">No projects found</p>
                  <Button onClick={() => navigate('/projects/new')}>
                    Create First Project
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <ProjectForm
        open={isCreateRoute || isEditRoute}
        onClose={handleCloseForm}
        initialData={isEditRoute ? selectedProject : null}
        onSubmit={isEditRoute ? handleUpdateProject : handleCreateProject}
      />
    </div>
  )
}
