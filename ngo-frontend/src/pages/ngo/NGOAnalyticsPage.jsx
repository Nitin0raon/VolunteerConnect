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

const COLORS = ['#000000', '#333333', '#666666', '#999999']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-black rounded-none px-4 py-3 text-xs font-sans text-black">
      <p className="text-gray-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-black uppercase tracking-wider text-black">{p.name}: {p.value}</p>
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
  if (error) return <DashboardLayout title="Analytics"><div className="text-center py-20 text-xs font-bold uppercase tracking-wider text-red-600 border border-red-600 bg-red-50 px-4 py-3 max-w-sm mx-auto">Your NGO must be approved to view analytics.</div></DashboardLayout>

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
      <div className="space-y-10 text-black">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs uppercase tracking-widest font-black text-gray-500 mb-3">Insights</p>
          <h1 className="text-4xl font-brand font-black uppercase tracking-tighter text-black">Analytics Dashboard</h1>
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white border border-black rounded-none p-8 font-sans"
          >
            <h3 className="text-xs uppercase tracking-widest font-black text-black mb-2 font-brand">Participants vs Capacity</h3>
            <p className="text-[10px] uppercase font-bold text-gray-500 mb-8">How filled each program is</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} barGap={4} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                <XAxis dataKey="name" tick={{ fill: '#000000', fontSize: 10 }} axisLine={true} tickLine={true} />
                <YAxis tick={{ fill: '#000000', fontSize: 10 }} axisLine={true} tickLine={true} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="capacity" fill="rgba(0,0,0,0.05)" stroke="#000000" strokeWidth={1} radius={0} name="Capacity" />
                <Bar dataKey="participants" fill="#000000" radius={0} name="Participants" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
 
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pie chart */}
          {pieData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white border border-black rounded-none p-8 font-sans">
              <h3 className="text-xs uppercase tracking-widest font-black text-black mb-2 font-brand">Program Distribution</h3>
              <p className="text-[10px] uppercase font-bold text-gray-500 mb-6">Status breakdown</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4 font-sans">
                {pieData.map(({ name }, i) => (
                  <div key={name} className="flex items-center gap-2 text-xs uppercase font-bold text-gray-500">
                    <div className="w-2.5 h-2.5 rounded-none" style={{ background: COLORS[i] }} />
                    {name}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
 
          {/* Per-program table */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-white border border-black rounded-none p-8 font-sans">
            <h3 className="text-xs uppercase tracking-widest font-black text-black mb-6 font-brand">Program Breakdown</h3>
            <div className="space-y-4">
              {(stats?.participants_per_program || []).map((p) => {
                const pct = p.capacity ? Math.min(100, Math.round((p.joined_count / p.capacity) * 100)) : 0
                return (
                  <div key={p.id}>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1.5">
                      <span className="text-black truncate max-w-[200px]">{p.title}</span>
                      <span className="text-black ml-2 font-black">{p.joined_count}/{p.capacity}</span>
                    </div>
                    <div className="h-2 bg-gray-100 border border-black rounded-none overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-black rounded-none"
                      />
                    </div>
                  </div>
                )
              })}
              {!stats?.participants_per_program?.length && (
                <p className="text-xs text-center py-8 font-bold text-gray-500 uppercase tracking-widest">No program data yet.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
