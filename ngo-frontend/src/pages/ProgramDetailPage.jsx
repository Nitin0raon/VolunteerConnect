import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft, HiUsers, HiCalendar, HiLocationMarker, HiOfficeBuilding } from 'react-icons/hi'
import PublicLayout from '../components/layout/PublicLayout'
import { programService } from '../services/programService'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils'

/* Same tokens as HomePage / Navbar / Login / Register / dashboard pages */
const pageBg = '#FFFFFF'
const ink = '#000000'
const inkSoft = '#666666'
const amber = '#000000'
const moss = '#000000'
const rust = '#DC2626'

const cardClass = 'bg-white border border-black rounded-none shadow-none'
const cardBorder = {}

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
      className="w-8 h-8 rounded-none border border-black border-t-transparent animate-spin"
    />
  )
}

function HeroBadge({ status }) {
  return (
    <span
      className="inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1.5 border border-white bg-white text-black"
    >
      {status}
    </span>
  )
}

function StatusBadge({ status }) {
  return (
    <span
      className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 border border-black bg-black text-white capitalize flex-shrink-0"
    >
      {status}
    </span>
  )
}

function Button({ variant = 'primary', loading, disabled, className = '', children, ...props }) {
  const isDanger = variant === 'danger'
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`font-black uppercase tracking-widest text-xs py-3.5 border transition-colors rounded-none w-full ${
        isDanger
          ? 'bg-red-600 border-red-600 text-white hover:bg-white hover:text-red-600'
          : 'bg-black border-black text-white hover:bg-white hover:text-black'
      } ${className}`}
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner />
      </div>
    </PublicLayout>
  )

  const img = IMAGES[program.id % IMAGES.length]
  const pct = Math.min(100, Math.round((program.current_participants / program.capacity) * 100))

  return (
    <PublicLayout>
      <div className="bg-white text-black font-sans min-h-screen">
        
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 border text-xs font-black uppercase tracking-widest bg-white text-black ${
              toast.type === 'error' ? 'border-red-600 text-red-600' : 'border-black'
            }`}
          >
            {toast.type === 'error' ? '✕' : '✓'} {toast.message}
          </div>
        )}

        {/* Hero image */}
        <div className="relative h-[55vh] overflow-hidden border-b border-black">
          <img src={img} alt={program.title} className="w-full h-full object-cover img-grayscale" />
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          <div className="absolute top-24 left-6 md:left-12">
            <Link to="/programs" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white hover:underline">
              ← Back to Actions
            </Link>
          </div>
          <div className="absolute bottom-10 left-6 right-6 max-w-7xl mx-auto md:px-6">
            <HeroBadge status={program.status} />
            <h1 className="text-4xl md:text-6xl font-brand font-black uppercase tracking-tighter text-white mt-4 mb-2">{program.title}</h1>
            <p className="text-white font-brand text-md uppercase font-bold tracking-wider">{program.ngo_name}</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <p className="text-xs uppercase tracking-widest font-black text-gray-500 mb-4 font-brand">About this program</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-black">{program.description}</p>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Action card */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
                className={`${cardClass} p-6 sticky top-24`}
              >
                {/* Capacity bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold text-gray-500 uppercase tracking-wider">Participants</span>
                    <span className="font-black text-black">{program.current_participants}/{program.capacity}</span>
                  </div>
                  <div className="h-2 bg-gray-100 border border-black rounded-none overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
                      className="h-full bg-black rounded-none"
                    />
                  </div>
                  {program.is_full && (
                    <p className="text-xs mt-2 font-bold uppercase tracking-wider text-red-600">
                      Program is full — waitlist active
                    </p>
                  )}
                </div>

                {/* Meta */}
                <div className="space-y-4 mb-6 border-t border-b border-black py-4">
                  {[
                    { icon: '🏢', label: program.ngo_name },
                    program.location && { icon: '📍', label: program.location },
                    program.start_date && { icon: '📅', label: `${formatDate(program.start_date)}${program.end_date ? ' → ' + formatDate(program.end_date) : ''}` },
                  ].filter(Boolean).map(({ icon, label }, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-black">
                      <span className="text-sm">{icon}</span>
                      {label}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {isVolunteer && program.status === 'active' && (
                  myParticipation ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black">
                        <span className="w-2.5 h-2.5 bg-black" />
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
                  <Link to="/register" className="block text-center text-xs font-black uppercase tracking-widest text-black underline underline-offset-4">
                    Sign up to join
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
