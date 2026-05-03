import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Shield, ArrowLeft, ArrowRight, CheckCircle, Loader2, Eye, EyeOff, KeyRound, RefreshCw } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { authAPI } from '../api/auth'
import { showError, showSuccess } from '../store/notificationStore'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Store email and OTP across steps
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')

  const [values, setValues] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  const handleChange = (field) => (event) => {
    setValues((current) => ({
      ...current,
      [field]: event.target.value,
    }))
    setError('')
  }

  // Step 1: Send OTP
  const handleSendOTP = async (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      await authAPI.forgotPassword({ email: email.trim() })
      showSuccess('OTP sent to your email!')
      setStep(2)
    } catch (err) {
      const errorMsg = err.message || 'Failed to send OTP. Please try again.'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (event) => {
    event.preventDefault()
    setError('')

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      await authAPI.verifyOTP({ email: email.trim(), otp: otp.trim() })
      showSuccess('OTP verified successfully!')
      setStep(3)
    } catch (err) {
      const errorMsg = err.message || 'Invalid OTP. Please try again.'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset Password
  const handleResetPassword = async (event) => {
    event.preventDefault()
    setError('')

    if (!values.newPassword) {
      setError('Please enter a new password')
      return
    }

    if (values.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (values.newPassword !== values.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await authAPI.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword: values.newPassword,
      })
      showSuccess('Password reset successfully! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      const errorMsg = err.message || 'Failed to reset password. Please try again.'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError('')
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email: email.trim() })
      showSuccess('New OTP sent to your email!')
      setOtp('')
    } catch (err) {
      const errorMsg = err.message || 'Failed to resend OTP. Please try again.'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setLoading(false)
    }
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
        <div className="w-full max-w-md">
          {/* Back to Login */}
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>

          <Card className="border-white/10 bg-white/95 shadow-2xl backdrop-blur-xl">
            <CardContent className="p-8 sm:p-10">
              {/* Header */}
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-600">
                    Password Recovery
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {step === 1 && 'Forgot your password?'}
                    {step === 2 && 'Verify OTP'}
                    {step === 3 && 'Create new password'}
                  </h2>
                </div>
                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                          s < step
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                            : s === step
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {s < step ? <CheckCircle className="h-4 w-4" /> : s}
                      </div>
                      {s < 3 && (
                        <div
                          className={`h-1 w-12 sm:w-16 mx-1 rounded-full transition-all duration-300 ${
                            s < step ? 'bg-green-500' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-slate-500 font-medium">Email</span>
                  <span className="text-xs text-slate-500 font-medium">Verify</span>
                  <span className="text-xs text-slate-500 font-medium">Reset</span>
                </div>
              </div>

              {/* Step 1: Enter Email */}
              {step === 1 && (
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <p className="text-sm text-slate-600">
                    Enter your registered email address and we'll send you a 6-digit OTP code to reset your password.
                  </p>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">
                      Email Address<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setError('')
                        }}
                        placeholder="name@company.com"
                        className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder-slate-400 pl-10 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    isLoading={loading}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                  >
                    Send OTP
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}

              {/* Step 2: Enter OTP */}
              {step === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                    <p className="text-sm text-blue-800">
                      We've sent a 6-digit OTP to{' '}
                      <strong className="font-semibold">{email}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">
                      Enter 6-digit OTP<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        value={otp}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                          setOtp(val)
                          setError('')
                        }}
                        placeholder="123456"
                        className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder-slate-400 pl-10 text-center tracking-[0.5em] font-mono text-lg focus:border-blue-500 focus:ring-blue-500/20"
                        required
                        maxLength={6}
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    isLoading={loading}
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                  >
                    Verify OTP
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Resend OTP
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <p className="text-sm text-slate-600">
                    Create a strong new password for your account.
                  </p>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">
                      New Password<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={values.newPassword}
                        onChange={handleChange('newPassword')}
                        placeholder="Min 6 characters"
                        className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder-slate-400 pl-10 pr-10 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">
                      Confirm Password<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={values.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                        placeholder="Re-enter your password"
                        className="rounded-xl border-slate-200 bg-white text-slate-900 placeholder-slate-400 pl-10 pr-10 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    isLoading={loading}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                  >
                    Reset Password
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
