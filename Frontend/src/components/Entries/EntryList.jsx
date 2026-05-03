import { useState } from 'react'
import EntryCard from './EntryCard'
import EntryForm from './EntryForm'
import LoadingSpinner from '../Common/LoadingSpinner'
import EmptyState from '../Common/EmptyState'
import { FileText } from 'lucide-react'

export default function EntryList({
  entries = [],
  projects = [],
  loading = false,
  onCreate,
  onApprove,
  onDelete,
  onUpdate,
}) {
  const [editingEntry, setEditingEntry] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  const handleCreateClick = () => {
    setEditingEntry(null)
    setFormOpen(true)
  }

  const handleEditClick = (entry) => {
    setEditingEntry(entry)
    setFormOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingEntry(null)
  }

  const handleFormSubmit = ({ data, files }) => {
    if (editingEntry) {
      onUpdate({ id: editingEntry._id, data })
    } else {
      onCreate({ data, files })
    }
    handleFormClose()
  }

  if (loading) {
    return <LoadingSpinner text="Loading entries..." />
  }

  if (!entries || entries.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No entries yet"
        description="Create your first entry to get started"
        action={{ label: 'Create Entry', onClick: handleCreateClick }}
      />
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map(entry => (
          <EntryCard
            key={entry._id}
            entry={entry}
            onApprove={() => onApprove(entry._id)}
            onDelete={() => onDelete(entry._id)}
            onView={() => handleEditClick(entry)}
          />
        ))}
      </div>

      <EntryForm
        open={formOpen}
        onClose={handleFormClose}
        initialData={editingEntry}
        onSubmit={handleFormSubmit}
        projects={projects}
      />
    </>
  )
}