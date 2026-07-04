import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenuAlt3, HiX, HiBell, HiLogout } from 'react-icons/hi'
import DashboardSidebar from '../dashboard/DashboardSidebar'
import { useAuth } from '../../context/AuthContext'

/* The dashboard canvas runs a shade deeper than the marketing pages
   (canvasBg instead of the lighter pageBg used on Home/Login/etc.) so it
   doesn't read as one flat, overexposed plane. Page content then sits in
   its own white card on top of that canvas, so whatever renders as
   `children` has real definition instead of floating on raw background. */
const canvasBg = '#E6E1D3'
const cardBg = '#FBFAF6'
const ink = '#141310'
const inkSoft = '#6B685F'
const amber = '#E8A33D'
const line = '#DEDACB'

export default function DashboardLayout({ children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, isNGO } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => { await logout(); navigate('/') }

  return (
    <div className="min-h-screen flex" style={{ background: canvasBg, color: ink }}>
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30 }}
              className="absolute top-0 left-0 bottom-0 w-72 shadow-xl"
              style={{ background: '#F7F5EE', borderRight: `1px solid ${line}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <DashboardSidebar mobile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Topbar */}
        <header
          className="sticky top-0 z-20 backdrop-blur-xl px-6 py-4 flex items-center justify-between"
          style={{ background: `${canvasBg}D9`, borderBottom: `1px solid ${line}`, boxShadow: '0 1px 0 rgba(0,0,0,0.02)' }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden transition-colors"
              style={{ color: inkSoft }}
            >
              <HiMenuAlt3 size={22} />
            </button>
            {title && <h1 className="text-lg font-bold tracking-tight">{title}</h1>}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={isNGO ? '/ngo/activity' : '/volunteer/activity'}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-white/60 hover:bg-white"
              style={{ color: inkSoft }}
            >
              <HiBell size={16} />
            </Link>
            <div className="flex items-center gap-2 rounded-full pl-2 pr-3 py-1.5 bg-white/60">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: amber, color: ink }}
              >
                {user?.first_name?.[0]}
              </div>
              <span className="text-xs hidden sm:block" style={{ color: inkSoft }}>{user?.first_name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-white/60 hover:bg-red-50 hover:text-red-500"
              style={{ color: inkSoft }}
            >
              <HiLogout size={16} />
            </button>
          </div>
        </header>

        {/* Content — sits in its own card on the deeper canvas, rather than
            floating directly on it, so nested dashboard pages read as
            content rather than more background. */}
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 p-4 md:p-8"
        >
          <div
            className="min-h-full rounded-[1.75rem] p-6 md:p-10 shadow-sm"
            style={{ background: cardBg, border: `1px solid ${line}` }}
          >
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  )
}

/* NOTE
   - Fixed the "too bright / blends together" issue: the outer canvas is now
     a deeper, more muted tone (canvasBg), and all page content renders
     inside its own lighter card (cardBg) with a border + soft shadow. Every
     dashboard page now sits in a clearly defined panel instead of floating
     on the raw background — same idea as the dark sidebar standing apart,
     just applied to the content side.
   - Avatar initial sits on an amber chip, kept as the one small spot of
     color in the topbar.
   - Mobile overlay backdrop is black/50 since the panel behind it is light,
     not dark.
*/
