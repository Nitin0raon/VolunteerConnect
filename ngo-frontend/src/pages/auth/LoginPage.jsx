import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

/* Same tokens as HomePage / Navbar — lift these into a shared theme file
   once the redesign is finalized. */
const pageBg = '#FFFFFF'
const ink = '#000000'
const inkSoft = '#666666'
const amber = '#000000'

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
    'w-full bg-white border border-black rounded-none px-4 py-3.5 text-sm focus:outline-none focus:bg-gray-50 text-black placeholder-gray-400 font-sans'

  return (
    <div
      className="font-brand min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: pageBg, color: ink }}
    >
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
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
          <h1 className="font-brand font-black text-3xl uppercase tracking-tighter mb-2 text-black">Welcome back</h1>
          <p className="text-xs uppercase tracking-wider font-bold text-gray-500">Sign in to your account to continue</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="p-8 border border-black bg-white rounded-none shadow-none"
        >
          {serverError && (
            <div className="mb-6 px-4 py-3 border border-red-600 text-xs uppercase tracking-wider font-bold bg-red-50 text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 font-sans">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2 font-brand text-black">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange('email')}
                className={fieldClass}
                style={{
                  borderColor: errors.email ? '#DC2626' : '#000000',
                }}
              />
              {errors.email && <p className="text-xs text-red-600 mt-1.5 font-bold uppercase tracking-wider">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2 font-brand text-black">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange('password')}
                className={fieldClass}
                style={{
                  borderColor: errors.password ? '#DC2626' : '#000000',
                }}
              />
              {errors.password && <p className="text-xs text-red-600 mt-1.5 font-bold uppercase tracking-wider">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 font-black uppercase tracking-widest text-xs py-4 border border-black rounded-none bg-black text-white hover:bg-white hover:text-black transition-colors duration-300 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs uppercase tracking-wider font-bold mt-6 text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-black underline underline-offset-2">
              Create one
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
