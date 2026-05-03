import { cn } from '../../utils/cn'

const Card = ({ className, ...props }) => (
  <div
    className={cn(
      'rounded-2xl border border-slate-200 bg-white shadow-sm',
      className
    )}
    {...props}
  />
)

const CardHeader = ({ className, ...props }) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 border-b border-slate-200 p-6',
      className
    )}
    {...props}
  />
)

const CardTitle = ({ className, ...props }) => (
  <h2
    className={cn(
      'text-xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
)

const CardDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-slate-600', className)} {...props} />
)

const CardContent = ({ className, ...props }) => (
  <div className={cn('p-6', className)} {...props} />
)

const CardFooter = ({ className, ...props }) => (
  <div
    className={cn(
      'flex items-center justify-between border-t border-slate-200 p-6',
      className
    )}
    {...props}
  />
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }