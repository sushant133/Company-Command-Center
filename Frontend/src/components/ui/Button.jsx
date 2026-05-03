import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const Button = forwardRef(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      isLoading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'

    const variants = {
      default:
        'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900',
      primary:
        'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600',
      secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-900',
      outline:
        'border border-slate-300 bg-white hover:bg-slate-50 focus-visible:ring-slate-900',
      ghost: 'hover:bg-slate-100 focus-visible:ring-slate-900',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
      success:
        'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600',
    }

    const sizes = {
      sm: 'h-9 px-3 text-sm rounded-lg',
      md: 'h-10 px-4 text-sm rounded-xl',
      lg: 'h-12 px-6 text-base rounded-2xl',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button