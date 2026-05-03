import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Label from '../ui/Label'
import { Mail, Trash2, Plus, CheckCircle } from 'lucide-react'
import LoadingSpinner from '../Common/LoadingSpinner'
import EmptyState from '../Common/EmptyState'

export default function AdminDirectory({
  admins = [],
  companies = [],
  loading = false,
  onAddAdmin,
  onRemoveAdmin,
}) {
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.company || !formData.name || !formData.email) return

    setSubmitting(true)
    try {
      await onAddAdmin(formData)
      setFormData({ company: '', name: '', email: '' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Admin Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Assign Company Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Select Company</Label>
                <Select
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose company</option>
                  {companies?.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Admin Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@company.com"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={submitting} isLoading={submitting} className="w-full">
                  Add Admin
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Admin List */}
      <Card>
        <CardHeader>
          <CardTitle>Company Admin Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner text="Loading admins..." />
          ) : admins && admins.length > 0 ? (
            <div className="space-y-3">
              {admins.map(admin => {
                const company = companies?.find(c => c._id === admin.company)
                return (
                  <div
                    key={admin._id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-slate-900">{admin.name}</h3>
                        {admin.status === 'Active' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4" />
                        {admin.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{company?.name || 'Unknown'}</Badge>
                      <Badge variant="secondary">{admin.role}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveAdmin(admin._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={Mail}
              title="No admins assigned"
              description="Add company admins to manage their workspaces"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}