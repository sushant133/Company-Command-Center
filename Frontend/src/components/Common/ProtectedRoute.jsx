import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { hydrated, bootstrapping, isAuthenticated } = useAuth()

  if (!hydrated || bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)]">
        <div className="rounded-full border border-white/10 bg-white/70 px-5 py-3 text-sm font-medium text-slate-700 shadow-xl backdrop-blur">
          Loading workspace...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
