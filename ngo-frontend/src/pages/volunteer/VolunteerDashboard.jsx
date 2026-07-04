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
const ink = '#141310'
const inkSoft = '#57544A'
const amber = '#E8A33D'
const amberText = '#A6690F'
const moss = '#3F5C41'
const rust = '#9C4315'

const cardClass = 'rounded-2xl bg-white border shadow-sm'
const cardBorder = { borderColor: 'rgba(20,19,16,0.12)' }

function Spinner() {
  return (
    <div
      className="w-8 h-8 rounded-full border-2 animate-spin"
      style={{ borderColor: 'rgba(20,19,16,0.15)', borderTopColor: amberText }}
    />
  )
}

function StatusBadge({ status }) {
  const map = {
    approved: { bg: 'rgba(63,92,65,0.16)', color: moss },
    completed: { bg: 'rgba(63,92,65,0.16)', color: moss },
    pending: { bg: 'rgba(166,105,15,0.16)', color: amberText },
    rejected: { bg: 'rgba(156,67,21,0.14)', color: rust },
    cancelled: { bg: 'rgba(156,67,21,0.14)', color: rust },
  }
  const s = map[status] || { bg: 'rgba(20,19,16,0.08)', color: inkSoft }
  return (
    <span
      className="text-[11px] font-bold px-2.5 py-1 rounded-full capitalize flex-shrink-0"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  )
}

function IconChip({ children, size = 10 }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-xl flex items-center justify-center flex-shrink-0`}
      style={{ background: amber, color: ink }}
    >
      {children}
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className={`${cardClass} p-5`} style={cardBorder}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: amber, color: ink }}>
        {icon}
      </div>
      <p className="text-2xl font-extrabold tracking-tight" style={{ color: ink }}>{value ?? '—'}</p>
      <p className="text-xs mt-1 font-medium" style={{ color: inkSoft }}>{label}</p>
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
      <div className="font-brand" style={{ color: ink }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
        `}</style>

        {loading ? (
          <div className="flex items-center justify-center h-64"><Spinner /></div>
        ) : (
          <div className="space-y-10">
            {/* Greeting */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-sm mb-1 font-medium" style={{ color: inkSoft }}>Good to see you,</p>
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: ink }}>
                {user?.first_name} {user?.last_name} <span style={{ color: amberText }}>✦</span>
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
                  { label: 'Completed', value: stats.completed_programs, icon: <HiDocumentText size={18} /> },
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
                  <h2 className="text-lg font-bold" style={{ color: ink }}>My Programs</h2>
                  <Link to="/volunteer/participations" className="text-xs font-bold" style={{ color: amberText }}>
                    View all →
                  </Link>
                </div>
                <div className="space-y-3">
                  {participations.length === 0 ? (
                    <div className={`${cardClass} p-8 text-center`} style={cardBorder}>
                      <p className="text-sm mb-3 font-medium" style={{ color: inkSoft }}>You haven't joined any programs yet.</p>
                      <Link to="/programs" className="text-sm font-bold" style={{ color: amberText }}>Browse programs →</Link>
                    </div>
                  ) : participations.map((p) => (
                    <motion.div
                      key={p.id} whileHover={{ x: 4 }}
                      className={`${cardClass} p-4 flex items-center gap-4`}
                      style={cardBorder}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: amber, color: ink }}>
                        <HiCollection size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: ink }}>{p.program_title}</p>
                        <p className="text-xs font-medium" style={{ color: inkSoft }}>{formatDate(p.joined_at)}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold" style={{ color: ink }}>Recent Activity</h2>
                  <Link to="/volunteer/activity" className="text-xs font-bold" style={{ color: amberText }}>
                    View all →
                  </Link>
                </div>
                <div className={`${cardClass} p-5 space-y-4`} style={cardBorder}>
                  {activity.length === 0 ? (
                    <p className="text-sm text-center py-8 font-medium" style={{ color: inkSoft }}>No activity yet.</p>
                  ) : activity.map((a) => (
                    <div key={a.id} className="flex gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: amberText }} />
                      <div>
                        <p className="leading-relaxed font-medium" style={{ color: ink }}>{a.description}</p>
                        <p className="text-xs mt-0.5 font-medium" style={{ color: inkSoft }}>{formatRelative(a.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <h2 className="text-lg font-bold mb-5" style={{ color: ink }}>Quick Actions</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Browse Programs', href: '/programs', desc: 'Find new volunteer opportunities', icon: '🔍' },
                  { label: 'My Certificates', href: '/volunteer/certificates', desc: 'Download your earned certificates', icon: '🏆' },
                  { label: 'Profile', href: '/volunteer/profile', desc: 'Update your information', icon: '👤' },
                ].map(({ label, href, desc, icon }) => (
                  <Link key={label} to={href}>
                    <motion.div whileHover={{ y: -4 }} className={`${cardClass} p-5 group cursor-pointer h-full`} style={cardBorder}>
                      <div className="text-2xl mb-3">{icon}</div>
                      <p className="text-sm font-bold mb-1" style={{ color: ink }}>{label}</p>
                      <p className="text-xs font-medium" style={{ color: inkSoft }}>{desc}</p>
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