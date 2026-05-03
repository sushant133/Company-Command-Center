import { useState } from 'react'
import ProjectCard from './ProjectCard'
import ProjectForm from './ProjectForm'
import LoadingSpinner from '../Common/LoadingSpinner'
import EmptyState from '../Common/EmptyState'
import { Briefcase } from 'lucide-react'

export default function ProjectList({
  projects = [],
  loading = false,
  onEdit,
  onDelete,
  onView,
  onCreateNew,
  onUpdate,
}) {
  const [editingProject, setEditingProject] = useState(null)
  const [formOpen, setFormOpen] = useState(false)

  const handleEditClick = (project) => {
    setEditingProject(project)
    setFormOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingProject(null)
  }

  const handleFormSubmit = (data) => {
    if (editingProject) {
      onUpdate({ id: editingProject._id, data })
    } else {
      onCreateNew(data)
    }
    handleFormClose()
  }

  if (loading) {
    return <LoadingSpinner text="Loading projects..." />
  }

  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No projects yet"
        description="Create your first project to get started"
        action={{ label: 'Create Project', onClick: () => setFormOpen(true) }}
      />
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <ProjectCard
            key={project._id}
            project={project}
            onEdit={() => handleEditClick(project)}
            onDelete={() => onDelete(project._id)}
            onView={() => onView(project._id)}
          />
        ))}
      </div>

      <ProjectForm
        open={formOpen}
        onClose={handleFormClose}
        initialData={editingProject}
        onSubmit={handleFormSubmit}
      />
    </>
  )
}