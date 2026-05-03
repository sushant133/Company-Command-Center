import { forwardRef } from 'react'
import { cn } from '../../utils/cn'
import { Check } from 'lucide-react'

const Checkbox = forwardRef(({ className, checked, ...props }, ref) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        'h-4 w-4 rounded border border-slate-300 bg-white accent-slate-900',
        'cursor-pointer transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      checked={checked}
      {...props}
    />
  </div>
))

Checkbox.displayName = 'Checkbox'

export default Checkbox