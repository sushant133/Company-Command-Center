import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'
import { X } from 'lucide-react'
import Button from './Button'

const Dialog = ({ open = false, onOpenChange, children }) => {
  const [isOpen, setIsOpen] = useState(open)

  useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => handleOpenChange(false)}
      />
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] shadow-lg duration-200">
        <div className="rounded-2xl bg-white shadow-lg">
          {children}
        </div>
      </div>
    </>
  )
}

const DialogContent = ({ className, children, onClose, ...props }) => (
  <div className={cn('relative p-6', className)} {...props}>
    <button
      onClick={onClose}
      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
    >
      <X className="h-4 w-4" />
    </button>
    {children}
  </div>
)

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left mb-4',
      className
    )}
    {...props}
  />
)

const DialogTitle = ({ className, ...props }) => (
  <h2
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
)

const DialogDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-slate-500', className)} {...props} />
)

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6',
      className
    )}
    {...props}
  />
)

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}