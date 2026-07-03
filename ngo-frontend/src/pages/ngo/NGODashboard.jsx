import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { HiCollection, HiUsers, HiStar, HiCheckCircle, HiPlus } from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Spinner, Badge, StatsCard } from '../../components/ui/index'
import { dashboardService, notificationService } from '../../services/dashboardService'
import { programService } from '../../services/programService'
import { useAuth } from '../../context/AuthContext'
import { formatRelative } from '../../utils'
import { staggerContainer, fadeUp } from '../../utils/motion'

const COLORS = ['#8FAFB2', '#A8C5C7', '#6B9EA1', '#4D8387']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-subtle rounded-xl px-4 py-3 text-sm">
      <p className="text-text-secondary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-primary font-medium">{p.value} participants</p>
      ))}
    </div>
  )
}

export default function NGODashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [programs, setPrograms] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [ngoApproved, setNgoApproved] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, p, a] = await Promise.allSettled([
          dashboardService.ngo(),
          programService.mine(),
          notificationService.list(),
        ])
        if (s.status === 'fulfilled') setStats(s.value.data.data)
        else if (s.reason?.response?.status === 403) setNgoApproved(false)
        if (p.status === 'fulfilled') setPrograms((p.value.data.results || []).slice(0, 5))
        if (a.status === 'fulfilled') setActivity((a.value.data.results || []).slice(0, 6))
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const barData = stats?.participants_per_program?.slice(0, 6).map(p => ({
    name: p.title?.slice(0, 12) + (p.title?.length > 12 ? '…' : ''),
    participants: p.joined_count,
  })) || []

  const pieData = stats ? [
    { name: 'Active', value: stats.active_programs || 0 },
    { name: 'Completed', value: stats.completed_programs || 0 },
    { name: 'Cancelled', value: stats.cancelled_programs || 0 },
  ].filter(d => d.value > 0) : []

  // if (!ngoApproved) return (
  //   <DashboardLayout title="Dashboard">
  //     <div className="flex flex-col items-center justify-center h-80 text-center">
  //       <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl flex items-center justify-center text-3xl mb-6">⏳</div>
  //       <h2 className="text-2xl font-light text-white mb-3">Pending Approval</h2>
  //       <p className="text-text-secondary max-w-sm text-sm">Your NGO profile is under review. You'll receive an email once approved and can start creating programs.</p>
  //     </div>
  //   </DashboardLayout>
  // )

  return (
    <DashboardLayout title="NGO Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-10">
          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-text-secondary text-sm mb-1">Welcome back,</p>
            <h1 className="text-3xl font-light text-white">{user?.first_name} {user?.last_name} <span className="text-primary">✦</span></h1>
          </motion.div>

          {/* Stats */}
          {stats && (
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Programs', value: stats.total_programs, icon: <HiCollection /> },
                { label: 'Active Programs', value: stats.active_programs, icon: <HiStar /> },
                { label: 'Completed', value: stats.completed_programs, icon: <HiCheckCircle /> },
                { label: 'Total Participants', value: stats.total_participants, icon: <HiUsers /> },
              ].map((s, i) => (
                <motion.div key={i} variants={fadeUp}><StatsCard {...s} /></motion.div>
              ))}
            </motion.div>
          )}

          {/* Charts */}
          {(barData.length > 0 || pieData.length > 0) && (
            <div className="grid lg:grid-cols-3 gap-6">
              {barData.length > 0 && (
                <div className="lg:col-span-2 bg-card border border-subtle rounded-3xl p-6">
                  <h3 className="text-sm font-medium text-white mb-6">Participants per Program</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} barSize={28}>
                      <XAxis dataKey="name" tick={{ fill: '#B8B8B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#B8B8B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="participants" fill="#8FAFB2" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {pieData.length > 0 && (
                <div className="bg-card border border-subtle rounded-3xl p-6">
                  <h3 className="text-sm font-medium text-white mb-6">Program Status</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {pieData.map(({ name, value }, i) => (
                      <div key={name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                          <span className="text-text-secondary">{name}</span>
                        </div>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Programs + Activity */}
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-white">Recent Programs</h2>
                <Link to="/ngo/programs" className="text-xs text-primary">View all →</Link>
              </div>
              {programs.length === 0 ? (
                <div className="bg-card border border-subtle rounded-2xl p-8 text-center">
                  <p className="text-text-secondary text-sm mb-4">No programs yet.</p>
                  <Link to="/ngo/create-program" className="inline-flex items-center gap-2 bg-primary text-bg px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary-hover transition-all">
                    <HiPlus /> Create your first program
                  </Link>
                </div>
              ) : programs.map((p) => (
                <motion.div key={p.id} whileHover={{ x: 4 }}
                  className="bg-card border border-subtle rounded-2xl p-4 flex items-center gap-4 mb-3"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                    <HiCollection size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{p.title}</p>
                    <p className="text-xs text-text-secondary">{p.current_participants}/{p.capacity} participants</p>
                  </div>
                  <Badge status={p.status} />
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-white">Activity</h2>
                <Link to="/ngo/activity" className="text-xs text-primary">View all →</Link>
              </div>
              <div className="space-y-3">
                {activity.map((a) => (
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

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-medium text-white mb-5">Quick Actions</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Create Program', href: '/ngo/create-program', icon: '➕', desc: 'Post a new volunteer opportunity' },
                { label: 'Analytics', href: '/ngo/analytics', icon: '📊', desc: 'View detailed program insights' },
                { label: 'Manage Programs', href: '/ngo/programs', icon: '📋', desc: 'Edit, update or remove programs' },
              ].map(({ label, href, icon, desc }) => (
                <Link key={label} to={href}>
                  <motion.div whileHover={{ y: -4 }} className="bg-card border border-subtle rounded-2xl p-5 group cursor-pointer h-full">
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
