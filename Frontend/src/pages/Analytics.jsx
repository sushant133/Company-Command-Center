import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCompanies } from '../hooks/useCompanies'
import { useProjects } from '../hooks/useProjects'
import Header from '../components/Common/Header'
import Sidebar from '../components/Common/Sidebar'
import KPICard from '../components/Dashboard/KPICard'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  Briefcase,
  DollarSign,
} from 'lucide-react'
import { formatCurrency } from '../utils/format'

export default function Analytics() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { companies } = useCompanies()
  const { projects } = useProjects()

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  if (!user) return null

  const totalBudget = projects?.reduce((sum, p) => sum + (p.budget?.total || 0), 0) || 0
  const totalSpent = projects?.reduce((sum, p) => sum + (p.budget?.spent || 0), 0) || 0
  const totalProjects = projects?.length || 0
  const completedProjects = projects?.filter(p => p.status === 'Completed').length || 0
  const atRiskProjects = projects?.filter(p => p.health === 'Red').length || 0

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
                <h1 className="text-3xl font-bold">Analytics</h1>
                <p className="text-slate-600 mt-1">
                  Insights and metrics across your organization
                </p>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <KPICard
                  title="Total Companies"
                  value={companies?.length || 0}
                  icon={Users}
                  subtext="Active organizations"
                  color="slate"
                />
                <KPICard
                  title="Total Projects"
                  value={totalProjects}
                  icon={Briefcase}
                  subtext="Across all companies"
                  color="blue"
                />
                <KPICard
                  title="Total Budget"
                  value={formatCurrency(totalBudget)}
                  icon={DollarSign}
                  subtext="All projects"
                  color="green"
                />
                <KPICard
                  title="Total Spent"
                  value={formatCurrency(totalSpent)}
                  icon={TrendingUp}
                  subtext="Actual expenses"
                  color="amber"
                />
                <KPICard
                  title="Completed"
                  value={completedProjects}
                  icon={BarChart3}
                  subtext="Projects completed"
                  color="green"
                />
                <KPICard
                  title="At Risk"
                  value={atRiskProjects}
                  icon={BarChart3}
                  subtext="Needs attention"
                  color="red"
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Budget Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center text-slate-500">
                    <p>Chart visualization (requires Recharts integration)</p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Project Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center text-slate-500">
                    <p>Chart visualization (requires Recharts integration)</p>
                  </CardContent>
                </Card>
              </div>

              {/* Company Performance */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Company Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {companies?.map(company => {
                      const companyProjects = projects?.filter(p => p.company?._id === company._id) || []
                      const companyBudget = companyProjects.reduce((sum, p) => sum + (p.budget?.total || 0), 0)
                      const companySpent = companyProjects.reduce((sum, p) => sum + (p.budget?.spent || 0), 0)

                      return (
                        <div key={company._id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{company.name}</h4>
                              <p className="text-sm text-slate-600">
                                {companyProjects.length} projects
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(companyBudget)}</p>
                              <p className="text-xs text-slate-600">
                                {companyBudget > 0
                                  ? ((companySpent / companyBudget) * 100).toFixed(0)
                                  : 0}
                                % spent
                              </p>
                            </div>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full">
                            <div
                              className="h-full bg-slate-900 rounded-full transition-all"
                              style={{
                                width: `${companyBudget > 0 ? (companySpent / companyBudget) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
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