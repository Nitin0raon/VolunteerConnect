import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenuAlt3, HiX, HiBell, HiLogout } from 'react-icons/hi'
import DashboardSidebar from '../dashboard/DashboardSidebar'
import { useAuth } from '../../context/AuthContext'

export default function DashboardLayout({ children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, isNGO } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => { await logout(); navigate('/') }

  return (
    <div className="min-h-screen bg-bg flex">
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
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30 }}
              className="absolute top-0 left-0 bottom-0 w-72 bg-bg-secondary border-r border-subtle"
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
        <header className="sticky top-0 z-20 bg-bg/80 backdrop-blur-xl border-b border-subtle px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-text-secondary hover:text-white">
              <HiMenuAlt3 size={22} />
            </button>
            {title && <h1 className="text-lg font-medium text-white">{title}</h1>}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={isNGO ? '/ngo/activity' : '/volunteer/activity'}
              className="w-9 h-9 border border-subtle rounded-full flex items-center justify-center text-text-secondary hover:text-white hover:border-white/20 transition-all"
            >
              <HiBell size={16} />
            </Link>
            <div className="flex items-center gap-2 border border-subtle rounded-full pl-2 pr-3 py-1.5">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-medium">
                {user?.first_name?.[0]}
              </div>
              <span className="text-xs text-text-secondary hidden sm:block">{user?.first_name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-9 h-9 border border-subtle rounded-full flex items-center justify-center text-text-secondary hover:text-red-400 hover:border-red-400/30 transition-all"
            >
              <HiLogout size={16} />
            </button>
          </div>
        </header>

        {/* Content */}
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 p-6 md:p-10"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
