import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Input, Textarea } from '../../components/ui/index'
import { Button } from '../../components/ui/Button'
import { ngoService } from '../../services/dashboardService'

export default function NGOProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ organization_name: '', description: '', website: '', phone: '', address: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    ngoService.myProfile()
      .then(({ data }) => {
        setProfile(data.data)
        const p = data.data
        setForm({ organization_name: p.organization_name, description: p.description, website: p.website || '', phone: p.phone || '', address: p.address || '' })
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.organization_name.trim()) errs.organization_name = 'Required'
    if (!form.description.trim()) errs.description = 'Required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      if (profile) await ngoService.createProfile(form) // patch not implemented separately
      else await ngoService.createProfile(form)
      setSuccess(true)
      setTimeout(() => navigate('/ngo/dashboard'), 1500)
    } catch (err) {
      const data = err.response?.data
      if (data?.errors) setErrors(data.errors)
    } finally { setLoading(false) }
  }

  return (
    <DashboardLayout title="NGO Profile">
      <div className="max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs uppercase tracking-widest2 text-primary mb-3">Setup</p>
          <h1 className="text-4xl font-light text-white">NGO Profile</h1>
          <p className="text-text-secondary mt-2 text-sm">Complete your profile to get approved and start creating programs.</p>
        </motion.div>

        {profile && (
          <div className={`mb-6 px-5 py-3.5 rounded-2xl border text-sm ${
            profile.status === 'approved' ? 'bg-primary/10 border-primary/30 text-primary' :
            profile.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
            'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            Status: <span className="font-medium capitalize">{profile.status}</span>
            {profile.status === 'rejected' && profile.rejection_reason && (
              <span className="block mt-1 opacity-80">Reason: {profile.rejection_reason}</span>
            )}
          </div>
        )}

        {success && (
          <div className="mb-6 px-5 py-3.5 rounded-2xl border bg-primary/10 border-primary/30 text-primary text-sm">
            ✓ Profile saved successfully!
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-subtle rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Organization Name" placeholder="Hope Foundation" value={form.organization_name} onChange={set('organization_name')} error={errors.organization_name} />
            <Textarea label="Description" placeholder="What does your organization do? Who do you help?" value={form.description} onChange={set('description')} error={errors.description} rows={4} />
            <div className="grid sm:grid-cols-2 gap-5">
              <Input label="Website (optional)" placeholder="https://yourorg.org" value={form.website} onChange={set('website')} />
              <Input label="Phone (optional)" placeholder="+91 99999 99999" value={form.phone} onChange={set('phone')} />
            </div>
            <Textarea label="Address (optional)" placeholder="Your organization's address" value={form.address} onChange={set('address')} rows={2} />
            <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
              {profile ? 'Update Profile' : 'Submit for Approval'}
            </Button>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
