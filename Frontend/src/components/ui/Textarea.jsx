import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const Textarea = forwardRef(
  ({ className, error, label, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm',
          'placeholder:text-slate-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
)

Textarea.displayName = 'Textarea'

export default Textarea