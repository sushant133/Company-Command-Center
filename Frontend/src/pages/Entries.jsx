import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEntries } from '../hooks/useEntries'
import { useProjects } from '../hooks/useProjects'
import Header from '../components/Common/Header'
import Sidebar from '../components/Common/Sidebar'
import EntryList from '../components/Entries/EntryList'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { Plus, Search } from 'lucide-react'

export default function Entries() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { projects } = useProjects()
  const [entryType, setEntryType] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  const params = {}
  if (entryType !== 'all') params.type = entryType
  if (user?.company) params.company = user.company._id

  const { entries, isLoading, createEntry, updateEntry, deleteEntry, approveEntry } =
    useEntries(params)

  const filteredEntries = useMemo(() => {
    if (!entries) return []
    return entries.filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase())
    )
  }, [entries, search])

  if (!user) return null

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
                  <h1 className="text-3xl font-bold">Entries</h1>
                  <p className="text-slate-600 mt-1">Manage projects, tasks, and other entries</p>
                </div>
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search entries..."
                    className="pl-10"
                  />
                </div>
                <Select value={entryType} onChange={(e) => setEntryType(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="Project">Project</option>
                  <option value="Task">Task</option>
                  <option value="HR">HR</option>
                  <option value="Expense">Expense</option>
                  <option value="Finance">Finance</option>
                </Select>
              </div>

              {/* Entries List */}
              {isLoading ? (
                <LoadingSpinner text="Loading entries..." />
              ) : (
                <EntryList
                  entries={filteredEntries}
                  projects={projects}
                  loading={isLoading}
                  onCreate={(data) => createEntry(data)}
                  onApprove={(id) => approveEntry(id)}
                  onDelete={(id) => {
                    if (window.confirm('Are you sure?')) {
                      deleteEntry(id)
                    }
                  }}
                  onUpdate={(data) => updateEntry(data)}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
