import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiSearch, HiFilter, HiX } from 'react-icons/hi'
import PublicLayout from '../components/layout/PublicLayout'
import ProgramCard from '../components/ui/ProgramCard'
import { SkeletonCard, EmptyState, Pagination, Badge } from '../components/ui/index'
import { programService } from '../services/programService'
import { useDebounce } from '../hooks/useDebounce'
import { useAuth } from '../context/AuthContext'
import { staggerContainer, fadeUp } from '../utils/motion'
import { AnimatePresence as AP } from 'framer-motion'

const STATUS_OPTIONS = ['', 'active', 'completed', 'cancelled']

export default function ProgramsPage() {
  const { isVolunteer } = useAuth()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [count, setCount] = useState(0)
  const [myParticipations, setMyParticipations] = useState({})
  const [filterOpen, setFilterOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const debouncedSearch = useDebounce(search, 400)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchPrograms = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: 9 }
      if (debouncedSearch) params.search = debouncedSearch
      if (status) params.status = status
      const { data } = await programService.list(params)
      setPrograms(data.results || [])
      setCount(data.count || 0)
      setTotalPages(Math.ceil((data.count || 0) / 9))
    } catch {
      setPrograms([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, status])

  const fetchMyParticipations = useCallback(async () => {
    if (!isVolunteer) return
    try {
      const { data } = await programService.myParticipations()
      const map = {}
      ;(data.results || []).forEach(p => {
        if (p.status === 'joined' || p.status === 'waitlisted') map[p.program] = p
      })
      setMyParticipations(map)
    } catch {}
  }, [isVolunteer])

  useEffect(() => { fetchPrograms() }, [fetchPrograms])
  useEffect(() => { fetchMyParticipations() }, [fetchMyParticipations])
  useEffect(() => { setPage(1) }, [debouncedSearch, status])

  const handleJoin = async (programId) => {
    setActionLoading(programId)
    try {
      const { data } = await programService.join(programId)
      const status = data.data?.status
      showToast(status === 'waitlisted' ? 'Added to waitlist!' : 'Joined successfully!')
      await fetchMyParticipations()
      await fetchPrograms()
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not join program.', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleLeave = async (programId) => {
    setActionLoading(programId)
    try {
      await programService.leave(programId)
      showToast('You have left the program.')
      await fetchMyParticipations()
      await fetchPrograms()
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not leave program.', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative pt-32 pb-20 border-b border-subtle overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=80"
            alt="Programs"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/80 to-bg" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="text-xs uppercase tracking-widest2 text-primary mb-4">Browse Programs</p>
            <h1 className="text-6xl font-light text-white mb-4">Find your cause</h1>
            <p className="text-text-secondary text-lg max-w-xl">
              {count > 0 ? `${count} programs available across India` : 'Discover meaningful volunteer opportunities'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input
              type="text"
              placeholder="Search programs, NGOs, locations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-subtle rounded-full pl-12 pr-4 py-3.5 text-white placeholder-text-secondary/50 focus:outline-none focus:border-primary/40 text-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white">
                <HiX size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 border rounded-full px-5 py-3.5 text-sm transition-all ${filterOpen ? 'border-primary/40 text-primary bg-primary/5' : 'border-subtle text-text-secondary hover:text-white hover:border-white/20'}`}
          >
            <HiFilter size={16} />
            Filters {status && <span className="w-1.5 h-1.5 bg-primary rounded-full" />}
          </button>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-10"
            >
              <div className="bg-card border border-subtle rounded-2xl p-6">
                <p className="text-xs uppercase tracking-widest text-text-secondary mb-4">Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        status === s
                          ? 'bg-primary text-bg font-medium'
                          : 'border border-subtle text-text-secondary hover:text-white hover:border-white/20'
                      }`}
                    >
                      {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-medium ${
                toast.type === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-primary/10 border-primary/30 text-primary'
              }`}
            >
              {toast.type === 'error' ? '✕' : '✓'} {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : programs.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No programs found"
            description={search ? `No results for "${search}". Try a different search.` : 'No programs match your filters.'}
            action={
              <button onClick={() => { setSearch(''); setStatus('') }} className="text-sm text-primary hover:text-primary-hover transition-colors">
                Clear filters
              </button>
            }
          />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {programs.map((program) => (
              <motion.div key={program.id} variants={fadeUp}>
                <ProgramCard
                  program={program}
                  onJoin={isVolunteer ? handleJoin : null}
                  onLeave={isVolunteer ? handleLeave : null}
                  myParticipation={myParticipations[program.id]}
                  loading={actionLoading === program.id}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        <Pagination current={page} total={totalPages} onPage={setPage} />
      </div>
    </PublicLayout>
  )
}
