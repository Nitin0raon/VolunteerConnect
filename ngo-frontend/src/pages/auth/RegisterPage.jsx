import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { Input, Select } from '../../components/ui/index'
import { Button } from '../../components/ui/Button'

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', role: 'volunteer',
    password: '', password_confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'First name is required'
    if (!form.last_name.trim()) e.last_name = 'Last name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'At least 8 characters'
    if (form.password !== form.password_confirm) e.password_confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setServerError('')
    try {
      await register(form)
      await login(form.email, form.password)
      navigate(form.role === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data?.errors && typeof data.errors === 'object') {
        setErrors(data.errors)
      } else {
        setServerError(data?.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/4 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-bg font-bold">V</span>
            </div>
            <span className="font-semibold text-white text-lg">Volunect</span>
          </Link>
          <h1 className="text-3xl font-light text-white mb-2">Create your account</h1>
          <p className="text-text-secondary text-sm">Join thousands making a difference</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-card border border-subtle rounded-3xl p-8"
        >
          {/* Role toggle */}
          <div className="flex gap-2 p-1 bg-bg rounded-xl mb-7">
            {[{ value: 'volunteer', label: '🙋 Volunteer' }, { value: 'ngo', label: '🏢 NGO' }].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm(p => ({ ...p, role: value }))}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  form.role === value
                    ? 'bg-primary text-bg'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {serverError && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" placeholder="Jane" value={form.first_name} onChange={set('first_name')} error={errors.first_name} />
              <Input label="Last Name" placeholder="Doe" value={form.last_name} onChange={set('last_name')} error={errors.last_name} />
            </div>
            <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />
            <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} error={errors.password} />
            <Input label="Confirm Password" type="password" placeholder="Repeat password" value={form.password_confirm} onChange={set('password_confirm')} error={errors.password_confirm} />

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-hover transition-colors">Sign in</Link>
          </p>
        </motion.div>

        <p className="text-center text-xs text-text-secondary mt-6">
          <Link to="/" className="hover:text-white transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  )
}
