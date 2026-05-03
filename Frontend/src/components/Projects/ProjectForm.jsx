import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Label from '../ui/Label'
import FormError from '../ui/FormError'
import { PRIORITIES, HEALTH_STATUS, ACTION_TIMING } from '../../utils/constants'
import { projectSchema } from '../../validations/zodSchemas'

export default function ProjectForm({ open, onClose, onSubmit, initialData = null, loading = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(projectSchema)
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValue('name', initialData.name || '')
        setValue('description', initialData.description || '')
        setValue('priority', initialData.priority || 'Medium')
        setValue('status', initialData.status || 'Planning')
        setValue('health', initialData.health || 'Green')
        setValue('budget', initialData.budget?.total || '')
        setValue('progress', initialData.progress || '0')
        setValue('blockers', initialData.blockers || '0')
        setValue('followUp', initialData.followUp || '')
        setValue('nextActionBy', initialData.nextActionBy || 'This Week')
      } else {
        reset({
          name: '',
          description: '',
          priority: 'Medium',
          status: 'Planning',
          health: 'Green',
          budget: '',
          progress: '0',
          blockers: '0',
          followUp: '',
          nextActionBy: 'This Week'
        })
      }
    }
  }, [initialData, open, setValue, reset])

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      budget: parseFloat(data.budget),
      progress: parseInt(data.progress),
      blockers: parseInt(data.blockers),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Project name"
                aria-invalid={!!errors.name}
              />
              <FormError message={errors.name?.message} />
            </div>
            <div>
              <Label htmlFor="budget">Budget *</Label>
              <Input
                id="budget"
                type="number"
                {...register('budget')}
                placeholder="0"
                aria-invalid={!!errors.budget}
              />
              <FormError message={errors.budget?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Project description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select {...register('priority')}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select {...register('status')}>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="health">Health Status</Label>
              <Select {...register('health')}>
                {HEALTH_STATUS.map(h => <option key={h} value={h}>{h}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                {...register('progress', { valueAsNumber: true })}
                min="0"
                max="100"
                aria-invalid={!!errors.progress}
              />
              <FormError message={errors.progress?.message} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="blockers">Blockers</Label>
              <Input
                id="blockers"
                type="number"
                {...register('blockers', { valueAsNumber: true })}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="nextActionBy">Next Action By</Label>
              <Select {...register('nextActionBy')}>
                {ACTION_TIMING.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="followUp">Follow-up Required</Label>
            <Textarea
              id="followUp"
              {...register('followUp')}
              placeholder="What needs to be done"
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            type="submit"
            onClick={handleSubmit(onFormSubmit)} 
            isLoading={loading}
            disabled={!isDirty || !isValid || loading}
          >
            {initialData ? 'Update Project' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Project Name *</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Project name"
                error={errors.name}
              />
            </div>
            <div>
              <Label>Budget *</Label>
              <Input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="0"
                error={errors.budget}
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Project description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select name="priority" value={formData.priority} onChange={handleChange}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select name="status" value={formData.status} onChange={handleChange}>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Health Status</Label>
              <Select name="health" value={formData.health} onChange={handleChange}>
                {HEALTH_STATUS.map(h => <option key={h} value={h}>{h}</option>)}
              </Select>
            </div>
            <div>
              <Label>Progress (%)</Label>
              <Input
                type="number"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                min="0"
                max="100"
                error={errors.progress}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Blockers</Label>
              <Input
                type="number"
                name="blockers"
                value={formData.blockers}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div>
              <Label>Next Action By</Label>
              <Select name="nextActionBy" value={formData.nextActionBy} onChange={handleChange}>
                {ACTION_TIMING.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
          </div>

          <div>
            <Label>Follow-up Required</Label>
            <Textarea
              name="followUp"
              value={formData.followUp}
              onChange={handleChange}
              placeholder="What needs to be done"
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={loading}>
            {initialData ? 'Update Project' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}