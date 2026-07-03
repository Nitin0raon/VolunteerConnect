import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiCheck, HiX, HiClock, HiUser } from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Spinner, EmptyState, Badge } from '../../components/ui/index'
import api from '../../services/api'
import { formatRelative, formatDate } from '../../utils'

export default function JoinRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const url = filter === 'pending'
        ? '/participation/requests/pending/'
        : '/participation/requests/all/'
      const { data } = await api.get(url)
      setRequests(data.results || data.data || [])
    } catch {
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [filter])

  const handleReview = async (participationId, action) => {
    setActionLoading(participationId)
    try {
      await api.post(`/participation/requests/${participationId}/review/`, { action })
      showToast(action === 'accept' ? 'Request accepted!' : 'Request rejected.')
      fetchRequests()
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed.', 'error')
    } finally {
      setActionLoading(null) }
  }

  return (
    <DashboardLayout title="Join Requests">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl border text-sm font-medium ${
              toast.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-primary/10 border-primary/30 text-primary'
            }`}
          >
            {toast.type === 'error' ? '✕' : '✓'} {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest2 text-primary mb-3">Volunteers</p>
        <h1 className="text-4xl font-light text-white mb-6">Join Requests</h1>

        {/* Filter tabs */}
        <div className="flex gap-2 p-1 bg-card border border-subtle rounded-xl w-fit">
          {[
            { value: 'pending', label: '⏳ Pending' },
            { value: 'all', label: '📋 All Requests' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === value
                  ? 'bg-primary text-bg'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon="📭"
          title={filter === 'pending' ? 'No pending requests' : 'No requests yet'}
          description={filter === 'pending'
            ? 'When volunteers request to join your programs, they will appear here.'
            : 'No volunteers have requested to join your programs yet.'
          }
        />
      ) : (
        <div className="space-y-3">
          {requests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-subtle rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-5"
            >
              {/* Volunteer info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-11 h-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary font-medium flex-shrink-0">
                  {req.volunteer_name?.charAt(0) || <HiUser />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">{req.volunteer_name}</p>
                  <p className="text-xs text-text-secondary">{req.volunteer_email}</p>
                  {req.message && (
                    <p className="text-xs text-text-secondary/70 mt-1 italic">"{req.message}"</p>
                  )}
                </div>
              </div>

              {/* Program + time */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{req.program_title}</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Requested {formatRelative(req.requested_at)}
                </p>
                {req.reviewed_at && (
                  <p className="text-xs text-text-secondary/60">
                    Reviewed {formatDate(req.reviewed_at)}
                  </p>
                )}
              </div>

              {/* Status + actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge status={req.status} />

                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(req.id, 'accept')}
                      disabled={actionLoading === req.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-all disabled:opacity-50"
                    >
                      <HiCheck size={14} />
                      Accept
                    </button>
                    <button
                      onClick={() => handleReview(req.id, 'reject')}
                      disabled={actionLoading === req.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      <HiX size={14} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}