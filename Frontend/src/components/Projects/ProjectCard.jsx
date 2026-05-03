import { Card, CardContent } from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import RagBadge from '../Dashboard/RagBadge'
import { Edit2, Trash2, MoreVertical } from 'lucide-react'
import { formatCurrency } from '../../utils/format'
import { useState } from 'react'

export default function ProjectCard({ project, onEdit, onDelete, onView }) {
  const [showMenu, setShowMenu] = useState(false)
  const budgetPercentage = (project.budget.spent / project.budget.total) * 100

  return (
    <Card className="rounded-2xl hover:shadow-md transition-shadow">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 hover:text-slate-700 cursor-pointer" onClick={onView}>
              {project.name}
            </h3>
            <p className="text-sm text-slate-600">Owner: {project.owner.name}</p>
          </div>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-100 rounded-lg">
              <MoreVertical className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl border border-slate-200 shadow-lg z-10">
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 rounded-t-lg"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{project.priority}</Badge>
          <Badge variant="outline">{project.status}</Badge>
          <RagBadge status={project.health} />
        </div>

        {/* Budget Info */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50">
          <div>
            <p className="text-xs text-slate-500">Budget</p>
            <p className="font-semibold">{formatCurrency(project.budget.total)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Spent</p>
            <p className="font-semibold">{formatCurrency(project.budget.spent)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Progress</p>
            <p className="font-semibold">{project.progress}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-slate-500">Budget Utilization</span>
            <span className="text-xs font-medium">{budgetPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-600 transition-all duration-300"
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Follow-up */}
        {project.followUp && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-900">{project.followUp}</p>
          </div>
        )}

        {/* Action Button */}
        <Button onClick={onView} variant="outline" className="w-full" size="sm">
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}