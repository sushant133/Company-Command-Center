import { useState, useEffect, useTransition } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCompanies } from '../hooks/useCompanies'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Label from '../components/ui/Label'
import FormError from '../components/ui/FormError'
import {
  AlertTriangle,
  UserPlus,
  Mail,
  Lock,
  User,
  Building2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { registerSchema } from '../validations/zodSchemas'

export default function Register() {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()
  const { companies } = useCompanies()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isValid },
    control,
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(registerSchema)
  })

  const role = useWatch({ control, name: 'role' })

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (data) => {
    startTransition(async () => {
      try {
        await register(
          data.name,
          data.email,
          data.password,
          data.role,
          data.role === 'manager' ? data.company : null
        )
        navigate('/dashboard')
      } catch (err) {
        throw new Error(err.message || 'Registration failed. Please try again.')
      }
    })
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      {/* Card */}
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white font-bold text-lg">
              AD
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <p className="text-center text-sm text-slate-600 mt-2">
            Join our platform and start managing
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <Label>Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="pl-10"
                  error={errors.name}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label>Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="pl-10"
                  error={errors.email}
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <Label>Role *</Label>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="manager">Manager</option>
                <option value="company_admin">Company Admin</option>
              </Select>
            </div>

            {/* Company Selection */}
            {formData.role === 'manager' && (
              <div>
                <Label>Company *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Select
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="pl-10"
                    error={errors.company}
                  >
                    <option value="">Select a company</option>
                    {companies?.map(company => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <Label>Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label>Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms & Conditions */}
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 mt-1"
                required
              />
              <span className="text-sm text-slate-600">
                I agree to the{' '}
                <a href="#" className="text-slate-900 font-medium hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-slate-900 font-medium hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Register Button */}
            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
              className="w-full"
              size="lg"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center text-sm text-slate-600 pt-4 border-t">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-slate-900 font-semibold hover:underline"
            >
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}