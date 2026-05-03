import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { Trash2, MessageSquare } from 'lucide-react'
import { formatTimeAgo } from '../../utils/format'
import LoadingSpinner from '../Common/LoadingSpinner'
import EmptyState from '../Common/EmptyState'

export default function CommentSection({
  comments = [],
  loading = false,
  onDelete,
  currentUser,
}) {
  if (loading) {
    return <LoadingSpinner text="Loading comments..." />
  }

  if (!comments || comments.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No comments yet"
        description="Start a conversation with your team"
      />
    )
  }

  return (
    <div className="space-y-3">
      {comments.map(comment => (
        <Card key={comment._id} className="rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">{comment.by.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {comment.by.role}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {formatTimeAgo(comment.createdAt)}
                </p>
              </div>
              {(currentUser?._id === comment.by._id || currentUser?.role === 'super_admin') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(comment._id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <p className="text-sm text-slate-700 mb-3">{comment.message}</p>

            {comment.notifyTo && comment.notifyTo.length > 0 && (
              <div className="p-2 rounded-lg bg-slate-50 text-xs">
                <p className="text-slate-600">
                  Notified: {comment.notifyTo.map(u => u.name).join(', ')}
                </p>
              </div>
            )}

            {comment.notificationStatus && (
              <div className="mt-2">
                <p className="text-xs text-slate-500 mb-1">Status:</p>
                <div className="space-y-1">
                  {comment.notificationStatus.map((status, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="flex-1">{status.user?.name}</span>
                      <Badge
                        variant="outline"
                        className={
                          status.status === 'Read'
                            ? 'bg-green-50 text-green-700'
                            : status.status === 'Notified'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-50'
                        }
                      >
                        {status.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}