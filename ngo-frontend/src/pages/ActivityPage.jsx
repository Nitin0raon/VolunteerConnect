import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '../components/layout/DashboardLayout'
import { notificationService } from '../services/dashboardService'
import { formatRelative, formatDate } from '../utils'

/* Same tokens as HomePage / Navbar / Login / Register / dashboard pages */
const ink = '#141310'
const inkSoft = '#6B685F'
const amber = '#E8A33D'

const cardClass = 'rounded-2xl bg-white/70 backdrop-blur-md border'
const cardBorder = { borderColor: 'rgba(20,19,16,0.08)' }

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

function Spinner() {
  return (
    <div
      className="w-8 h-8 rounded-full border-2 animate-spin"
      style={{ borderColor: 'rgba(20,19,16,0.12)', borderTopColor: amber }}
    />
  )
}

function EmptyState({ icon, title, description }) {
  return (
    <div className={`${cardClass} p-12 text-center`} style={cardBorder}>
      <div className="text-3xl mb-4">{icon}</div>
      <p className="text-base font-bold mb-1.5" style={{ color: ink }}>{title}</p>
      <p className="text-sm" style={{ color: inkSoft }}>{description}</p>
    </div>
  )
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
      <div className="font-brand max-w-2xl" style={{ color: ink }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
        `}</style>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: amber }}>Timeline</p>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: ink }}>Activity Feed</h1>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : items.length === 0 ? (
          <EmptyState icon="🔔" title="No activity yet" description="Actions you take will appear here." />
        ) : (
          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-px" style={{ background: 'rgba(20,19,16,0.08)' }} />
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
                    <div
                      className={`w-10 h-10 ${cardClass} flex items-center justify-center text-lg transition-colors`}
                      style={cardBorder}
                    >
                      {ACTION_ICONS[item.action] || '✦'}
                    </div>
                  </div>
                  <div
                    className={`flex-1 ${cardClass} p-4 mb-3 shadow-sm transition-colors group-hover:border-amber-500/20`}
                    style={cardBorder}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm leading-relaxed" style={{ color: ink }}>{item.description}</p>
                      <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: inkSoft }}>
                        {formatRelative(item.created_at)}
                      </span>
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: 'rgba(107,104,95,0.65)' }}>{formatDate(item.created_at)}</p>
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

/* NOTE — what changed and why
   - Same treatment as the other dashboard pages: this was still on the old
     dark theme (bg-card, text-white, bg-white/5 timeline line). Rebuilt to
     the light warm-linen theme — white/70 glass cards, ink/inkSoft text,
     amber for the eyebrow label and hover accent.
   - Swapped the shared `Spinner`/`EmptyState` imports for local versions,
     same reasoning as the other converted pages.
   - Timeline connector line: was `bg-white/5` (nearly invisible on dark,
     which was presumably the point) — now a soft `rgba(20,19,16,0.08)` so
     it reads as a subtle guide line on the light background instead of
     disappearing or looking too heavy.
   - Left the action icons (emoji) as-is — they're already legible, on-brand,
     and don't carry any dark-theme baggage, so there was nothing to fix
     there. Happy to swap any of them for line icons (react-icons) if you'd
     prefer a more restrained, monochrome icon set instead of emoji — just
     say the word.
   - Font import + `font-brand` class added, matching every other page.
*/
