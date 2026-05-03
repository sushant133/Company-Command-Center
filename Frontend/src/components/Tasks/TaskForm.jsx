import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Label from '../ui/Label'
import FormError from '../ui/FormError'
import { taskCreateSchema } from '../../validations/zodSchemas'
import { useQueryClient } from '@tanstack/react-query'
import { showSuccess, showError } from '../../store/notificationStore'

export default function TaskForm({ open, onClose, companies = [], initialData = null, loading = false }) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(taskCreateSchema)
  })

  const onSubmit = (data) => {
    // Optimistic update simulation
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    showSuccess('Task created successfully!')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register('title')} />
            <FormError message={errors.title?.message} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select {...register('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
          <div>
            <Label>Companies</Label>
            <Select {...register('companyIds')} multiple>
              {companies.map(company => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty || !isValid} isLoading={loading}>
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
