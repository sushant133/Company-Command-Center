import { useState } from 'react'
import { X, User, Mail, Lock, Check } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import { Card, CardContent, CardHeader, CardTitle } from './Card'

export default function CompanyCredentialWizard({
  company,
  onComplete,
  onCancel,
  isOpen,
}) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateStep1 = () => {
    const newErrors = {}
    if (!formData.adminName.trim()) {
      newErrors.adminName = 'Admin name is required'
    }
    if (!formData.adminEmail.includes('@')) {
      newErrors.adminEmail = 'Valid email is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (formData.adminPassword.length < 6) {
      newErrors.adminPassword = 'Password must be at least 6 characters'
    }
    if (formData.adminPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleComplete = async () => {
    if (!validateStep2()) return

    setIsLoading(true)
    try {
      await onComplete({
        companyId: company._id,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
      })
    } catch (error) {
      setErrors({ general: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md border-white/20 bg-white/95 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Set up {company?.name} credentials
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-slate-200'}`} />
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-200'}`} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {errors.general && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Company Admin Details
                </label>
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Full name"
                    value={formData.adminName}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                    className={`rounded-lg border-slate-200 ${errors.adminName ? 'border-red-300' : ''}`}
                    icon={<User className="h-4 w-4" />}
                  />
                  {errors.adminName && (
                    <p className="text-xs text-red-600">{errors.adminName}</p>
                  )}

                  <Input
                    type="email"
                    placeholder="Email address"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                    className={`rounded-lg border-slate-200 ${errors.adminEmail ? 'border-red-300' : ''}`}
                    icon={<Mail className="h-4 w-4" />}
                  />
                  {errors.adminEmail && (
                    <p className="text-xs text-red-600">{errors.adminEmail}</p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700"
              >
                Next: Set Password
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Admin Login Credentials
                </label>
                <div className="space-y-3">
                  <Input
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
                    className={`rounded-lg border-slate-200 ${errors.adminPassword ? 'border-red-300' : ''}`}
                    icon={<Lock className="h-4 w-4" />}
                  />
                  {errors.adminPassword && (
                    <p className="text-xs text-red-600">{errors.adminPassword}</p>
                  )}

                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`rounded-lg border-slate-200 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                    icon={<Check className="h-4 w-4" />}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-lg"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Creating...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}