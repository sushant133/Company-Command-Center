import { Card, CardContent } from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { FileText, Trash2, CheckCircle, Clock } from 'lucide-react'
import { formatDate } from '../../utils/format'

export default function EntryCard({ entry, onApprove, onDelete, onView }) {
  const getTypeColor = (type) => {
    const colors = {
      Project: 'bg-blue-100 text-blue-700',
      Task: 'bg-purple-100 text-purple-700',
      HR: 'bg-green-100 text-green-700',
      Expense: 'bg-orange-100 text-orange-700',
      Finance: 'bg-red-100 text-red-700',
    }
    return colors[type] || 'bg-slate-100 text-slate-700'
  }

  return (
    <Card className="rounded-2xl hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3 flex-1">
            <FileText className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-900 truncate">{entry.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{formatDate(entry.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className={getTypeColor(entry.type)}>
            {entry.type}
          </Badge>
          {entry.metadata?.priority && (
            <Badge variant="outline">{entry.metadata.priority}</Badge>
          )}
          {entry.metadata?.amount && (
            <Badge variant="outline">NPR {entry.metadata.amount.toLocaleString()}</Badge>
          )}
        </div>

        {entry.description && (
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{entry.description}</p>
        )}

        <div className="flex gap-2">
          {!entry.approved && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onApprove}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
          )}
          {entry.approved && (
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Approved</span>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}