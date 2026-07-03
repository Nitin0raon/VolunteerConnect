import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Input, Textarea, Select } from '../../components/ui/index'
import { Button } from '../../components/ui/Button'
import { programService } from '../../services/programService'

export default function CreateProgramPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', capacity: '', location: '',
    start_date: '', end_date: '', status: 'active',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.capacity) e.capacity = 'Capacity is required'
    else if (parseInt(form.capacity) < 1) e.capacity = 'Must be at least 1'
    if (form.start_date && form.end_date && form.end_date < form.start_date)
      e.end_date = 'End date must be after start date'
    return e
  }

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const payload = { ...form, capacity: parseInt(form.capacity) }
      if (!payload.start_date) delete payload.start_date
      if (!payload.end_date) delete payload.end_date
      if (!payload.location) delete payload.location
      await programService.create(payload)
      setSuccess(true)
      setTimeout(() => navigate('/ngo/programs'), 2000)
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setErrors(data.errors)
      else setErrors({ title: data?.message || 'Failed to create program.' })
    } finally { setLoading(false) }
  }

  return (
    <DashboardLayout title="Create Program">
      <div className="max-w-2xl">
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-8 px-5 py-4 bg-primary/10 border border-primary/30 rounded-2xl text-primary text-sm flex items-center gap-3"
            >
              <span className="text-lg">✓</span>
              Program created successfully! Redirecting…
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest2 text-primary mb-3">New Program</p>
            <h1 className="text-4xl font-light text-white mb-2">Create a program</h1>
            <p className="text-text-secondary">Post a new volunteer opportunity for your NGO.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-card border border-subtle rounded-3xl p-8 space-y-5">
              <h2 className="text-sm font-medium text-white mb-2">Basic Information</h2>
              <Input label="Program Title" placeholder="e.g. Beach Cleanup Drive" value={form.title} onChange={set('title')} error={errors.title} />
              <Textarea label="Description" placeholder="Describe the program, what volunteers will do, what to expect…" value={form.description} onChange={set('description')} error={errors.description} rows={5} />
            </div>

            {/* Details */}
            <div className="bg-card border border-subtle rounded-3xl p-8 space-y-5">
              <h2 className="text-sm font-medium text-white mb-2">Program Details</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <Input label="Capacity" type="number" min="1" placeholder="Maximum participants" value={form.capacity} onChange={set('capacity')} error={errors.capacity} />
                <Input label="Location" placeholder="City, Venue (optional)" value={form.location} onChange={set('location')} />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <Input label="Start Date" type="date" value={form.start_date} onChange={set('start_date')} />
                <Input label="End Date" type="date" value={form.end_date} onChange={set('end_date')} error={errors.end_date} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" loading={loading} size="lg" className="flex-1">
                {loading ? 'Creating…' : 'Create Program'}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => navigate('/ngo/programs')}>
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
