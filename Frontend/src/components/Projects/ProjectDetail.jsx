import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import RagBadge from '../Dashboard/RagBadge'
import { ArrowLeft, Edit2, Plus } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/format'
import LoadingSpinner from '../Common/LoadingSpinner'

export default function ProjectDetail({ project, loading = false, onBack, onEdit, onAddEntry }) {
  const [expandedSection, setExpandedSection] = useState('overview')

  if (loading || !project) {
    return <LoadingSpinner text="Loading project details..." />
  }

  const budgetPercentage = (project.budget.spent / project.budget.total) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-slate-600">Owner: {project.owner.name}</p>
        </div>
        <Button onClick={onEdit} size="md">
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Project
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Priority</p>
            <Badge className="mt-2" variant="secondary">{project.priority}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Status</p>
            <Badge className="mt-2">{project.status}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Health</p>
            <div className="mt-2"><RagBadge status={project.health} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Blockers</p>
            <p className="text-2xl font-bold mt-1">{project.blockers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Details */}
      <Card>
        <CardHeader>
          <CardTitle>Budget & Spend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-500">Total Budget</p>
              <p className="text-2xl font-bold">{formatCurrency(project.budget.total)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Spent</p>
              <p className="text-2xl font-bold">{formatCurrency(project.budget.spent)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Remaining</p>
              <p className="text-2xl font-bold">
                {formatCurrency(project.budget.total - project.budget.spent)}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Budget Utilization</span>
              <span className="text-sm font-medium">{budgetPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 transition-all duration-300"
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {project.timeline && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Start Date</p>
              <p className="font-medium">{formatDate(project.timeline.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">End Date</p>
              <p className="font-medium">{formatDate(project.timeline.endDate)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Completion</span>
              <span className="text-sm font-medium">{project.progress}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Required */}
      {project.followUp && (
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="text-amber-900">Follow-up Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800">{project.followUp}</p>
          </CardContent>
        </Card>
      )}

      {/* Entries */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Project Entries</CardTitle>
          <Button onClick={onAddEntry} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </CardHeader>
        <CardContent>
          {project.entries && project.entries.length > 0 ? (
            <div className="space-y-2">
              {project.entries.map(entry => (
                <div
                  key={entry._id}
                  className="p-3 rounded-lg bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">{entry.title}</p>
                    <p className="text-sm text-slate-500">{entry.type}</p>
                  </div>
                  <Badge variant="outline">{entry.type}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No entries yet</p>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 whitespace-pre-wrap">{project.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}