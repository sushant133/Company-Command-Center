import { useState, useEffect } from 'react'
import { X, CheckCircle2, AlertCircle } from 'lucide-react'

/**
 * Toast notification component
 * Auto-dismisses after 4 seconds
 * Usage: <Toast type="success" message="Item deleted" onClose={() => setToast(null)} />
 */
export default function Toast({ type = 'success', message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => onClose?.(), duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  const styles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    error: 'border-rose-200 bg-rose-50 text-rose-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
  }

  const Icon = type === 'success' ? CheckCircle2 : AlertCircle

  return (
    <div className={`rounded-[1.25rem] border px-4 py-3 text-sm shadow-sm ${styles[type]}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

/**
 * Hook for toast state management
 */
export function useToast(duration = 4000) {
  const [toast, setToast] = useState(null)

  const show = (message, type = 'success') => setToast({ message, type })
  const hide = () => setToast(null)

  // Auto-dismiss handled by Toast component
  return { toast, show, hide, Toast: () => <Toast {...toast} onClose={hide} duration={duration} /> }
}
