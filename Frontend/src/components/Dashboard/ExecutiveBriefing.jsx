import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import {
  AlertCircle,
  TrendingUp,
  Users,
  Target,
} from 'lucide-react'

export default function ExecutiveBriefing({ analytics = {} }) {
  // Provide default values
  const {
    projectsAtRisk = 0,
    totalSpent = 0,
    totalBudget = 0,
    activeProjects = 0,
    totalProjects = 0,
  } = analytics

  const insights = [
    {
      icon: AlertCircle,
      text: `${projectsAtRisk} projects need follow-up due to blockers, risk level, or timeline pressure.`,
    },
    {
      icon: TrendingUp,
      text: `Total project spend is tracking at NPR ${(totalSpent / 1000000).toFixed(1)}M against a total budget of NPR ${(totalBudget / 1000000).toFixed(1)}M.`,
    },
    {
      icon: Users,
      text: `${activeProjects} projects are currently in progress with ${totalProjects} total projects.`,
    },
    {
      icon: Target,
      text: 'Use the portfolio view to track priority, budgets, expenses, timeline stage, and the exact next action needed.',
    },
  ]

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          AI Executive Briefing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50"
            >
              <Icon className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-700">{insight.text}</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}