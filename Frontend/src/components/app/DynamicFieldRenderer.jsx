import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'

export default function DynamicFieldRenderer({
  fields = [],
  values = {},
  uploads = {},
  onChange,
  onUpload,
  uploadingKey = null,
  disabled = false,
}) {
  if (!fields.length) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((field) => {
        const value = values[field.key]
        const uploadedLabel = uploads[field.key]?.originalName || uploads[field.key]?.storageUrl

        if (field.type === 'textarea') {
          return (
            <div key={field._id || field.key} className="md:col-span-2">
              <Textarea
                label={field.label}
                value={value || ''}
                onChange={(event) => onChange(field.key, event.target.value)}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                required={field.required}
                disabled={disabled}
                className="min-h-[140px] rounded-2xl border-slate-200 bg-white/90"
              />
            </div>
          )
        }

        if (field.type === 'select') {
          return (
            <Select
              key={field._id || field.key}
              label={field.label}
              value={value || ''}
              onChange={(event) => onChange(field.key, event.target.value)}
              required={field.required}
              disabled={disabled}
              className="rounded-2xl border-slate-200 bg-white/90"
            >
              <option value="">Select {field.label}</option>
              {(field.options || []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          )
        }

        if (field.type === 'checkbox') {
          return (
            <label
              key={field._id || field.key}
              className="flex items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700"
            >
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(event) => onChange(field.key, event.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-slate-300 text-slate-900"
              />
              {field.label}
            </label>
          )
        }

        if (field.type === 'file') {
          return (
            <div key={field._id || field.key} className="rounded-[1.25rem] border border-slate-200 bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-900">{field.label}</p>
              <p className="mt-1 text-xs text-slate-500">
                Upload a supporting document for this field.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="file"
                  disabled={disabled || uploadingKey === field.key}
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0]
                    if (selectedFile) {
                      onUpload(field, selectedFile)
                    }
                  }}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-2xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                />
                {uploadingKey === field.key ? (
                  <Button isLoading variant="outline" className="rounded-2xl">
                    Uploading
                  </Button>
                ) : null}
              </div>
              {uploadedLabel ? (
                <p className="mt-3 text-xs text-emerald-600">Attached: {uploadedLabel}</p>
              ) : null}
            </div>
          )
        }

        return (
          <Input
            key={field._id || field.key}
            label={field.label}
            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
            value={value || ''}
            onChange={(event) => onChange(field.key, event.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            disabled={disabled}
            className="rounded-2xl border-slate-200 bg-white/90"
          />
        )
      })}
    </div>
  )
}
