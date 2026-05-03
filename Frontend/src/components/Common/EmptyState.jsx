import { InboxIcon, AlertCircle } from 'lucide-react'
import Button from '../ui/Button'

/**
 * Empty State Component
 * Shows when there is no data to display
 */
export default function EmptyState({
  icon: Icon = InboxIcon,
  title = 'No data found',
  description = 'Get started by creating your first item',
  action = null,
  size = 'md',
  fullScreen = false,
}) {
  const sizes = {
    sm: { icon: 'h-12 w-12', title: 'text-lg', desc: 'text-sm' },
    md: { icon: 'h-16 w-16', title: 'text-2xl', desc: 'text-base' },
    lg: { icon: 'h-20 w-20', title: 'text-3xl', desc: 'text-lg' },
  }

  const config = sizes[size] || sizes.md

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white'
    : 'flex flex-col items-center justify-center py-12 px-4'

  return (
    <div className={containerClasses}>
      <div className="text-center max-w-md space-y-4">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-slate-100 p-4">
            <Icon className={`${config.icon} text-slate-600`} />
          </div>
        </div>

        {/* Title */}
        <h3 className={`${config.title} font-bold text-slate-900`}>
          {title}
        </h3>

        {/* Description */}
        <p className={`${config.desc} text-slate-600`}>
          {description}
        </p>

        {/* Action Button */}
        {action && (
          <div className="mt-6">
            <Button
              onClick={action.onClick}
              size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
            >
              {action.label}
            </Button>
          </div>
        )}

        {/* Additional Info */}
        {action?.info && (
          <p className="text-xs text-slate-500 mt-4">
            {action.info}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Error Empty State
 * Shows when there's an error
 */
export function ErrorEmptyState({
  title = 'Oops! Something went wrong',
  description = 'Please try again or contact support',
  onRetry = null,
  error = null,
  size = 'md',
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title={title}
      description={description}
      size={size}
      action={
        onRetry
          ? {
              label: 'Try Again',
              onClick: onRetry,
              info: error ? `Error: ${error}` : undefined,
            }
          : null
      }
    />
  )
}

/**
 * No Results Empty State
 */
export function NoResultsEmptyState({
  searchQuery = '',
  onClear = null,
  size = 'md',
}) {
  return (
    <EmptyState
      icon={InboxIcon}
      title="No results found"
      description={
        searchQuery
          ? `No results for "${searchQuery}". Try a different search term.`
          : 'No items match your filters.'
      }
      size={size}
      action={
        onClear
          ? {
              label: 'Clear Filters',
              onClick: onClear,
            }
          : null
      }
    />
  )
}

/**
 * Permission Denied Empty State
 */
export function PermissionDeniedEmptyState({
  action = null,
  size = 'md',
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Access Denied"
      description="You don't have permission to access this resource. Please contact your administrator."
      size={size}
      action={action}
    />
  )
}

/**
 * Maintenance Empty State
 */
export function MaintenanceEmptyState() {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Under Maintenance"
      description="We're currently performing maintenance. Please check back later."
      size="lg"
    />
  )
}