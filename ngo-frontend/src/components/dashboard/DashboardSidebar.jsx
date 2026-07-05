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
const rail = '#000000'
const railBorder = '#333333'
const textPrimary = '#FFFFFF'
const textSoft = '#888888'
const amber = '#FFFFFF'

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
          <span className="font-black text-lg tracking-widest text-white uppercase font-brand">volunect</span>
        </div>
      </div>

      {/* User */}
      <div className="p-6" style={{ borderBottom: `1px solid ${railBorder}` }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 border border-white flex items-center justify-center font-bold text-white bg-black"
          >
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate uppercase tracking-wider">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs capitalize font-medium" style={{ color: textSoft }}>{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-2">
        {links.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to.endsWith('dashboard')}
            className="flex items-center gap-3 px-4 py-3 rounded-none text-xs font-black uppercase tracking-widest transition-all"
            style={({ isActive }) =>
              isActive
                ? { background: '#FFFFFF', color: '#000000', border: '1px solid #FFFFFF' }
                : { color: textSoft, border: '1px solid transparent' }
            }
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.color = textPrimary
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.color = textSoft
            }}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4" style={{ borderTop: `1px solid ${railBorder}` }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-none text-xs font-black uppercase tracking-widest transition-all hover:bg-white/10"
          style={{ color: textSoft }}
        >
          <HiLogout size={16} />
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
