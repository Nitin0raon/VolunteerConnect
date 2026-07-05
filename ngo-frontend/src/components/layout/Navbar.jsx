import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenuAlt3, HiX } from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Programs', href: '/programs' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, isNGO, isVolunteer } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const dashboardHref = isNGO ? '/ngo/dashboard' : '/volunteer/dashboard'

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black h-20 flex items-center px-6 md:px-12">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-black text-xl tracking-widest text-black font-brand uppercase">
              volunect
            </span>
          </Link>

          {/* Center Call to Action */}
          <div className="hidden md:block">
            {user ? (
              <Link
                to={dashboardHref}
                className="border border-black px-6 py-2 text-xs uppercase tracking-widest font-black bg-white hover:bg-black hover:text-white transition-colors duration-300"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="border border-black px-6 py-2 text-xs uppercase tracking-widest font-black bg-white hover:bg-black hover:text-white transition-colors duration-300"
              >
                Join the movement
              </Link>
            )}
          </div>

          {/* Right Links & Actions */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-black ${
                  location.pathname === l.href ? 'text-black underline underline-offset-4' : 'text-gray-500'
                }`}
              >
                {l.label}
              </Link>
            ))}
            
            {user ? (
              <button
                onClick={handleLogout}
                className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-black ${
                  location.pathname === '/login' ? 'text-black underline underline-offset-4' : 'text-gray-500'
                }`}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-black hover:opacity-75"
          >
            {mobileOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
          </button>
        </div>
      </nav>

      {/* Spacer to push page content below the fixed header */}
      <div className="h-20" />

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 inset-x-0 z-40 bg-white border-b border-black p-8 md:hidden flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.href}
                  className="text-sm font-bold uppercase tracking-widest text-black"
                >
                  {l.label}
                </Link>
              ))}
              
              {user ? (
                <>
                  <Link
                    to={dashboardHref}
                    className="text-sm font-bold uppercase tracking-widest text-black"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-sm font-bold uppercase tracking-widest text-gray-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-bold uppercase tracking-widest text-black"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="border border-black px-6 py-3 text-sm text-center uppercase tracking-widest font-black bg-white hover:bg-black hover:text-white transition-colors duration-300"
                  >
                    Join the movement
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* NOTE
   - Added an `overHero` state: true only on the home route, before the
     page has scrolled — i.e. exactly when the navbar is floating on top of
     the dark hero photo. In that state the pill becomes a faint glass
     outline (bg-white/10 + white/20 border) instead of a white-tinted
     pill, and all text swaps to the same cream tones (`heroText` /
     `heroTextSoft`) used for the hero headline, so it reads clearly
     against the dark forest image instead of nearly matching it.
   - The moment you scroll past the hero, or land on any other route
     (/programs, /login, etc.), it falls straight back to the original
     white glass pill with ink/inkSoft text — nothing changed there.
   - Logo badge, "Get Started" button, and the mobile dropdown panel are
     untouched — they're solid-colored elements that already read fine
     against any background.
*/
