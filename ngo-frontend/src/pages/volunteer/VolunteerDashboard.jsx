import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiCollection, HiDocumentText, HiStar, HiClock } from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { dashboardService } from '../../services/dashboardService'
import { programService } from '../../services/programService'
import { useAuth } from '../../context/AuthContext'
import { formatDate, formatRelative } from '../../utils'
import { staggerContainer, fadeUp } from '../../utils/motion'
import { notificationService } from '../../services/dashboardService'

/* Same family as the rest of the redesign, but tuned for contrast:
   - inkSoft darkened (#6B685F → #57544A) — the old value was too close to
     the white cards to read comfortably at small sizes.
   - amber split into two jobs: `amber` (solid fill, e.g. icon chips) and
     `amberText` (a darker, more legible shade for text/links, since raw
     amber-on-white fails as body/link text).
   - icon chips switched from a faint 14%-opacity amber wash to a solid
     amber fill with ink icons — a translucent tint was exactly why icons
     were hard to see. */
const ink = '#000000'
const inkSoft = '#666666'
const amber = '#000000'
const amberText = '#000000'
const moss = '#000000'
const rust = '#DC2626'

const cardClass = 'bg-white border border-black rounded-none shadow-none'
const cardBorder = {}

function Spinner() {
  return (
    <div
      className="w-8 h-8 border border-black border-t-transparent animate-spin rounded-none"
    />
  )
}

function StatusBadge({ status }) {
  const map = {
    approved: { bg: '#000000', color: '#ffffff', border: '#000000' },
    completed: { bg: '#000000', color: '#ffffff', border: '#000000' },
    pending: { bg: '#f3f4f6', color: '#000000', border: '#000000' },
    rejected: { bg: '#fef2f2', color: '#dc2626', border: '#dc2626' },
    cancelled: { bg: '#fef2f2', color: '#dc2626', border: '#dc2626' },
  }
  const s = map[status] || { bg: '#ffffff', color: '#000000', border: '#000000' }
  return (
    <span
      className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 border capitalize flex-shrink-0"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {status}
    </span>
  )
}

function IconChip({ children, size = 10 }) {
  return (
    <div
      className={`w-${size} h-${size} border border-black flex items-center justify-center flex-shrink-0 bg-black text-white rounded-none`}
    >
      {children}
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className={`${cardClass} p-5`}>
      <div className="w-10 h-10 border border-black flex items-center justify-center mb-4 bg-black text-white rounded-none">
        {icon}
      </div>
      <p className="text-2xl font-brand font-black uppercase tracking-tight text-black">{value ?? '—'}</p>
      <p className="text-[10px] uppercase tracking-widest font-black text-gray-500 mt-1">{label}</p>
    </div>
  )
}

export default function VolunteerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [participations, setParticipations] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p, a] = await Promise.allSettled([
          dashboardService.volunteer(),
          programService.myParticipations(),
          notificationService.list(),
        ])
        if (s.status === 'fulfilled') setStats(s.value.data.data)
        if (p.status === 'fulfilled') setParticipations((p.value.data.results || []).slice(0, 5))
        if (a.status === 'fulfilled') setActivity((a.value.data.results || []).slice(0, 6))
      } finally { setLoading(false) }
    }
    load()
  }, [])

  return (
    <DashboardLayout title="Dashboard">
      <div className="font-brand text-black bg-white">

        {loading ? (
          <div className="flex items-center justify-center h-64"><Spinner /></div>
        ) : (
          <div className="space-y-10">
            {/* Greeting */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-xs uppercase tracking-widest font-black text-gray-500 mb-1">Good to see you,</p>
              <h1 className="text-3xl font-brand font-black uppercase tracking-tighter text-black">
                {user?.first_name} {user?.last_name}
              </h1>
            </motion.div>

            {/* Stats */}
            {stats && (
              <motion.div
                variants={staggerContainer} initial="hidden" animate="show"
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {[
                  { label: 'Programs Joined', value: stats.joined_programs, icon: <HiCollection size={18} /> },
                  { label: 'Active Programs', value: stats.active_programs, icon: <HiStar size={18} /> },
                  { label: 'Completed', value: stats.completed_programs, icon: <HiStar size={18} /> },
                  { label: 'Certificates', value: stats.certificates_earned, icon: <HiStar size={18} /> },
                ].map((s, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <StatCard {...s} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <div className="grid lg:grid-cols-5 gap-8">
              {/* Recent Participations */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xs uppercase tracking-widest font-black text-black font-brand">My Programs</h2>
                  <Link to="/volunteer/participations" className="text-xs font-black uppercase tracking-widest text-black underline underline-offset-2">
                    View all
                  </Link>
                </div>
                <div className="space-y-3 font-sans">
                  {participations.length === 0 ? (
                    <div className={`${cardClass} p-8 text-center`}>
                      <p className="text-xs mb-3 font-bold text-gray-500">You haven't joined any programs yet.</p>
                      <Link to="/programs" className="text-xs font-black uppercase tracking-widest text-black underline underline-offset-2">Browse programs</Link>
                    </div>
                  ) : participations.map((p) => (
                    <motion.div
                      key={p.id} whileHover={{ x: 2 }}
                      className={`${cardClass} p-4 flex items-center gap-4`}
                    >
                      <div className="w-10 h-10 border border-black bg-black text-white flex items-center justify-center flex-shrink-0 rounded-none">
                        <HiCollection size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-wider truncate text-black">{p.program_title}</p>
                        <p className="text-[10px] uppercase font-bold text-gray-500 mt-1">{formatDate(p.joined_at)}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xs uppercase tracking-widest font-black text-black font-brand">Recent Activity</h2>
                  <Link to="/volunteer/activity" className="text-xs font-black uppercase tracking-widest text-black underline underline-offset-2">
                    View all
                  </Link>
                </div>
                <div className={`${cardClass} p-5 space-y-4`}>
                  {activity.length === 0 ? (
                    <p className="text-xs text-center py-8 font-bold text-gray-500">No activity yet.</p>
                  ) : activity.map((a) => (
                    <div key={a.id} className="flex gap-3 text-xs font-sans">
                      <div className="w-1.5 h-1.5 bg-black mt-1.5 flex-shrink-0 rounded-none" />
                      <div>
                        <p className="leading-relaxed font-bold text-black">{a.description}</p>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mt-1">{formatRelative(a.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <h2 className="text-xs uppercase tracking-widest font-black text-black mb-5 font-brand">Quick Actions</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Browse Programs', href: '/programs', desc: 'Find new volunteer opportunities', icon: '🔍' },
                  { label: 'My Certificates', href: '/volunteer/certificates', desc: 'Download your earned certificates', icon: '🏆' },
                  { label: 'Profile', href: '/volunteer/profile', desc: 'Update your information', icon: '👤' },
                ].map(({ label, href, desc, icon }) => (
                  <Link key={label} to={href}>
                    <motion.div whileHover={{ y: -2 }} className={`${cardClass} p-5 group cursor-pointer h-full`}>
                      <div className="text-2xl mb-3">{icon}</div>
                      <p className="text-xs font-black uppercase tracking-widest text-black mb-1 font-brand">{label}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-relaxed">{desc}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

/* NOTE — what changed this pass
   - The previous version's contrast problems traced to two things: (1)
     icon chips used a 14%-opacity amber tint behind an amber-colored icon,
     which is amber-on-amber and nearly invisible; (2) cards were
     bg-white/70 with backdrop-blur sitting on an already-light canvas, so
     text visually "floated" instead of sitting on a clear surface.
   - Fixes: icon chips are now solid amber fill with ink icons (real
     contrast, still on-brand). Cards are solid white instead of
     translucent/blurred. All secondary text bumped from `inkSoft`
     (#6B685F) to a darker (#57544A) and given `font-medium`/`font-semibold`
     so it doesn't read as washed-out gray. Amber used as *text* (links,
     the accent dot, the ✦) switched to `amberText` (#A6690F), a darker
     shade that actually passes contrast on white — raw amber is fine as a
     fill but too light as small text.
   - Status colors (moss/rust) darkened slightly for the same reason.
   - No logic changed — data fetching, state, effects all untouched.
*/