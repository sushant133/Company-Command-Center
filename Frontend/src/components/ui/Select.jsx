import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const Select = forwardRef(
  ({ className, error, label, children, options, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={cn(
          'flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm',
          'placeholder:text-slate-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        ref={ref}
        {...props}
      >
        {options && options.length > 0
          ? options.map((option, index) => (
              <option key={option.value || index} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
)

Select.displayName = 'Select'

export const SelectGroup = ({ className, ...props }) => (
  <optgroup className={cn('font-medium', className)} {...props} />
)

export const SelectItem = (props) => <option {...props} />

export default Select