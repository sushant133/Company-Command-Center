import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Label from '../ui/Label'
import { Card, CardContent } from '../ui/Card'
import { Send } from 'lucide-react'

export default function CommentForm({ onSubmit, loading = false, projects = [] }) {
  const [formData, setFormData] = useState({
    target: '',
    targetType: 'Project',
    message: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.target && formData.message.trim()) {
      onSubmit(formData)
      setFormData({
        target: '',
        targetType: 'Project',
        message: '',
      })
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Target Type</Label>
              <select
                name="targetType"
                value={formData.targetType}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              >
                <option value="Project">Project</option>
                <option value="Task">Task</option>
                <option value="Entry">Entry</option>
              </select>
            </div>
            <div>
              <Label>Select Item</Label>
              <Input
                name="target"
                value={formData.target}
                onChange={handleChange}
                placeholder="Item ID or name"
                required
              />
            </div>
          </div>

          <div>
            <Label>Message *</Label>
            <Textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your instruction, follow-up, or comment"
              required
            />
          </div>

          <Button
            type="submit"
            isLoading={loading}
            disabled={!formData.target || !formData.message.trim()}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Comment
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}