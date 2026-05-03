import { Card, CardContent } from '../ui/Card'
import Badge from '../ui/Badge'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import Button from '../ui/Button'
import RagBadge from './RagBadge'

export default function FollowUpCard({ project = {}, onView = () => {} }) {
  // Provide defaults for missing data
  const {
    _id = '',
    name = 'Untitled Project',
    followUp = 'No follow-up required',
    priority = 'Medium',
    health = 'Green',
    nextActionBy = 'This Week',
  } = project

  return (
    <Card className="rounded-2xl hover:shadow-md transition-all cursor-pointer border-l-4 border-l-amber-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <h3 className="font-semibold text-slate-900 truncate">
                {name}
              </h3>
            </div>
            <p className="text-sm text-slate-600 mb-3">{followUp}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{priority}</Badge>
              <RagBadge status={health} />
              <Badge variant="secondary">{nextActionBy}</Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            className="flex-shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}