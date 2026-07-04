import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiHome, HiCollection, HiPlus, HiUsers, HiChartBar,
  HiBell, HiUser, HiDocumentText, HiLogout,
} from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
// import {
//   HiHome, HiCollection, HiPlus, HiUsers, HiChartBar,
//   HiBell, HiUser, HiDocumentText, HiLogout,
// } from 'react-icons/hi'

const ngoLinks = [
  { icon: HiUsers, label: 'Join Requests', to: '/ngo/requests' },
  { icon: HiHome, label: 'Dashboard', to: '/ngo/dashboard' },
  { icon: HiCollection, label: 'Programs', to: '/ngo/programs' },
  { icon: HiPlus, label: 'Create Program', to: '/ngo/create-program' },
  { icon: HiChartBar, label: 'Analytics', to: '/ngo/analytics' },
  { icon: HiBell, label: 'Activity', to: '/ngo/activity' },
]

const volunteerLinks = [
  { icon: HiHome, label: 'Dashboard', to: '/volunteer/dashboard' },
  { icon: HiCollection, label: 'Browse Programs', to: '/programs' },
  { icon: HiDocumentText, label: 'My Programs', to: '/volunteer/participations' },
  { icon: HiDocumentText, label: 'Certificates', to: '/volunteer/certificates' },
  { icon: HiBell, label: 'Activity', to: '/volunteer/activity' },
  { icon: HiUser, label: 'Profile', to: '/volunteer/profile' },
]

export default function DashboardSidebar({ mobile = false }) {
  const { isNGO, user, logout } = useAuth()
  const navigate = useNavigate()
  const links = isNGO ? ngoLinks : volunteerLinks

  const handleLogout = async () => { await logout(); navigate('/') }

  return (
    <motion.aside
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={mobile
        ? 'flex flex-col w-full h-full bg-bg-secondary border-r border-subtle'
        : 'hidden lg:flex flex-col w-64 min-h-screen bg-bg-secondary border-r border-subtle fixed top-0 left-0 z-30'}
    >
      {/* Logo */}
      <div className="p-6 border-b border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-bg font-bold text-sm">V</span>
          </div>
          <span className="font-semibold text-white">Volunect</span>
        </div>
      </div>

      {/* User */}
      <div className="p-6 border-b border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-medium">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-text-secondary capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to.endsWith('dashboard')}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-subtle">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-all"
        >
          <HiLogout size={18} />
          Logout
        </button>
      </div>
    </motion.aside>
  )
}
