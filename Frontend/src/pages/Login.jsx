import { useState, useTransition } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Lock, Mail, Shield, ArrowRight, Building2, Sparkles, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import FormError from '../components/ui/FormError'
import { useAuth } from '../hooks/useAuth'
import { showError } from '../store/notificationStore'
import { loginSchema } from '../validations/zodSchemas'
import Label from '../components/ui/Label'

export default function Login() {
  const { isAuthenticated, loading, login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    clearErrors
  } = useForm({
    resolver: zodResolver(loginSchema)
  })

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (data) => {
    startTransition(async () => {
      try {
        await login(data.email, data.password)
        clearErrors()
      } catch (err) {
        const errorMsg = err.message || 'An error occurred'
        showError(errorMsg)
        throw err
      }
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950">
      {/* Animated background orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left side - Brand & Features */}
            <div className="order-2 lg:order-1 space-y-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:pr-2">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 p-2.5 shadow-lg shadow-blue-500/25">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Command Center</h1>
                  <p className="text-sm text-blue-200/80">Multi-Company Management</p>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Platform
                </div>

                <h2 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                  Manage multiple companies from one unified workspace.
                </h2>

                <p className="mt-6 text-lg leading-8 text-blue-100/70">
                  A premium command center for superadmin and company admins with real-time collaboration, dynamic workflows, AI insights, and enterprise-grade analytics.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: 'Real-time Visibility',
                    icon: '👁️',
                    text: 'Monitor all companies, tasks, and submissions live.',
                  },
                  {
                    title: 'Dynamic Operations',
                    icon: '⚙️',
                    text: 'Create custom workflows without any coding.',
                  },
                  {
                    title: 'AI Analytics',
                    icon: '🤖',
                    text: 'Get intelligent insights and predictions.',
                  },
                  {
                    title: 'Secure & Scalable',
                    icon: '🔒',
                    text: 'Enterprise-grade security built-in.',
                  },
                ].map((feature) => (
                  <Card key={feature.title} className="border-white/10 bg-white/5 backdrop-blur-xl hover:border-blue-400/30 hover:bg-blue-500/10 transition-all duration-300 shadow-lg">
                    <CardContent className="p-5">
                      <div className="text-2xl mb-2">{feature.icon}</div>
                      <p className="text-sm font-semibold text-white">{feature.title}</p>
                      <p className="mt-2 text-sm text-blue-200/60">{feature.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Right side - Login Form */}
            <div className="order-1 lg:order-2 flex justify-center">
              <Card className="border-white/10 bg-white/95 shadow-2xl backdrop-blur-xl w-full max-w-md">
                <CardContent className="p-8 sm:p-10">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-600">
                        Secure Access
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        Welcome back to your command center
                      </h2>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10 pr-4 rounded-xl border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                          placeholder="name@company.com"
                          {...register('email')}
                          aria-invalid={!!errors.email}
                          aria-describedby="email-error"
                        />
                        <FormError id="email-error" message={errors.email?.message} />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          className="pl-10 pr-10 rounded-xl border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                          placeholder="Enter your password"
                          {...register('password')}
                          aria-invalid={!!errors.password}
                          aria-describedby="password-error"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          tabIndex={-1}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <FormError id="password-error" message={errors.password?.message} />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || isPending || !isValid}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                    >
                      {(loading || isPending) ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Forgot Password Link */}
                  <div className="mt-6 text-center">
                    <Link
                      to="/forgot-password"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <p className="mt-6 text-center text-xs text-slate-400">
                    Protected by enterprise-grade security
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

