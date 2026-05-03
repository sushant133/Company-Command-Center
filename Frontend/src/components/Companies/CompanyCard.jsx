import { Card, CardContent } from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { Users, Briefcase, DollarSign, TrendingUp, Edit2, Trash2 } from 'lucide-react'
import { formatCurrency } from '../../utils/format'

export default function CompanyCard({ company, analytics, onEdit, onDelete, onView }) {
  return (
    <Card className="rounded-2xl hover:shadow-md transition-shadow">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3
              className="font-semibold text-slate-900 hover:text-slate-700 cursor-pointer text-lg"
              onClick={onView}
            >
              {company.name}
            </h3>
            <p className="text-sm text-slate-500">Code: {company.code}</p>
          </div>
          <Badge variant={company.status === 'Active' ? 'success' : 'destructive'}>
            {company.status}
          </Badge>
        </div>

        {/* Stats */}
        {analytics && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="h-4 w-4 text-slate-600" />
                <span className="text-xs text-slate-500">Projects</span>
              </div>
              <p className="font-semibold text-slate-900">{analytics.totalProjects}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-xs text-slate-500">Budget</span>
              </div>
              <p className="font-semibold text-slate-900">
                {formatCurrency(analytics.totalBudget / 1000000, 'M NPR')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-slate-500">Admins</span>
              </div>
              <p className="font-semibold text-slate-900">{company.admins?.length || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <span className="text-xs text-slate-500">At Risk</span>
              </div>
              <p className="font-semibold text-slate-900">{analytics.projectsAtRisk || 0}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete} className="flex-1 text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}