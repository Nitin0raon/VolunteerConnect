import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenuAlt3, HiX } from 'react-icons/hi'
import { HiArrowUpRight } from 'react-icons/hi2'
import { useAuth } from '../../context/AuthContext'

/* Matches the tokens used on the redesigned HomePage — keep these in sync,
   or better, lift them into a shared theme file once you're happy with it. */
const ink = '#141310'
const inkSoft = '#6B685F'
const amber = '#E8A33D'

// Same hero-only cream tones as HomePage's `heroText` / `heroTextSoft`. The
// navbar sits directly on top of that dark hero photo before the page is
// scrolled, so it borrows the same colors there instead of the page's
// near-black ink, which would be unreadable on a dark background.
const heroText = '#FBF6EA'
const heroTextSoft = 'rgba(251, 246, 234, 0.86)'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Programs', href: '/programs' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, isNGO, isVolunteer } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const dashboardHref = isNGO ? '/ngo/dashboard' : '/volunteer/dashboard'

  // Only the home page opens on the dark hero photo — everywhere else the
  // page bed is the light pageBg, so the glass pill should stay in its
  // original light/ink styling there regardless of scroll position.
  const isHome = location.pathname === '/'
  const overHero = isHome && !scrolled
  const navText = overHero ? heroText : ink
  const navTextSoft = overHero ? heroTextSoft : inkSoft

  return (
    <>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 pt-4 md:pt-6"
      >
        <div
          className={`max-w-6xl mx-auto flex items-center justify-between rounded-full pl-3 pr-1.5 py-1.5 md:pl-4 md:pr-2 md:py-2 backdrop-blur-md transition-all duration-300 ${
            overHero
              ? 'bg-white/10 border border-white/20 shadow-none'
              : scrolled
              ? 'bg-white/85 shadow-md'
              : 'bg-white/70 shadow-sm'
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors"
              style={{ background: ink }}
            >
              V
            </span>
            <span className="font-bold tracking-tight transition-colors" style={{ color: navText }}>volunect</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className="text-sm font-medium transition-colors"
                style={{ color: location.pathname === l.href ? amber : navTextSoft }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to={dashboardHref}
                  className="text-sm font-medium px-4 py-2 transition-colors"
                  style={{ color: navTextSoft }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold px-5 py-2.5 rounded-full border transition-all hover:bg-black/5"
                  style={{ borderColor: navText, color: navText }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium px-3 py-2 transition-colors"
                  style={{ color: navTextSoft }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 text-sm font-semibold text-white pl-4 pr-1.5 py-1.5 rounded-full transition-transform hover:-translate-y-0.5"
                  style={{ background: ink }}
                >
                  Get Started
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <HiArrowUpRight size={13} />
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full transition-colors"
            style={{ color: navText }}
          >
            {mobileOpen ? <HiX size={20} /> : <HiMenuAlt3 size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="fixed top-20 inset-x-4 z-40 rounded-3xl p-6 backdrop-blur-md bg-white/90 shadow-lg md:hidden"
          >
            <div className="flex flex-col gap-5">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.href}
                  className="text-base font-medium"
                  style={{ color: location.pathname === l.href ? amber : ink }}
                >
                  {l.label}
                </Link>
              ))}
              <div className="pt-4 border-t flex flex-col gap-4" style={{ borderColor: '#E5E1D3' }}>
                {user ? (
                  <>
                    <Link to={dashboardHref} className="text-base font-medium" style={{ color: ink }}>
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="text-left text-base font-medium" style={{ color: inkSoft }}>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-base font-medium" style={{ color: inkSoft }}>
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="inline-block text-white font-semibold px-5 py-3 rounded-full text-center"
                      style={{ background: ink }}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
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
