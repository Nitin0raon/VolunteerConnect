import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowLeft, HiUsers, HiCalendar, HiLocationMarker, HiOfficeBuilding } from 'react-icons/hi'
import PublicLayout from '../components/layout/PublicLayout'
import { Badge, Spinner } from '../components/ui/index'
import { Button } from '../components/ui/Button'
import { programService } from '../services/programService'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils'

const IMAGES = [
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80',
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&q=80',
  'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=1200&q=80',
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&q=80',
]

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
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    </PublicLayout>
  )

  const img = IMAGES[program.id % IMAGES.length]
  const pct = Math.min(100, Math.round((program.current_participants / program.capacity) * 100))

  return (
    <PublicLayout>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl border text-sm font-medium ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-primary/10 border-primary/30 text-primary'}`}
        >
          {toast.type === 'error' ? '✕' : '✓'} {toast.message}
        </motion.div>
      )}

      {/* Hero image */}
      <div className="relative h-[55vh] overflow-hidden">
        <img src={img} alt={program.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
        <div className="absolute top-24 left-6">
          <Link to="/programs" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
            <HiArrowLeft /> Back to Programs
          </Link>
        </div>
        <div className="absolute bottom-10 left-6 right-6 max-w-7xl mx-auto">
          <Badge status={program.status} />
          <h1 className="text-4xl md:text-6xl font-light text-white mt-4 mb-2">{program.title}</h1>
          <p className="text-text-secondary text-lg">{program.ngo_name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-xs uppercase tracking-widest2 text-primary mb-4">About this program</p>
              <p className="text-text-secondary text-lg leading-relaxed whitespace-pre-wrap">{program.description}</p>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Action card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card border border-subtle rounded-3xl p-6 sticky top-24">
              {/* Capacity bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-secondary">Participants</span>
                  <span className="text-white font-medium">{program.current_participants}/{program.capacity}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
                    className={`h-full rounded-full ${pct >= 90 ? 'bg-red-400' : 'bg-primary'}`}
                  />
                </div>
                {program.is_full && (
                  <p className="text-xs text-yellow-400 mt-2">Program is full — joining adds you to the waitlist</p>
                )}
              </div>

              {/* Meta */}
              <div className="space-y-3 mb-6">
                {[
                  { icon: HiOfficeBuilding, label: program.ngo_name },
                  program.location && { icon: HiLocationMarker, label: program.location },
                  program.start_date && { icon: HiCalendar, label: `${formatDate(program.start_date)}${program.end_date ? ' → ' + formatDate(program.end_date) : ''}` },
                ].filter(Boolean).map(({ icon: Icon, label }, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-text-secondary">
                    <Icon className="text-primary flex-shrink-0" />
                    {label}
                  </div>
                ))}
              </div>

              {/* CTA */}
              {isVolunteer && program.status === 'active' && (
                myParticipation ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      {myParticipation.status === 'waitlisted' ? 'On waitlist' : 'You\'ve joined this program'}
                    </div>
                    <Button variant="danger" className="w-full" onClick={handleLeave} loading={actionLoading}>
                      Leave Program
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full" onClick={handleJoin} loading={actionLoading}>
                    {program.is_full ? 'Join Waitlist' : 'Join Program'}
                  </Button>
                )
              )}
              {!isVolunteer && (
                <Link to="/register" className="block text-center text-sm text-primary hover:text-primary-hover transition-colors">
                  Sign up as volunteer to join →
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
