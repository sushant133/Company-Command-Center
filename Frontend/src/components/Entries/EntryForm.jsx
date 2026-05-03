import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Label from '../ui/Label'
import FormError from '../ui/FormError'
import { ENTRY_TYPES } from '../../utils/constants'
import { Upload, X } from 'lucide-react'
import { entrySchema } from '../../validations/zodSchemas'

export default function EntryForm({
  open,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
  company = null,
  projects = [],
}) {
  const [files, setFiles] = useState([])

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files))
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(entrySchema)
  })

  const type = watch('type')

  useEffect(() => {
    if (open) {
      if (initialData) {
        Object.keys(initialData).forEach(key => {
          setValue(key, initialData[key])
        })
      } else {
        reset()
      }
    }
  }, [initialData, open, reset, setValue])

  const getMetadataFields = () => {
    switch (type) {
      case 'Task':
        return ['owner', 'priority', 'status']
      case 'Expense':
      case 'Finance':
        return ['amount', 'category']
      case 'HR':
        return ['status', 'priority']
      default:
        return []
    }
  }

  const metadataFields = getMetadataFields()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Entry' : 'Create New Entry'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Entry Type *</Label>
              <Select name="type" value={formData.type} onChange={handleChange}>
                {ENTRY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>
            {projects.length > 0 && (
              <div>
                <Label>Project (Optional)</Label>
                <Select name="project" value={formData.project} onChange={handleChange}>
                  <option value="">Select project</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          <div>
            <Label>Title *</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Entry title"
              error={errors.title}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Entry description"
            />
          </div>

          {metadataFields.map(field => (
            <div key={field}>
              <Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
              {field === 'amount' ? (
                <Input
                  type="number"
                  name={field}
                  value={formData.metadata[field]}
                  onChange={handleChange}
                  placeholder="0"
                />
              ) : field === 'priority' ? (
                <Select name={field} value={formData.metadata[field]} onChange={handleChange}>
                  <option value="">Select priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              ) : field === 'status' ? (
                <Select name={field} value={formData.metadata[field]} onChange={handleChange}>
                  <option value="">Select status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </Select>
              ) : (
                <Input
                  name={field}
                  value={formData.metadata[field]}
                  onChange={handleChange}
                  placeholder={`Enter ${field}`}
                />
              )}
            </div>
          ))}

          {/* File Upload */}
          <div>
            <Label>Attachments</Label>
            <div className="relative rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-slate-400 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Drag files here or click to browse</p>
              <p className="text-xs text-slate-500">Up to 10 files, 50MB each</p>
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={loading}>
            {initialData ? 'Update Entry' : 'Create Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}