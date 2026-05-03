import { AlertCircle } from 'lucide-react'

const FormError = ({ message, className = '' }) => {
  if (!message) return null

  return (
    <div className={`flex items-center gap-2 text-sm text-red-600 mt-1 ${className}`} role="alert" aria-live="polite">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export default FormError

