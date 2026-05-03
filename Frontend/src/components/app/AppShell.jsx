import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Activity,
  BellRing,
  ChevronRight,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { Card, CardContent } from '../ui/Card'
import { useOffline } from '../../hooks/useOffline'

export function MetricCard({ title, value, subtitle, icon: Icon, tone = 'slate' }) {
  const toneMap = {
    slate: 'from-slate-900 via-slate-800 to-slate-700 text-white',
    emerald: 'from-emerald-600 via-emerald-500 to-teal-500 text-white',
    amber: 'from-amber-500 via-orange-500 to-rose-500 text-white',
    sky: 'from-sky-600 via-cyan-500 to-teal-500 text-white',
    rose: 'from-rose-600 via-red-500 to-red-600 text-white',
  }

  // Handle multi-line subtitle (split by \n or newline)
  const renderSubtitle = () => {
    if (!subtitle) return null
    const lines = subtitle.split('\n').filter(Boolean)
    if (lines.length <= 1) {
      return <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-white/70">{subtitle}</p>
    }
    return (
      <div className="mt-1 sm:mt-2 space-y-0.5">
        {lines.map((line, idx) => (
          <p key={idx} className="text-xs sm:text-sm text-white/70">{line}</p>
        ))}
      </div>
    )
  }

  return (
    <Card className="overflow-hidden border-white/60 bg-white/85 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur-xl">
      <CardContent className="p-0">
        <div className={`relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br p-4 sm:p-5 ${toneMap[tone]}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.26),transparent_40%)]" />
          <div className="relative flex items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.24em] text-white/70">{title}</p>
              <h3 className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">{value}</h3>
              {renderSubtitle()}
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-2.5 sm:p-3 shadow-inner shadow-white/10 shrink-0">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Surface({ title, eyebrow, action = null, children, className = '' }) {
  return (
    <Card className={`border-white/70 bg-white/82 shadow-[0_24px_90px_-55px_rgba(15,23,42,0.45)] backdrop-blur-xl ${className}`}>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="mb-1 sm:mb-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

export function EmptyPanel({ title, description }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  )
}

export function StatusDot({ label, active = false, isOffline = false }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">
      {isOffline ? (
        <WifiOff className="h-2.5 w-2.5 text-slate-400" />
      ) : (
        <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]' : 'bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.12)]'}`} />
      )}
      {label}
    </span>
  )
}

export default function AppShell({
  title,
  subtitle,
  navItems,
  activeView,
  onChangeView,
  user,
  connected,
  notificationCount = 0,
  onLogout,
  children,
}) {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const { isOnline, queueLength, isSyncing, syncOfflineActions } = useOffline()

  const initials = useMemo(() => {
    if (!user?.name) return 'U'
    return user.name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
  }, [user?.name])

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-slate-900">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_26%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-[1680px] gap-3 sm:gap-4 lg:gap-6 px-3 py-3 sm:px-4 sm:py-4 lg:px-8">
        <aside className="hidden w-[290px] shrink-0 lg:block">
          <div className="sticky top-4 overflow-y-auto max-h-[calc(100vh-2rem)]">
            <SidebarContent
              user={user}
              navItems={navItems}
              activeView={activeView}
              onChangeView={onChangeView}
              connected={connected}
              notificationCount={notificationCount}
              onLogout={onLogout}
            />
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
            <Button variant="outline" onClick={() => setOpen(true)} className="gap-2 rounded-2xl border-white/70 bg-white/80">
              <Menu className="h-4 w-4" />
              Menu
            </Button>
            <div className="flex items-center gap-2">
              <StatusDot
                label={isOnline ? (connected ? 'Online & synced' : 'Online, reconnecting...') : 'Offline mode'}
                active={isOnline && connected}
                isOffline={!isOnline}
              />
              {queueLength > 0 && (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200"
                  onClick={syncOfflineActions}
                >
                  {queueLength} pending
                </Badge>
              )}
              <Link to="/settings">
                <Button variant="outline" className="rounded-2xl border-white/70 bg-white/80 px-3">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {open ? (
            <div className="fixed inset-0 z-40 bg-slate-950/40 px-3 py-3 backdrop-blur-sm lg:hidden">
              <div className="ml-auto h-full max-w-[280px] sm:max-w-[320px]">
                <div className="mb-3 flex justify-end">
                  <Button variant="outline" onClick={() => setOpen(false)} className="rounded-2xl bg-white/80">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="max-h-[calc(100vh-5rem)] overflow-y-auto">
                  <SidebarContent
                    user={user}
                    navItems={navItems}
                    activeView={activeView}
                    onChangeView={(value) => {
                      onChangeView(value)
                      setOpen(false)
                    }}
                    connected={connected}
                    notificationCount={notificationCount}
                    onLogout={onLogout}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <header className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4 rounded-[1.25rem] sm:rounded-[1.75rem] border border-white/70 bg-white/72 p-4 sm:p-5 shadow-[0_25px_100px_-55px_rgba(15,23,42,0.5)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="mb-1 sm:mb-2 flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.32em] text-sky-600">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Multi-Company Command Center
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
              <p className="mt-1 sm:mt-2 max-w-3xl text-xs sm:text-sm text-slate-500">{subtitle}</p>
            </div>

            <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center">
              <StatusDot
                label={isOnline ? (connected ? 'Realtime connected' : 'Realtime reconnecting') : 'Offline mode'}
                active={isOnline && connected}
                isOffline={!isOnline}
              />
              {queueLength > 0 && (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200 cursor-pointer hover:bg-amber-100"
                  onClick={syncOfflineActions}
                >
                  {isSyncing ? 'Syncing...' : `${queueLength} to sync`}
                </Badge>
              )}
              <div className="flex items-center gap-2 sm:gap-3 rounded-[1rem] sm:rounded-[1.25rem] border border-slate-200 bg-white/90 px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-sm">
                <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-xs sm:text-sm font-bold text-white shadow-lg">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs sm:text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="truncate text-[10px] sm:text-xs text-slate-500">
                    {user?.role === 'superadmin' ? 'Superadmin workspace' : user?.company?.name || 'Company admin workspace'}
                  </p>
                </div>
                <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 sm:flex">
                  <BellRing className="h-3.5 w-3.5" />
                  {notificationCount}
                </div>
              </div>
            </div>
          </header>

          <div key={location.pathname + activeView}>{children}</div>
        </div>
      </div>
    </div>
  )
}

function SidebarContent({
  user,
  navItems,
  activeView,
  onChangeView,
  connected,
  notificationCount,
  onLogout,
}) {
  const { isOnline, queueLength, isSyncing } = useOffline()
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,255,255,0.74))] p-4 shadow-[0_30px_110px_-60px_rgba(15,23,42,0.65)] backdrop-blur-xl">
      <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#0f172a_0%,#155e75_55%,#0f766e_100%)] p-5 text-white shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
            <Activity className="h-5 w-5" />
          </div>
          <Badge className="bg-white/15 text-white hover:bg-white/20">
            {user?.role === 'superadmin' ? 'Global Access' : 'Company Access'}
          </Badge>
        </div>
        <h2 className="font-display text-xl font-semibold tracking-tight">Control everything from one place</h2>
        <p className="mt-2 text-sm text-white/70">
          Premium multi-company operations, instructions, analytics, and AI-driven visibility.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusDot
            label={isOnline ? (connected ? 'Syncing live' : 'Online, reconnecting...') : 'Offline mode'}
            active={isOnline && connected}
            isOffline={!isOnline}
          />
          {queueLength > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              {isSyncing ? 'Syncing...' : `${queueLength} pending`}
            </span>
          )}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            <BellRing className="h-3.5 w-3.5" />
            {notificationCount} notifications
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {navItems.map((item) => {
          const active = activeView === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeView(item.id)}
              className={`group flex w-full items-center justify-between rounded-[1.25rem] px-4 py-3 text-left transition-all ${
                active
                  ? 'bg-slate-950 text-white shadow-lg'
                  : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-950'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={`rounded-2xl p-2 ${active ? 'bg-white/12' : 'bg-slate-100 text-slate-700'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className={`block text-xs ${active ? 'text-white/60' : 'text-slate-400'}`}>
                    {item.description}
                  </span>
                </span>
              </span>
              <ChevronRight className={`h-4 w-4 transition-transform ${active ? 'translate-x-0 text-white/70' : 'text-slate-300 group-hover:translate-x-1'}`} />
            </button>
          )
        })}
      </div>

      <div className="mt-5 rounded-[1.4rem] border border-slate-200/70 bg-white/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Workspace Shortcuts</p>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <Link to="/settings" className="inline-flex items-center gap-2 font-medium text-slate-700 hover:text-slate-950">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <Button variant="ghost" size="sm" onClick={onLogout} className="rounded-2xl text-rose-600 hover:bg-rose-50 hover:text-rose-700">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
