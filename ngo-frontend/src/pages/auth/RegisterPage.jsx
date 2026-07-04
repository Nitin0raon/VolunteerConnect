import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

/* Same tokens as HomePage / Navbar / LoginPage */
const pageBg = '#EEECE4'
const ink = '#141310'
const inkSoft = '#6B685F'
const amber = '#E8A33D'

const fieldClass =
  'w-full rounded-2xl px-4 py-3.5 text-sm bg-white/70 focus:outline-none focus:ring-2 transition-shadow'

function Field({ label, error, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: inkSoft }}>
        {label}
      </label>
      <input
        {...props}
        className={fieldClass}
        style={{
          boxShadow: error ? '0 0 0 2px #F5A3A3' : 'none',
          '--tw-ring-color': amber,
        }}
      />
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  )
}

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
    setForm((p) => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  return (
    <div
      className="font-brand min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden"
      style={{ background: pageBg, color: ink }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {/* muted sand tone rather than the bright amber accent, so the glow
          stays a quiet backdrop instead of drawing the eye */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: '#D9CDAE' }}
      />

      <div className="w-full max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: ink }}
            >
              V
            </span>
            <span className="font-bold text-lg tracking-tight">volunect</span>
          </Link>
          <h1 className="font-extrabold text-3xl tracking-tight mb-2">Create your account</h1>
          <p className="text-sm" style={{ color: inkSoft }}>Join thousands making a difference</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-[2rem] p-8 backdrop-blur-md bg-white/60 shadow-xl"
        >
          {/* Role toggle */}
          <div className="flex gap-2 p-1 rounded-2xl mb-7" style={{ background: pageBg }}>
            {[{ value: 'volunteer', label: '🙋 Volunteer' }, { value: 'ngo', label: '🏢 NGO' }].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: value }))}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={
                  form.role === value
                    ? { background: ink, color: '#fff' }
                    : { color: inkSoft }
                }
              >
                {label}
              </button>
            ))}
          </div>

          {serverError && (
            <div className="mb-6 px-4 py-3 rounded-2xl text-sm bg-red-50 border border-red-200 text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" placeholder="Jane" value={form.first_name} onChange={set('first_name')} error={errors.first_name} />
              <Field label="Last Name" placeholder="Doe" value={form.last_name} onChange={set('last_name')} error={errors.last_name} />
            </div>
            <Field label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />
            <Field label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} error={errors.password} />
            <Field label="Confirm Password" type="password" placeholder="Repeat password" value={form.password_confirm} onChange={set('password_confirm')} error={errors.password_confirm} />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 font-semibold py-3.5 rounded-full text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              style={{ background: ink }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: inkSoft }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: amber }}>
              Sign in
            </Link>
          </p>
        </motion.div>

        <p className="text-center text-xs mt-6" style={{ color: inkSoft }}>
          <Link to="/" className="hover:opacity-70 transition-opacity">← Back to home</Link>
        </p>
      </div>
    </div>
  )
}

/* NOTE
   - Same swap as LoginPage: plain <Field> wrapper instead of the shared
     <Input>/<Button> components, so the light theme renders correctly
     regardless of those components' internal (likely dark-theme) styling.
   - Role toggle restyled as an ink-filled pill for the active choice on a
     linen track, matching the button language used elsewhere.
   - Only change this round: added the same Plus Jakarta Sans font-import +
     `font-brand` class that HomePage uses, so the typeface matches across
     the site. Colors and layout are untouched — this page was already on
     the light `pageBg`, so ink/inkSoft/amber had no contrast issue to fix.
*/
