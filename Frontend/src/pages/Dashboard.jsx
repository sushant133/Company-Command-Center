import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCompanies } from '../hooks/useCompanies'
import { useProjects } from '../hooks/useProjects'
import Header from '../components/Common/Header'
import Sidebar from '../components/Common/Sidebar'
import KPICard from '../components/Dashboard/KPICard'
import FollowUpCard from '../components/Dashboard/FollowUpCard'
import ExecutiveBriefing from '../components/Dashboard/ExecutiveBriefing'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Badge from '../components/ui/Badge'
import RagBadge from '../components/Dashboard/RagBadge'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import EmptyState from '../components/Common/EmptyState'
import {
  DollarSign,
  Wallet,
  AlertTriangle,
  Briefcase,
  TrendingUp,
  Plus,
  Search,
  ArrowRight,
} from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/format'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { companies } = useCompanies()
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  const { projects, isLoading: projectsLoading } = useProjects(
    selectedCompany !== 'all' ? { company: selectedCompany } : {}
  )

  const filteredProjects = useMemo(() => {
    if (!projects) return []
    return projects.filter(p => {
      const companyOk = selectedCompany === 'all' || p.company?._id === selectedCompany
      const searchOk = [p.name, p.owner?.name].join(' ').toLowerCase().includes(search.toLowerCase())
      return companyOk && searchOk
    })
  }, [projects, selectedCompany, search])

  const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget?.total || 0, 0)
  const totalSpent = filteredProjects.reduce((sum, p) => sum + p.budget?.spent || 0, 0)
  const followUpsNeeded = filteredProjects.filter(
    p => p.nextActionBy === 'Today' || p.blockers > 0 || p.health !== 'Green'
  )
  const projectsAtRisk = filteredProjects.filter(p => p.health === 'Red').length

  const analytics = {
    totalProjects: filteredProjects.length,
    activeProjects: filteredProjects.filter(p => p.status === 'In Progress').length,
    totalBudget,
    totalSpent,
    projectsAtRisk,
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    AI Executive Dashboard
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Portfolio-first view with analytics and insights
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/projects')}
                  size="lg"
                  className="w-fit"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Search projects, owners..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  title="Total Budget"
                  value={formatCurrency(totalBudget)}
                  icon={DollarSign}
                  subtext="Across selected companies"
                  color="blue"
                />
                <KPICard
                  title="Total Spent"
                  value={formatCurrency(totalSpent)}
                  icon={Wallet}
                  subtext="Live expense tracking"
                  color="green"
                />
                <KPICard
                  title="Follow-Ups Needed"
                  value={followUpsNeeded.length}
                  icon={AlertTriangle}
                  subtext="Requires immediate attention"
                  color="amber"
                />
                <KPICard
                  title="Active Projects"
                  value={analytics.activeProjects}
                  icon={Briefcase}
                  subtext={`of ${analytics.totalProjects} total`}
                  color="slate"
                />
              </div>

              {/* Main Content */}
              {projectsLoading ? (
                <LoadingSpinner text="Loading projects..." />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Follow-ups Section */}
                    <div>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        Where You Need to Follow Up
                      </h2>
                      {followUpsNeeded.length > 0 ? (
                        <div className="space-y-3">
                          {followUpsNeeded.map(project => (
                            <FollowUpCard
                              key={project._id}
                              project={project}
                              onView={() => navigate(`/projects/${project._id}`)}
                            />
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          title="All projects on track!"
                          description="No follow-ups needed at this time"
                          size="sm"
                        />
                      )}
                    </div>

                    {/* Executive Briefing */}
                    <ExecutiveBriefing analytics={analytics} />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Portfolio Overview */}
                    <Card className="rounded-2xl">
                      <CardHeader>
                        <CardTitle>Portfolio Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-slate-600 text-sm">Total Projects</span>
                            <span className="font-bold text-lg">{analytics.totalProjects}</span>
                          </div>
                          <div className="border-t border-slate-200" />
                          <div className="flex justify-between items-center py-2">
                            <span className="text-slate-600 text-sm">Active Projects</span>
                            <span className="font-bold text-lg text-green-600">
                              {analytics.activeProjects}
                            </span>
                          </div>
                          <div className="border-t border-slate-200" />
                          <div className="flex justify-between items-center py-2">
                            <span className="text-slate-600 text-sm">Projects at Risk</span>
                            <span className="font-bold text-lg text-red-600">
                              {projectsAtRisk}
                            </span>
                          </div>
                          <div className="border-t border-slate-200" />
                          <div className="flex justify-between items-center py-2">
                            <span className="text-slate-600 text-sm">Budget Utilization</span>
                            <span className="font-bold text-lg">
                              {totalBudget > 0
                                ? ((totalSpent / totalBudget) * 100).toFixed(0)
                                : 0}
                              %
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate('/analytics')}
                        >
                          View Full Analytics
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Recent Projects */}
                    <Card className="rounded-2xl">
                      <CardHeader>
                        <CardTitle>Recent Projects</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {filteredProjects.slice(0, 5).length > 0 ? (
                          <div className="space-y-2">
                            {filteredProjects.slice(0, 5).map(project => (
                              <div
                                key={project._id}
                                className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                                onClick={() => navigate(`/projects/${project._id}`)}
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-slate-900">
                                      {project.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {project.owner?.name}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2 items-center">
                                  <Badge variant="outline" className="text-xs">
                                    {project.status}
                                  </Badge>
                                  <RagBadge status={project.health} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 text-sm">No projects yet</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-base">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => navigate('/projects')}
                        >
                          View All Projects
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => navigate('/entries')}
                        >
                          Create Entry
                        </Button>
                        {user?.role === 'super_admin' && (
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => navigate('/companies')}
                          >
                            Manage Companies
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}