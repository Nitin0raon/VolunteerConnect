import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const pageBg = '#FFFFFF'
const ink = '#000000'
const inkSoft = '#666666'
const amber = '#000000'

const fieldClass =
  'w-full bg-white border border-black rounded-none px-4 py-3.5 text-sm focus:outline-none focus:bg-gray-50 text-black placeholder-gray-400 font-sans'

function Field({ label, error, ...props }) {
  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-widest mb-2 font-brand text-black">
        {label}
      </label>
      <input
        {...props}
        className={fieldClass}
        style={{
          borderColor: error ? '#DC2626' : '#000000',
        }}
      />
      {error && <p className="text-xs text-red-600 mt-1.5 font-bold uppercase tracking-wider">{error}</p>}
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
      <div className="w-full max-w-lg relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <span className="font-black text-xl tracking-widest text-black font-brand uppercase">
              volunect
            </span>
          </Link>
          <h1 className="font-brand font-black text-3xl uppercase tracking-tighter mb-2 text-black">Create your account</h1>
          <p className="text-xs uppercase tracking-wider font-bold text-gray-500">Join thousands making a difference</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="p-8 border border-black bg-white rounded-none shadow-none"
        >
          {/* Role toggle */}
          <div className="flex border border-black rounded-none p-1 mb-7 bg-white">
            {[{ value: 'volunteer', label: '🙋 Volunteer' }, { value: 'ngo', label: '🏢 NGO' }].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: value }))}
                className="flex-1 py-2.5 rounded-none text-xs font-black uppercase tracking-widest transition-all"
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
            <div className="mb-6 px-4 py-3 border border-red-600 text-xs uppercase tracking-wider font-bold bg-red-50 text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
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
              className="w-full mt-2 font-black uppercase tracking-widest text-xs py-4 border border-black rounded-none bg-black text-white hover:bg-white hover:text-black transition-colors duration-300 disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs uppercase tracking-wider font-bold mt-6 text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-black underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </motion.div>

        <p className="text-center text-xs uppercase tracking-widest font-black mt-6">
          <Link to="/" className="text-black hover:opacity-70 transition-opacity">← Back to home</Link>
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
