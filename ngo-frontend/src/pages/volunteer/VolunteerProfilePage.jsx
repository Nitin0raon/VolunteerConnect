import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Spinner } from '../../components/ui/index'
import { dashboardService } from '../../services/dashboardService'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils'

export default function VolunteerProfilePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardService.volunteer()
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs uppercase tracking-widest2 text-primary mb-3">Account</p>
          <h1 className="text-4xl font-light text-white">My Profile</h1>
        </motion.div>

        {/* Avatar + basic info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card border border-subtle rounded-3xl p-8 mb-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center text-3xl font-light text-primary">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-2xl font-light text-white mb-1">{user?.first_name} {user?.last_name}</h2>
              <p className="text-text-secondary text-sm">{user?.email}</p>
              <span className="inline-flex items-center gap-1.5 mt-2 text-xs border border-primary/30 bg-primary/5 text-primary px-3 py-1 rounded-full capitalize">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />{user?.role}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { label: 'First Name', value: user?.first_name },
              { label: 'Last Name', value: user?.last_name },
              { label: 'Email', value: user?.email },
              { label: 'Member Since', value: formatDate(user?.date_joined) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-text-secondary uppercase tracking-wider mb-1.5">{label}</p>
                <p className="text-sm text-white bg-bg rounded-xl px-4 py-3 border border-subtle">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : stats && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border border-subtle rounded-3xl p-8">
            <h3 className="text-sm font-medium text-white mb-6">Impact Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Joined', value: stats.joined_programs },
                { label: 'Active', value: stats.active_programs },
                { label: 'Certificates', value: stats.certificates_earned },
              ].map(({ label, value }) => (
                <div key={label} className="text-center bg-bg rounded-2xl py-6 border border-subtle">
                  <p className="text-3xl font-light text-primary mb-1">{value}</p>
                  <p className="text-xs text-text-secondary">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
