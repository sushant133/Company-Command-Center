import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Label from '../ui/Label'
import FormError from './FormError'
import { companyCreateSchema } from '../../validations/zodSchemas'

export default function CompanyForm({ open, onClose, onSubmit, initialData = null, loading = false }) {
  const [isPending, startTransition] = useTransition()

  const {
    register, 
    handleSubmit, 
    formState: { errors, isDirty, isValid },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(companyCreateSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
    }
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValue('name', initialData.name || '')
        setValue('code', initialData.code || '')  
        setValue('description', initialData.description || '')
      } else {
        reset()
      }
    }
  }, [initialData, open, setValue, reset])

  const onFormSubmit = (data) => {
    startTransition(() => {
      onSubmit({
        ...data,
        status: initialData?.status || 'Active', // Preserve status logic
        code: data.code.toUpperCase()
      })
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Company' : 'Create New Company'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Company name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            <FormError message={errors.name?.message} />
          </div>

          <div>
            <Label htmlFor="code">Company Code *</Label>
            <Input
              id="code"
              {...register('code', { onChange: (e) => e.target.value = e.target.value.toUpperCase() })}
              placeholder="e.g., ABC"
              maxLength="10"
              aria-invalid={!!errors.code}
              aria-describedby={errors.code ? 'code-error' : undefined}
            />
            <FormError id="code-error" message={errors.code?.message} />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Company description"
            />
            <FormError message={errors.description?.message} />
          </div>

          <div>
            <Label>Status</Label>
            <Select>
              <option>Active</option>
              <option>Inactive</option>
              <option>Suspended</option>
            </Select>
          </div>
        </form>

        <DialogFooter>
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose}
            disabled={isPending || loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit(onFormSubmit)}
            isLoading={loading || isPending}
            disabled={!isDirty || !isValid || loading}
          >
            {initialData ? 'Update Company' : 'Create Company'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
