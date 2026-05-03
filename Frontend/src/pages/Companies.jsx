import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCompanies } from '../hooks/useCompanies'
import Header from '../components/Common/Header'
import Sidebar from '../components/Common/Sidebar'
import CompanyCard from '../components/Companies/CompanyCard'
import CompanyForm from '../components/Companies/CompanyForm'
import AdminDirectory from '../components/Companies/AdminDirectory'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import EmptyState from '../components/Common/EmptyState'
import { Plus, Search, Building2 } from 'lucide-react'

export default function Companies() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { companies, isLoading, createCompany, updateCompany, deleteCompany } =
    useCompanies()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'super_admin') {
      navigate('/dashboard')
    }
  }, [isAuthenticated, user, navigate])

  const filteredCompanies = useMemo(() => {
    if (!companies) return []
    return companies.filter(c =>
      [c.name, c.code].join(' ').toLowerCase().includes(search.toLowerCase())
    )
  }, [companies, search])

  if (!user) return null

  const handleFormSubmit = (data) => {
    if (editingCompany) {
      updateCompany({ id: editingCompany._id, data })
    } else {
      createCompany(data)
    }
    setFormOpen(false)
    setEditingCompany(null)
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Companies</h1>
                  <p className="text-slate-600 mt-1">Manage all companies and their settings</p>
                </div>
                <Button onClick={() => setFormOpen(true)} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  New Company
                </Button>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="companies">
                <TabsList className="bg-white border-b rounded-none">
                  <TabsTrigger value="companies">Companies</TabsTrigger>
                  <TabsTrigger value="admins">Admin Directory</TabsTrigger>
                </TabsList>

                {/* Companies Tab */}
                <TabsContent value="companies" className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search companies..."
                      className="pl-10"
                    />
                  </div>

                  {isLoading ? (
                    <LoadingSpinner text="Loading companies..." />
                  ) : filteredCompanies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCompanies.map(company => (
                        <CompanyCard
                          key={company._id}
                          company={company}
                          onEdit={() => {
                            setEditingCompany(company)
                            setFormOpen(true)
                          }}
                          onDelete={() => {
                            if (window.confirm('Are you sure?')) {
                              deleteCompany(company._id)
                            }
                          }}
                          onView={() => navigate(`/companies/${company._id}`)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Building2}
                      title="No companies found"
                      description="Create your first company to get started"
                      action={{
                        label: 'Create Company',
                        onClick: () => setFormOpen(true),
                      }}
                    />
                  )}
                </TabsContent>

                {/* Admin Directory Tab */}
                <TabsContent value="admins">
                  <AdminDirectory
                    companies={companies}
                    onAddAdmin={(data) => console.log('Add admin:', data)}
                    onRemoveAdmin={(id) => console.log('Remove admin:', id)}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      {/* Forms */}
      <CompanyForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingCompany(null)
        }}
        initialData={editingCompany}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
