import { Card, CardContent } from '../ui/Card'
import { cn } from '../../utils/cn'

export default function KPICard({
  title,
  value,
  icon: Icon,
  subtext,
  trend = null,
  color = 'slate',
}) {
  const colorMap = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
  }

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {trend && (
              <span className={cn(
                'text-sm font-medium',
                trend.type === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.type === 'up' ? '↑' : '↓'} {trend.value}%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">{subtext}</p>
        </div>
        <div className={cn('p-3 rounded-2xl', colorMap[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  )
}