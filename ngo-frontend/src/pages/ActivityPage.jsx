import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Spinner, EmptyState } from '../components/ui/index'
import { notificationService } from '../services/dashboardService'
import { formatRelative, formatDate } from '../utils'

const ACTION_ICONS = {
  program_created: '➕',
  program_updated: '✏️',
  program_deleted: '🗑️',
  volunteer_joined: '🙋',
  volunteer_left: '👋',
  volunteer_waitlisted: '⏳',
  waitlist_promoted: '🎉',
  ngo_approved: '✅',
  ngo_rejected: '❌',
  certificate_generated: '🏆',
}

export default function ActivityPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationService.list()
      .then(({ data }) => setItems(data.results || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout title="Activity">
      <div className="max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs uppercase tracking-widest2 text-primary mb-3">Timeline</p>
          <h1 className="text-4xl font-light text-white">Activity Feed</h1>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : items.length === 0 ? (
          <EmptyState icon="🔔" title="No activity yet" description="Actions you take will appear here." />
        ) : (
          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/5" />
            <div className="space-y-1">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex gap-5 group"
                >
                  <div className="relative flex-shrink-0 mt-4">
                    <div className="w-10 h-10 bg-card border border-subtle rounded-xl flex items-center justify-center text-lg group-hover:border-primary/30 transition-colors">
                      {ACTION_ICONS[item.action] || '✦'}
                    </div>
                  </div>
                  <div className="flex-1 bg-card border border-subtle rounded-2xl p-4 mb-3 group-hover:border-white/10 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-white leading-relaxed">{item.description}</p>
                      <span className="text-xs text-text-secondary flex-shrink-0 mt-0.5">
                        {formatRelative(item.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary/60 mt-1.5">{formatDate(item.created_at)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
