import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiCheck, HiX, HiClock, HiUser } from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Spinner, EmptyState, Badge, Pagination } from '../../components/ui/index'
import api from '../../services/api'
import { formatRelative, formatDate } from '../../utils'

export default function JoinRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [toast, setToast] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const url = filter === 'pending'
        ? `/participation/requests/pending/?page=${page}`
        : `/participation/requests/all/?page=${page}`
      const { data } = await api.get(url)
      setRequests(data.results || [])
      setTotalPages(Math.ceil((data.count || 0) / 10))
    } catch {
      setRequests([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [filter])

  useEffect(() => {
    fetchRequests()
  }, [filter, page])

  const handleReview = async (participationId, action) => {
    setActionLoading(participationId)
    try {
      const { data } = await api.post(`/participation/requests/${participationId}/review/`, { action })
      showToast(data.message || (action === 'accept' ? 'Request accepted!' : 'Request rejected.'))
      fetchRequests()
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed.', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <DashboardLayout title="Join Requests">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 border text-xs font-black uppercase tracking-widest bg-white ${
              toast.type === 'error'
                ? 'border-red-600 text-red-600'
                : 'border-black text-black'
            }`}
          >
            {toast.type === 'error' ? '✕' : '✓'} {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-10 text-black">
        <p className="text-xs uppercase tracking-widest font-black text-gray-500 mb-3">Volunteers</p>
        <h1 className="text-4xl font-brand font-black uppercase tracking-tighter text-black mb-6">Join Requests</h1>

        {/* Filter tabs */}
        <div className="flex border border-black rounded-none p-1 bg-white w-fit font-sans">
          {[
            { value: 'pending', label: '⏳ Pending' },
            { value: 'all', label: '📋 All Requests' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-5 py-2 rounded-none text-xs font-black uppercase tracking-widest transition-all ${
                filter === value
                  ? 'bg-black text-white'
                  : 'text-gray-500 hover:text-black'
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
        <div className="space-y-3 font-sans">
          {requests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-black rounded-none p-5 flex flex-col sm:flex-row sm:items-center gap-5 shadow-none"
            >
              {/* Volunteer info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-11 h-11 border border-black bg-black text-white rounded-none flex items-center justify-center font-brand font-black flex-shrink-0">
                  {req.volunteer_name?.charAt(0) || <HiUser />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wider text-black">{req.volunteer_name}</p>
                  <p className="text-[10px] uppercase font-bold text-gray-500">{req.volunteer_email}</p>
                  {req.message && (
                    <p className="text-xs text-gray-600 mt-1.5 italic">"{req.message}"</p>
                  )}
                </div>
              </div>

              {/* Program + time */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-wider truncate text-black">{req.program_title}</p>
                <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">
                  Requested {formatRelative(req.requested_at)}
                </p>
                {req.reviewed_at && (
                  <p className="text-[10px] uppercase font-bold text-gray-400">
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
                      className="flex items-center gap-1.5 px-4 py-2 border border-black bg-black text-white hover:bg-white hover:text-black rounded-none text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      <HiCheck size={14} />
                      Accept
                    </button>
                    <button
                      onClick={() => handleReview(req.id, 'reject')}
                      disabled={actionLoading === req.id}
                      className="flex items-center gap-1.5 px-4 py-2 border border-red-600 bg-red-600 text-white hover:bg-white hover:text-red-600 rounded-none text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      <HiX size={14} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {totalPages > 1 && (
            <Pagination
              current={page}
              total={totalPages}
              onPage={setPage}
            />
          )}
        </div>
      )}
    </DashboardLayout>
  )
}