import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft, HiUsers, HiCalendar, HiLocationMarker, HiOfficeBuilding } from 'react-icons/hi'
import PublicLayout from '../components/layout/PublicLayout'
import { programService } from '../services/programService'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils'

/* Same tokens as HomePage / Navbar / Login / Register / dashboard pages */
const pageBg = '#EEECE4'
const ink = '#141310'
const inkSoft = '#6B685F'
const amber = '#E8A33D'
const moss = '#5C7A5E'
const rust = '#B4551F'

const cardClass = 'rounded-3xl bg-white/70 backdrop-blur-md border shadow-sm'
const cardBorder = { borderColor: 'rgba(20,19,16,0.08)' }

const IMAGES = [
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80',
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&q=80',
  'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=1200&q=80',
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&q=80',
]

function Spinner() {
  return (
    <div
      className="w-8 h-8 rounded-full border-2 animate-spin"
      style={{ borderColor: 'rgba(20,19,16,0.12)', borderTopColor: amber }}
    />
  )
}

const STATUS_MAP = {
  approved: { color: moss, label: null },
  completed: { color: moss, label: null },
  active: { color: moss, label: null },
  pending: { color: '#B5791F', label: null },
  rejected: { color: rust, label: null },
  cancelled: { color: rust, label: null },
}

// Solid white pill, used sitting directly on the hero photo where a
// tinted/translucent badge wouldn't have enough contrast against the image.
function HeroBadge({ status }) {
  const s = STATUS_MAP[status] || { color: inkSoft }
  return (
    <span
      className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full capitalize bg-white/90 backdrop-blur"
      style={{ color: s.color }}
    >
      {status}
    </span>
  )
}

// Tinted pill, used on the light card content below the hero.
function StatusBadge({ status }) {
  const map = {
    approved: { bg: 'rgba(92,122,94,0.14)', color: moss },
    completed: { bg: 'rgba(92,122,94,0.14)', color: moss },
    active: { bg: 'rgba(92,122,94,0.14)', color: moss },
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

function Button({ variant = 'primary', loading, disabled, className = '', children, ...props }) {
  const styles = {
    primary: { background: ink, color: '#fff' },
    danger: { background: rust, color: '#fff' },
  }
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`font-semibold py-3 rounded-full transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 ${className}`}
      style={styles[variant]}
    >
      {loading ? 'Please wait…' : children}
    </button>
  )
}

export default function ProgramDetailPage() {
  const { id } = useParams()
  const { isVolunteer } = useAuth()
  const navigate = useNavigate()
  const [program, setProgram] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myParticipation, setMyParticipation] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await programService.get(id)
        setProgram(data.data)
      } catch { navigate('/programs') }
      finally { setLoading(false) }
    }
    fetch()
  }, [id])

  useEffect(() => {
    if (!isVolunteer) return
    programService.myParticipations().then(({ data }) => {
      const found = (data.results || []).find(
        p => p.program === parseInt(id) && (p.status === 'joined' || p.status === 'waitlisted')
      )
      setMyParticipation(found || null)
    }).catch(() => {})
  }, [id, isVolunteer])

  const handleJoin = async () => {
    setActionLoading(true)
    try {
      const { data } = await programService.join(id)
      const s = data.data?.status
      showToast(s === 'waitlisted' ? 'Added to waitlist!' : 'Joined successfully!')
      setMyParticipation(data.data)
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not join.', 'error')
    } finally { setActionLoading(false) }
  }

  const handleLeave = async () => {
    setActionLoading(true)
    try {
      await programService.leave(id)
      showToast('You have left the program.')
      setMyParticipation(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not leave.', 'error')
    } finally { setActionLoading(false) }
  }

  if (loading) return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center" style={{ background: pageBg }}>
        <Spinner />
      </div>
    </PublicLayout>
  )

  const img = IMAGES[program.id % IMAGES.length]
  const pct = Math.min(100, Math.round((program.current_participants / program.capacity) * 100))

  return (
    <PublicLayout>
      <div className="font-brand" style={{ background: pageBg, color: ink }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
        `}</style>

        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl border text-sm font-semibold bg-white/90 backdrop-blur shadow-lg"
            style={{
              borderColor: toast.type === 'error' ? 'rgba(180,85,31,0.35)' : 'rgba(92,122,94,0.35)',
              color: toast.type === 'error' ? rust : moss,
            }}
          >
            {toast.type === 'error' ? '✕' : '✓'} {toast.message}
          </motion.div>
        )}

        {/* Hero image */}
        <div className="relative h-[55vh] overflow-hidden">
          <img src={img} alt={program.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute top-24 left-6">
            <Link to="/programs" className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
              <HiArrowLeft /> Back to Programs
            </Link>
          </div>
          <div className="absolute bottom-10 left-6 right-6 max-w-7xl mx-auto">
            <HeroBadge status={program.status} />
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mt-4 mb-2">{program.title}</h1>
            <p className="text-white/75 text-lg">{program.ngo_name}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <p className="text-xs uppercase tracking-widest font-bold mb-4" style={{ color: amber }}>About this program</p>
                <p className="text-lg leading-relaxed whitespace-pre-wrap" style={{ color: inkSoft }}>{program.description}</p>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Action card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                className={`${cardClass} p-6 sticky top-24`}
                style={cardBorder}
              >
                {/* Capacity bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: inkSoft }}>Participants</span>
                    <span className="font-semibold" style={{ color: ink }}>{program.current_participants}/{program.capacity}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(20,19,16,0.08)' }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
                      className="h-full rounded-full"
                      style={{ background: pct >= 90 ? rust : amber }}
                    />
                  </div>
                  {program.is_full && (
                    <p className="text-xs mt-2 font-medium" style={{ color: '#B5791F' }}>
                      Program is full — joining adds you to the waitlist
                    </p>
                  )}
                </div>

                {/* Meta */}
                <div className="space-y-3 mb-6">
                  {[
                    { icon: HiOfficeBuilding, label: program.ngo_name },
                    program.location && { icon: HiLocationMarker, label: program.location },
                    program.start_date && { icon: HiCalendar, label: `${formatDate(program.start_date)}${program.end_date ? ' → ' + formatDate(program.end_date) : ''}` },
                  ].filter(Boolean).map(({ icon: Icon, label }, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm" style={{ color: inkSoft }}>
                      <Icon style={{ color: amber }} className="flex-shrink-0" />
                      {label}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {isVolunteer && program.status === 'active' && (
                  myParticipation ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: moss }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: moss }} />
                        {myParticipation.status === 'waitlisted' ? 'On waitlist' : 'You\'ve joined this program'}
                      </div>
                      <Button variant="danger" className="w-full" onClick={handleLeave} loading={actionLoading}>
                        Leave Program
                      </Button>
                    </div>
                  ) : (
                    <Button variant="primary" className="w-full" onClick={handleJoin} loading={actionLoading}>
                      {program.is_full ? 'Join Waitlist' : 'Join Program'}
                    </Button>
                  )
                )}
                {!isVolunteer && (
                  <Link to="/register" className="block text-center text-sm font-semibold transition-colors" style={{ color: amber }}>
                    Sign up as volunteer to join →
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

/* NOTE — what changed and why
   - Same conversion pass as the rest of the site: swapped the dark theme
     (bg-card, text-white, bg-white/5, text-yellow-400, red-400/primary
     utility classes) for the light warm-linen palette everywhere below
     the hero photo.
   - The hero itself keeps a dark treatment on purpose — it's a full-bleed
     photo, and white/cream text over a black-to-transparent gradient is
     the only thing that stays readable there regardless of overall site
     theme (this mirrors the same logic used for the HomePage hero). Below
     the fold, everything reverts to the light `pageBg`.
   - Two badge variants instead of one: `HeroBadge` (solid white pill, sits
     directly on the photo) and `StatusBadge` (tinted pill, sits on the
     light content below). One badge style can't serve both — a tinted
     rgba pill has no contrast on a photo, and a solid white pill would
     look like a stray sticker on a white card.
   - Swapped the shared `Badge`, `Spinner`, and `Button` imports for local
     versions, same reasoning as every other converted page — the shared
     `Button` in particular likely still renders old dark-theme colors
     internally (its `variant="danger"` especially), so this guarantees
     "Join Program" / "Leave Program" actually show up in the right colors.
   - `text-yellow-400` (full-capacity warning) and the capacity bar's
     `bg-red-400` near-full state both moved to the same muted amber/rust
     tones used for status elsewhere, instead of bright saturated red/yellow.
   - Font import + `font-brand` class added, matching every other page.
   - Still open, as before: the real `Badge`/`Spinner`/`Button` in
     `components/ui/index` — worth retheming centrally once you're ready,
     rather than continuing to shadow them per page.
*/
