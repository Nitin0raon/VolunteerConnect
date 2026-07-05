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
      <div className="max-w-2xl text-black">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs uppercase tracking-widest font-black text-black mb-3">Account</p>
          <h1 className="text-4xl font-brand font-black uppercase tracking-tighter text-black">My Profile</h1>
        </motion.div>

        {/* Avatar + basic info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-white border border-black rounded-none p-8 mb-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 border border-black bg-black rounded-none flex items-center justify-center text-3xl font-black text-white font-brand">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-2xl font-brand font-black uppercase tracking-tight text-black mb-1">{user?.first_name} {user?.last_name}</h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{user?.email}</p>
              <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] uppercase tracking-wider font-black border border-black bg-black text-white px-3 py-1 rounded-none capitalize">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 font-sans">
            {[
              { label: 'First Name', value: user?.first_name },
              { label: 'Last Name', value: user?.last_name },
              { label: 'Email', value: user?.email },
              { label: 'Member Since', value: formatDate(user?.date_joined) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1.5">{label}</p>
                <p className="text-xs font-bold text-black bg-white rounded-none px-4 py-3 border border-black">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-white border border-black rounded-none p-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-black mb-6 font-brand">Impact Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Joined', value: stats.joined_programs },
                { label: 'Active', value: stats.active_programs },
                { label: 'Certificates', value: stats.certificates_earned },
              ].map(({ label, value }) => (
                <div key={label} className="text-center bg-white rounded-none py-6 border border-black">
                  <p className="text-3xl font-brand font-black text-black mb-1">{value}</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
