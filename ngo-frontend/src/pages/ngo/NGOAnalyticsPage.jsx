import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Spinner, StatsCard } from '../../components/ui/index'
import { dashboardService } from '../../services/dashboardService'
import { staggerContainer, fadeUp } from '../../utils/motion'

const COLORS = ['#8FAFB2', '#A8C5C7', '#6B9EA1', '#4D8387', '#2F6B6E']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-subtle rounded-xl px-4 py-3 text-xs">
      <p className="text-text-secondary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function NGOAnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    dashboardService.ngo()
      .then(({ data }) => setStats(data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout title="Analytics"><div className="flex justify-center py-20"><Spinner size="lg" /></div></DashboardLayout>
  if (error) return <DashboardLayout title="Analytics"><div className="text-center py-20 text-text-secondary">Your NGO must be approved to view analytics.</div></DashboardLayout>

  const barData = (stats?.participants_per_program || []).map(p => ({
    name: p.title?.slice(0, 14) + (p.title?.length > 14 ? '…' : ''),
    participants: p.joined_count || 0,
    capacity: p.capacity || 0,
  }))

  const pieData = [
    { name: 'Active', value: stats?.active_programs || 0 },
    { name: 'Completed', value: stats?.completed_programs || 0 },
    { name: 'Cancelled', value: stats?.cancelled_programs || 0 },
  ].filter(d => d.value > 0)

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs uppercase tracking-widest2 text-primary mb-3">Insights</p>
          <h1 className="text-4xl font-light text-white">Analytics Dashboard</h1>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Programs', value: stats?.total_programs ?? 0 },
            { label: 'Active Programs', value: stats?.active_programs ?? 0 },
            { label: 'Completed', value: stats?.completed_programs ?? 0 },
            { label: 'Total Participants', value: stats?.total_participants ?? 0 },
          ].map((s, i) => (
            <motion.div key={i} variants={fadeUp}><StatsCard {...s} /></motion.div>
          ))}
        </motion.div>

        {/* Bar Chart */}
        {barData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border border-subtle rounded-3xl p-8">
            <h3 className="text-sm font-medium text-white mb-2">Participants vs Capacity</h3>
            <p className="text-xs text-text-secondary mb-8">How filled each program is</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} barGap={4} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#B8B8B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#B8B8B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="capacity" fill="rgba(143,175,178,0.15)" radius={[4, 4, 0, 0]} name="Capacity" />
                <Bar dataKey="participants" fill="#8FAFB2" radius={[4, 4, 0, 0]} name="Participants" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pie chart */}
          {pieData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-card border border-subtle rounded-3xl p-8">
              <h3 className="text-sm font-medium text-white mb-2">Program Distribution</h3>
              <p className="text-xs text-text-secondary mb-6">Status breakdown</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {pieData.map(({ name }, i) => (
                  <div key={name} className="flex items-center gap-2 text-xs text-text-secondary">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                    {name}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Per-program table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-card border border-subtle rounded-3xl p-8">
            <h3 className="text-sm font-medium text-white mb-6">Program Breakdown</h3>
            <div className="space-y-4">
              {(stats?.participants_per_program || []).map((p) => {
                const pct = p.capacity ? Math.min(100, Math.round((p.joined_count / p.capacity) * 100)) : 0
                return (
                  <div key={p.id}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-text-secondary truncate max-w-[200px]">{p.title}</span>
                      <span className="text-white ml-2">{p.joined_count}/{p.capacity}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                )
              })}
              {!stats?.participants_per_program?.length && (
                <p className="text-text-secondary text-sm text-center py-8">No program data yet.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
