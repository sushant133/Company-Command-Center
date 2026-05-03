import Badge from '../ui/Badge'

export default function RagBadge({ status }) {
  const statusMap = {
    Green: {
      variant: 'success',
      label: 'On Track',
    },
    Amber: {
      variant: 'warning',
      label: 'At Risk',
    },
    Red: {
      variant: 'destructive',
      label: 'Critical',
    },
  }

  const config = statusMap[status] || statusMap.Amber

  return <Badge variant={config.variant}>{config.label}</Badge>
}