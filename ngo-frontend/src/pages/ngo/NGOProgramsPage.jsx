import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPencil, HiTrash, HiEye, HiPlus } from 'react-icons/hi'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge, Spinner, EmptyState, Modal } from '../../components/ui/index'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/index'
import { programService } from '../../services/programService'
import { formatDate } from '../../utils'

export default function NGOProgramsPage() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await programService.mine()
      setPrograms(data.results || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openEdit = (p) => {
    setEditForm({ title: p.title, description: p.description, capacity: p.capacity, location: p.location || '', status: p.status })
    setEditModal(p)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setEditLoading(true)
    try {
      await programService.update(editModal.id, { ...editForm, capacity: parseInt(editForm.capacity) })
      showToast('Program updated successfully.')
      setEditModal(null)
      await load()
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed.', 'error')
    } finally { setEditLoading(false) }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await programService.delete(deleteModal.id)
      showToast('Program deleted.')
      setDeleteModal(null)
      await load()
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete.', 'error')
    } finally { setDeleteLoading(false) }
  }

  return (
    <DashboardLayout title="My Programs">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-none border text-xs font-black uppercase tracking-widest bg-white ${toast.type === 'error' ? 'border-red-600 text-red-600' : 'border-black text-black'}`}>
            {toast.type === 'error' ? '✕' : '✓'} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-10 text-black">
        <div>
          <p className="text-xs uppercase tracking-widest font-black text-gray-500 mb-2">Management</p>
          <h1 className="text-4xl font-brand font-black uppercase tracking-tighter text-black">My Programs</h1>
        </div>
        <Link to="/ngo/create-program">
          <Button><HiPlus className="mr-1" /> New Program</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : programs.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No programs yet"
          description="Create your first volunteer program to start accepting participants."
          action={<Link to="/ngo/create-program"><Button>Create Program</Button></Link>}
        />
      ) : (
        <div className="space-y-3 font-sans">
          {programs.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-black rounded-none p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-none"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-black">{p.title}</h3>
                  <Badge status={p.status} />
                </div>
                <div className="flex flex-wrap gap-4 text-[10px] uppercase font-bold text-gray-500">
                  <span>{p.current_participants}/{p.capacity} participants</span>
                  {p.location && <span>📍 {p.location}</span>}
                  {p.start_date && <span>📅 {formatDate(p.start_date)}</span>}
                  <span className="text-gray-400">Created {formatDate(p.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to={`/programs/${p.id}`}
                  className="w-9 h-9 border border-black rounded-none flex items-center justify-center text-black hover:bg-black hover:text-white transition-all">
                  <HiEye size={16} />
                </Link>
                <button onClick={() => openEdit(p)}
                  className="w-9 h-9 border border-black rounded-none flex items-center justify-center text-black hover:bg-black hover:text-white transition-all">
                  <HiPencil size={16} />
                </button>
                <button onClick={() => setDeleteModal(p)}
                  className="w-9 h-9 border border-black rounded-none flex items-center justify-center text-black hover:bg-red-600 hover:border-red-600 hover:text-white transition-all">
                  <HiTrash size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Program">
            <form onSubmit={handleEdit} className="space-y-4">
              <Input label="Title" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} />
              <Textarea label="Description" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Capacity" type="number" min="1" value={editForm.capacity} onChange={e => setEditForm(p => ({ ...p, capacity: e.target.value }))} />
                <Input label="Location" value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs text-black font-black uppercase tracking-widest mb-1.5 font-brand">Status</label>
                <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full bg-white border border-black rounded-none px-4 py-3 text-black text-sm focus:outline-none focus:bg-gray-50">
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={editLoading} className="flex-1">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setEditModal(null)}>Cancel</Button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteModal && (
          <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Program">
            <p className="text-black text-xs font-bold uppercase tracking-wider mb-6">
              Are you sure you want to delete <span className="font-black text-black">"{deleteModal.title}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="danger" onClick={handleDelete} loading={deleteLoading} className="flex-1">Delete</Button>
              <Button variant="outline" onClick={() => setDeleteModal(null)}>Cancel</Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
