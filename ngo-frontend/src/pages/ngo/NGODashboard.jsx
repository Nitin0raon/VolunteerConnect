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

const COLORS = ['#000000', '#333333', '#666666', '#999999']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-black rounded-none px-4 py-3 text-xs font-sans">
      <p className="text-gray-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-black font-black uppercase tracking-wider">{p.value} participants</p>
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

  return (
    <DashboardLayout title="NGO Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-10 text-black">
          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs uppercase tracking-widest font-black text-gray-500 mb-1">Welcome back,</p>
            <h1 className="text-3xl font-brand font-black uppercase tracking-tighter text-black">{user?.first_name} {user?.last_name}</h1>
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
            <div className="grid lg:grid-cols-3 gap-6 font-sans">
              {barData.length > 0 && (
                <div className="lg:col-span-2 bg-white border border-black rounded-none p-6">
                  <h3 className="text-xs uppercase tracking-widest font-black text-black mb-6 font-brand">Participants per Program</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} barSize={28}>
                      <XAxis dataKey="name" tick={{ fill: '#000000', fontSize: 10 }} axisLine={true} tickLine={true} />
                      <YAxis tick={{ fill: '#000000', fontSize: 10 }} axisLine={true} tickLine={true} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="participants" fill="#000000" radius={0} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {pieData.length > 0 && (
                <div className="bg-white border border-black rounded-none p-6">
                  <h3 className="text-xs uppercase tracking-widest font-black text-black mb-6 font-brand">Program Status</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {pieData.map(({ name, value }, i) => (
                      <div key={name} className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-none" style={{ background: COLORS[i] }} />
                          <span className="text-gray-500">{name}</span>
                        </div>
                        <span className="text-black font-black">{value}</span>
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
                <h2 className="text-xs uppercase tracking-widest font-black text-black font-brand">Recent Programs</h2>
                <Link to="/ngo/programs" className="text-xs font-black uppercase tracking-widest text-black underline underline-offset-2">View all</Link>
              </div>
              {programs.length === 0 ? (
                <div className="bg-white border border-black rounded-none p-8 text-center">
                  <p className="text-xs font-bold text-gray-500 mb-4">No programs yet.</p>
                  <Link to="/ngo/create-program" className="inline-flex items-center gap-2 border border-black bg-black text-white px-5 py-2.5 rounded-none text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    <HiPlus /> Create first program
                  </Link>
                </div>
              ) : programs.map((p) => (
                <motion.div key={p.id} whileHover={{ x: 2 }}
                  className="bg-white border border-black rounded-none p-4 flex items-center gap-4 mb-3 font-sans"
                >
                  <div className="w-10 h-10 border border-black bg-black text-white rounded-none flex items-center justify-center flex-shrink-0">
                    <HiCollection size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase tracking-wider truncate text-black">{p.title}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-500 mt-1">{p.current_participants}/{p.capacity} participants</p>
                  </div>
                  <Badge status={p.status} />
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs uppercase tracking-widest font-black text-black font-brand">Activity</h2>
                <Link to="/ngo/activity" className="text-xs font-black uppercase tracking-widest text-black underline underline-offset-2">View all</Link>
              </div>
              <div className="space-y-4 font-sans">
                {activity.length === 0 ? (
                  <p className="text-xs font-bold text-gray-500">No activity yet.</p>
                ) : activity.map((a) => (
                  <div key={a.id} className="flex gap-3 text-xs">
                    <div className="w-1.5 h-1.5 bg-black rounded-none mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-black font-bold leading-relaxed">{a.description}</p>
                      <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">{formatRelative(a.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xs uppercase tracking-widest font-black text-black mb-5 font-brand">Quick Actions</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Create Program', href: '/ngo/create-program', icon: '➕', desc: 'Post a new volunteer opportunity' },
                { label: 'Analytics', href: '/ngo/analytics', icon: '📊', desc: 'View detailed program insights' },
                { label: 'Manage Programs', href: '/ngo/programs', icon: '📋', desc: 'Edit, update or remove programs' },
              ].map(({ label, href, icon, desc }) => (
                <Link key={label} to={href}>
                  <motion.div whileHover={{ y: -2 }} className="bg-white border border-black rounded-none p-5 group cursor-pointer h-full">
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
    </DashboardLayout>
  )
}
