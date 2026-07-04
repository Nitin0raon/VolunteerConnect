import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiHome, HiCollection, HiPlus, HiUsers, HiChartBar,
  HiBell, HiUser, HiDocumentText, HiLogout,
} from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'

/* Deliberately dark — this rail stays ink/amber even though the rest of
   the app moved to a light linen theme. The contrast is the point: a solid
   trunk beside a bright canopy, not another light panel. */
const rail = '#161409'
const railBorder = 'rgba(255,255,255,0.08)'
const textPrimary = '#F5F1E6'
const textSoft = 'rgba(245,241,230,0.5)'
const amber = '#E8A33D'

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
      className={
        mobile
          ? 'flex flex-col w-full h-full'
          : 'hidden lg:flex flex-col w-64 min-h-screen fixed top-0 left-0 z-30'
      }
      style={{ background: rail, borderRight: `1px solid ${railBorder}`, color: textPrimary }}
    >
      {/* Logo */}
      <div className="p-6" style={{ borderBottom: `1px solid ${railBorder}` }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: amber, color: rail }}
          >
            V
          </div>
          <span className="font-bold tracking-tight">volunect</span>
        </div>
      </div>

      {/* User */}
      <div className="p-6" style={{ borderBottom: `1px solid ${railBorder}` }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
            style={{ background: 'rgba(232,163,61,0.18)', color: amber }}
          >
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs capitalize" style={{ color: textSoft }}>{user?.role}</p>
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={({ isActive }) =>
              isActive
                ? { background: 'rgba(232,163,61,0.14)', color: amber, border: '1px solid rgba(232,163,61,0.3)' }
                : { color: textSoft, border: '1px solid transparent' }
            }
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.color = textPrimary
            }}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4" style={{ borderTop: `1px solid ${railBorder}` }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium transition-all hover:bg-white/5"
          style={{ color: textSoft }}
        >
          <HiLogout size={18} />
          Logout
        </button>
      </div>
    </motion.aside>
  )
}

/* NOTE
   - NavLink's `style` prop accepts a function of ({isActive}) just like
     `className` did in the original — kept that pattern, just returning a
     style object instead of a class string, since the active/inactive
     colors here aren't plain Tailwind utility swaps.
   - Removed the dead commented-out duplicate icon import block that was in
     the original file.
   - This rail intentionally does NOT use the linen/white tokens from the
     rest of the app — it's the one dark surface left, for contrast against
     DashboardLayout's now-light body.
*/
