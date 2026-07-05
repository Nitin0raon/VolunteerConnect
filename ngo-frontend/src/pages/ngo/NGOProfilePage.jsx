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
      <div className="max-w-2xl text-black">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs uppercase tracking-widest font-black text-gray-500 mb-3">Setup</p>
          <h1 className="text-4xl font-brand font-black uppercase tracking-tighter text-black font-brand">NGO Profile</h1>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 font-sans mt-2">Complete your profile to get approved and start creating programs.</p>
        </motion.div>

        {profile && (
          <div className={`mb-6 px-5 py-3.5 border text-xs font-black uppercase tracking-widest bg-white ${
            profile.status === 'approved' ? 'border-black text-black' :
            profile.status === 'pending' ? 'border-yellow-500 text-yellow-600' :
            'border-red-600 text-red-600'
          }`}>
            Status: <span className="font-brand uppercase">{profile.status}</span>
            {profile.status === 'rejected' && profile.rejection_reason && (
              <span className="block mt-1 opacity-85">Reason: {profile.rejection_reason}</span>
            )}
          </div>
        )}

        {success && (
          <div className="mb-6 px-5 py-3.5 border border-black bg-white text-black text-xs font-black uppercase tracking-widest">
            ✓ Profile saved successfully!
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-white border border-black rounded-none p-8 shadow-none">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Organization Name" placeholder="Hope Foundation" value={form.organization_name} onChange={set('organization_name')} error={errors.organization_name} />
            <Textarea label="Description" placeholder="What does your organization do? Who do you help?" value={form.description} onChange={set('description')} error={errors.description} rows={4} />
            <div className="grid sm:grid-cols-2 gap-5 font-sans">
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
