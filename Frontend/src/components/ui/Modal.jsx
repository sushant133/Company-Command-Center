import { X } from 'lucide-react'
import Button from './Button'

export function Modal({ isOpen, onClose, title, children, footer = null, size = 'md', className = '' }) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md max-w-[95vw] sm:max-w-md',
    lg: 'max-w-lg max-w-[95vw] sm:max-w-lg',
    xl: 'max-w-xl max-w-[95vw] sm:max-w-xl',
    '2xl': 'max-w-2xl max-w-[95vw] sm:max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className={`${sizeClasses[size]} w-full rounded-xl border border-white/10 bg-slate-900 shadow-2xl ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && <div className="border-t border-white/10 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, description, danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="mb-6 text-slate-300">{description}</p>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1 rounded-lg border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          className={`flex-1 rounded-lg ${
            danger
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {danger ? 'Delete' : 'Confirm'}
        </Button>
      </div>
    </Modal>
  )
}
