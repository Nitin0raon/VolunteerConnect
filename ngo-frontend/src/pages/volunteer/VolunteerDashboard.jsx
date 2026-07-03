import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiCollection, HiDocumentText, HiStar, HiClock } from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Spinner, Badge } from '../../components/ui/index'
import { StatsCard } from '../../components/ui/index'
import { dashboardService } from '../../services/dashboardService'
import { programService } from '../../services/programService'
import { useAuth } from '../../context/AuthContext'
import { formatDate, formatRelative } from '../../utils'
import { staggerContainer, fadeUp } from '../../utils/motion'
import { notificationService } from '../../services/dashboardService'

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
      {loading ? (
        <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-10">
          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-text-secondary text-sm mb-1">Good to see you,</p>
            <h1 className="text-3xl font-light text-white">
              {user?.first_name} {user?.last_name} <span className="text-primary">✦</span>
            </h1>
          </motion.div>

          {/* Stats */}
          {stats && (
            <motion.div
              variants={staggerContainer} initial="hidden" animate="show"
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {[
                { label: 'Programs Joined', value: stats.joined_programs, icon: <HiCollection /> },
                { label: 'Active Programs', value: stats.active_programs, icon: <HiStar /> },
                { label: 'Completed', value: stats.completed_programs, icon: <HiDocumentText /> },
                { label: 'Certificates', value: stats.certificates_earned, icon: <HiStar /> },
              ].map((s, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <StatsCard {...s} />
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Recent Participations */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-white">My Programs</h2>
                <Link to="/volunteer/participations" className="text-xs text-primary hover:text-primary-hover transition-colors">View all →</Link>
              </div>
              <div className="space-y-3">
                {participations.length === 0 ? (
                  <div className="bg-card border border-subtle rounded-2xl p-8 text-center">
                    <p className="text-text-secondary text-sm mb-3">You haven't joined any programs yet.</p>
                    <Link to="/programs" className="text-sm text-primary">Browse programs →</Link>
                  </div>
                ) : participations.map((p) => (
                  <motion.div key={p.id} whileHover={{ x: 4 }}
                    className="bg-card border border-subtle rounded-2xl p-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                      <HiCollection size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.program_title}</p>
                      <p className="text-xs text-text-secondary">{formatDate(p.joined_at)}</p>
                    </div>
                    <Badge status={p.status} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-white">Recent Activity</h2>
                <Link to="/volunteer/activity" className="text-xs text-primary hover:text-primary-hover transition-colors">View all →</Link>
              </div>
              <div className="space-y-3">
                {activity.length === 0 ? (
                  <p className="text-text-secondary text-sm text-center py-8">No activity yet.</p>
                ) : activity.map((a) => (
                  <div key={a.id} className="flex gap-3 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-text-secondary leading-relaxed">{a.description}</p>
                      <p className="text-xs text-text-secondary/60 mt-0.5">{formatRelative(a.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-lg font-medium text-white mb-5">Quick Actions</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Browse Programs', href: '/programs', desc: 'Find new volunteer opportunities', icon: '🔍' },
                { label: 'My Certificates', href: '/volunteer/certificates', desc: 'Download your earned certificates', icon: '🏆' },
                { label: 'Profile', href: '/volunteer/profile', desc: 'Update your information', icon: '👤' },
              ].map(({ label, href, desc, icon }) => (
                <Link key={label} to={href}>
                  <motion.div whileHover={{ y: -4 }}
                    className="bg-card border border-subtle rounded-2xl p-5 group cursor-pointer h-full"
                  >
                    <div className="text-2xl mb-3">{icon}</div>
                    <p className="text-sm font-medium text-white group-hover:text-primary transition-colors mb-1">{label}</p>
                    <p className="text-xs text-text-secondary">{desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
