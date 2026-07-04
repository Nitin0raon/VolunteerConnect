import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

/* Same tokens as HomePage / Navbar — lift these into a shared theme file
   once the redesign is finalized. */
const pageBg = '#EEECE4'
const ink = '#141310'
const inkSoft = '#6B685F'
const amber = '#E8A33D'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e_ = validate()
    if (Object.keys(e_).length) { setErrors(e_); return }
    setLoading(true)
    setServerError('')
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'ngo' ? '/ngo/dashboard' : '/volunteer/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  const fieldClass =
    'w-full rounded-2xl px-4 py-3.5 text-sm bg-white/70 focus:outline-none focus:ring-2 transition-shadow'

  return (
    <div
      className="font-brand min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: pageBg, color: ink }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {/* warm glow, same language as the homepage hero — muted sand tone
          rather than the bright amber accent, so it stays a quiet backdrop */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: '#D9CDAE' }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
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
          <h1 className="font-extrabold text-3xl tracking-tight mb-2">Welcome back</h1>
          <p className="text-sm" style={{ color: inkSoft }}>Sign in to your account to continue</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-[2rem] p-8 backdrop-blur-md bg-white/60 shadow-xl"
        >
          {serverError && (
            <div className="mb-6 px-4 py-3 rounded-2xl text-sm bg-red-50 border border-red-200 text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: inkSoft }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange('email')}
                className={fieldClass}
                style={{
                  boxShadow: errors.email ? '0 0 0 2px #F5A3A3' : 'none',
                  '--tw-ring-color': amber,
                }}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: inkSoft }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange('password')}
                className={fieldClass}
                style={{
                  boxShadow: errors.password ? '0 0 0 2px #F5A3A3' : 'none',
                  '--tw-ring-color': amber,
                }}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 font-semibold py-3.5 rounded-full text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              style={{ background: ink }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: inkSoft }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: amber }}>
              Create one
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
   - Swapped the shared <Input>/<Button> components for plain elements so
     the light theme is guaranteed — those components may still carry the
     old dark-theme classes internally. Happy to retheme them directly
     instead if you'd rather keep using the shared components everywhere.
   - Removed the unused `isNGO` destructure from useAuth (wasn't referenced
     in the original component).
   - Only change this round: added the same Plus Jakarta Sans font-import +
     `font-brand` class that HomePage uses, so the typeface matches across
     the site. Colors and layout are untouched — this page was already on
     the light `pageBg`, so ink/inkSoft/amber had no contrast issue to fix.
*/
