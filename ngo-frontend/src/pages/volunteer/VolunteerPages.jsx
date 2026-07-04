import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { programService } from '../../services/programService'
import { certificateService } from '../../services/dashboardService'
import { formatDate } from '../../utils'

/* Same tokens as HomePage / Navbar / Login / Register / VolunteerDashboard */
const ink = '#141310'
const inkSoft = '#6B685F'
const amber = '#E8A33D'
const moss = '#5C7A5E'
const rust = '#B4551F'

const cardClass = 'rounded-2xl bg-white/70 backdrop-blur-md border shadow-sm'
const cardBorder = { borderColor: 'rgba(20,19,16,0.08)' }

const fontImport = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
  `}</style>
)

function Spinner() {
  return (
    <div
      className="w-8 h-8 rounded-full border-2 animate-spin"
      style={{ borderColor: 'rgba(20,19,16,0.12)', borderTopColor: amber }}
    />
  )
}

function StatusBadge({ status }) {
  const map = {
    approved: { bg: 'rgba(92,122,94,0.14)', color: moss },
    completed: { bg: 'rgba(92,122,94,0.14)', color: moss },
    pending: { bg: 'rgba(232,163,61,0.16)', color: '#B5791F' },
    rejected: { bg: 'rgba(180,85,31,0.13)', color: rust },
    cancelled: { bg: 'rgba(180,85,31,0.13)', color: rust },
  }
  const s = map[status] || { bg: 'rgba(20,19,16,0.07)', color: inkSoft }
  return (
    <span
      className="text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  )
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div className={`${cardClass} p-12 text-center`} style={cardBorder}>
      <div className="text-3xl mb-4">{icon}</div>
      <p className="text-base font-bold mb-1.5" style={{ color: ink }}>{title}</p>
      <p className="text-sm mb-5" style={{ color: inkSoft }}>{description}</p>
      {action}
    </div>
  )
}

export function MyParticipationsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    programService.myParticipations()
      .then(({ data }) => setItems(data.results || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout title="My Programs">
      <div className="font-brand" style={{ color: ink }}>
        {fontImport}

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: amber }}>History</p>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: ink }}>My Programs</h1>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : items.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No programs yet"
            description="Join a volunteer program to see it here."
            action={<Link to="/programs" className="text-sm font-semibold" style={{ color: amber }}>Browse Programs →</Link>}
          />
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`${cardClass} p-5 flex flex-col sm:flex-row sm:items-center gap-4`}
                style={cardBorder}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-1">
                    <p className="text-sm font-semibold" style={{ color: ink }}>{item.program_title}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs" style={{ color: inkSoft }}>
                    <span>Joined {formatDate(item.joined_at)}</span>
                    {item.left_at && <span>Left {formatDate(item.left_at)}</span>}
                    {item.waitlist_position && (
                      <span className="font-semibold" style={{ color: '#B5791F' }}>
                        Waitlist #{item.waitlist_position}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  to={`/programs/${item.program}`}
                  className="text-xs font-semibold transition-colors flex-shrink-0"
                  style={{ color: amber }}
                >
                  View program →
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export function MyCertificatesPage() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    certificateService.mine()
      .then(({ data }) => setCerts(data.results || []))
      .finally(() => setLoading(false))
  }, [])

  const handleDownload = async (cert) => {
    try {
      const res = await certificateService.download(cert.id)
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cert.certificate_number}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Could not download certificate.')
    }
  }

  return (
    <DashboardLayout title="Certificates">
      <div className="font-brand" style={{ color: ink }}>
        {fontImport}

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: amber }}>Achievements</p>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: ink }}>My Certificates</h1>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : certs.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="No certificates yet"
            description="Complete programs to earn certificates."
            action={<Link to="/programs" className="text-sm font-semibold" style={{ color: amber }}>Browse Programs →</Link>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {certs.map((cert, i) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4 }}
                className={`${cardClass} rounded-3xl p-6 flex flex-col`}
                style={cardBorder}
              >
                {/* Certificate visual */}
                <div
                  className="rounded-2xl border p-6 mb-5 text-center"
                  style={{ background: 'rgba(232,163,61,0.06)', borderColor: 'rgba(232,163,61,0.20)' }}
                >
                  <div className="text-3xl mb-3">🏆</div>
                  <p className="text-xs uppercase tracking-wider mb-1 font-semibold" style={{ color: amber }}>
                    Certificate of Participation
                  </p>
                  <p className="text-lg font-bold mb-1" style={{ color: ink }}>{cert.program_title}</p>
                  <p className="text-xs" style={{ color: inkSoft }}>{cert.ngo_name}</p>
                </div>

                <div className="flex-1">
                  <p className="text-xs mb-1" style={{ color: inkSoft }}>Certificate No.</p>
                  <p className="text-sm font-mono font-semibold mb-3" style={{ color: amber }}>{cert.certificate_number}</p>
                  <p className="text-xs" style={{ color: inkSoft }}>Issued {formatDate(cert.issued_at)}</p>
                </div>

                <button
                  onClick={() => handleDownload(cert)}
                  className="mt-5 w-full text-center text-sm rounded-full py-2.5 border font-semibold transition-all"
                  style={{
                    borderColor: 'rgba(232,163,61,0.35)',
                    background: 'rgba(232,163,61,0.08)',
                    color: '#B5791F',
                  }}
                >
                  Download PDF
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

/* NOTE — what changed and why
   - Same treatment as VolunteerDashboard: both pages were still on the old
     dark theme (bg-card, text-white, text-primary, bg-bg). Rebuilt every
     surface to the light warm-linen theme — white/70 glass cards, ink/
     inkSoft text, amber accents.
   - Swapped the shared `Badge`, `Spinner`, `EmptyState` imports for local
     versions, same reasoning as the other pages: those shared components
     likely still carry dark-theme styling internally, so importing them
     here would silently drop dark elements back into an otherwise light
     page. `StatusBadge`/`Spinner`/`EmptyState` are now defined once at the
     top of this file and shared by both exported pages.
   - The waitlist position, previously `text-yellow-400` (a bright, saturated
     yellow that wouldn't have matched anything else on the page), now uses
     the same muted "pending" amber tone (`#B5791F`) as the status badge.
   - Certificate card's inner "visual" panel, previously `bg-bg` (a dark
     surface-on-surface panel), is now a very faint amber-tinted card
     (6% amber fill, 20% amber border) so the certificate still reads as a
     distinct panel without reintroducing a dark block.
   - Font import + `font-brand` class added to both, matching every other
     page.
   - Still open: `DashboardLayout` and the real `Badge`/`Spinner`/
     `EmptyState` components in `components/ui/index` — if those still ship
     dark-theme styling, it's worth retheming them centrally once rather
     than continuing to shadow them per-page. Send them over whenever you're
     ready and I'll fold it into one pass.
*/
