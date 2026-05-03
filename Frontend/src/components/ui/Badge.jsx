import { cn } from '../../utils/cn'

const Badge = ({ className, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
    outline: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
    destructive: 'bg-red-100 text-red-900 hover:bg-red-200',
    success: 'bg-green-100 text-green-900 hover:bg-green-200',
    warning: 'bg-amber-100 text-amber-900 hover:bg-amber-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export default Badge