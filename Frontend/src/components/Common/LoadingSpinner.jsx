import { cn } from '../../utils/cn'

/**
 * Loading Spinner Component
 * Shows a loading indicator with optional text
 */
export default function LoadingSpinner({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
  transparent = false,
}) {
  const sizes = {
    sm: { spinner: 'h-6 w-6', text: 'text-sm' },
    md: { spinner: 'h-12 w-12', text: 'text-base' },
    lg: { spinner: 'h-16 w-16', text: 'text-lg' },
  }

  const config = sizes[size] || sizes.md

  const containerClasses = cn(
    'flex flex-col items-center justify-center gap-4',
    fullScreen && 'fixed inset-0 z-50',
    transparent ? 'bg-transparent' : 'bg-white rounded-2xl p-8',
    !fullScreen && 'p-8'
  )

  return (
    <div className={containerClasses}>
      {/* Spinner */}
      <div className={cn(config.spinner, 'animate-spin')}>
        <svg
          className="h-full w-full text-slate-900"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>

      {/* Text */}
      {text && (
        <p className={cn('text-slate-600 font-medium', config.text)}>
          {text}
        </p>
      )}

      {/* Dots animation (optional visual) */}
      <style>{`
        @keyframes dots {
          0%, 20% { content: ''; }
          40% { content: '.'; }
          60% { content: '..'; }
          80%, 100% { content: '...'; }
        }
      `}</style>
    </div>
  )
}

/**
 * Inline Loading Skeleton
 * Shows skeleton loaders for content
 */
export function LoadingSkeleton({ count = 3, className = '' }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse"
        />
      ))}
    </div>
  )
}

/**
 * Table Loading Skeleton
 */
export function TableLoadingSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-3">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="flex-1 h-12 rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  )
}