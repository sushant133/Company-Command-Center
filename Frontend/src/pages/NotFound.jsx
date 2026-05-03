import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4">
      <div className="max-w-lg rounded-[2rem] border border-white/80 bg-white/82 p-10 text-center shadow-[0_30px_120px_-60px_rgba(15,23,42,0.55)] backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white shadow-xl">
          <Compass className="h-9 w-9" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-sky-600">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          That workspace view does not exist.
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          The page you tried to access is not part of the current control center route map.
        </p>
        <Link to="/dashboard" className="mt-6 inline-flex">
          <Button size="lg" className="rounded-2xl">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
