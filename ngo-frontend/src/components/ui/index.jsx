import { motion } from 'framer-motion'
import { getStatusColor } from '../../utils'

export function SectionHeader({ eyebrow, title, subtitle, center = false, light = false }) {
  return (
    <div className={center ? 'text-center' : ''}>
      {eyebrow && (
        <p className="text-xs uppercase tracking-widest font-black text-black mb-4 font-brand">{eyebrow}</p>
      )}
      <h2 className={`text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[1.1] mb-4 font-brand text-black`}>
        {title}
      </h2>
      {subtitle && <p className="text-gray-600 text-sm max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
  )
}

export function Badge({ status, children }) {
  const label = children || status
  const getBadgeColors = (s) => {
    switch (s?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'completed':
        return 'border-black bg-black text-white'
      case 'pending':
      case 'waitlisted':
        return 'border-black bg-gray-100 text-black'
      case 'rejected':
      case 'cancelled':
        return 'border-red-600 bg-red-50 text-red-600'
      default:
        return 'border-black bg-white text-black'
    }
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-none text-[10px] uppercase tracking-wider font-black border ${getBadgeColors(status)}`}>
      {label}
    </span>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded-none ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-black rounded-none p-6 space-y-4">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-black/40 p-8 rounded-none"
    >
      <div className="w-16 h-16 border border-black flex items-center justify-center mb-6 text-black text-2xl bg-white rounded-none">
        {icon || '✦'}
      </div>
      <h3 className="text-lg uppercase font-black tracking-widest text-black mb-2 font-brand">{title}</h3>
      <p className="text-gray-500 text-xs max-w-xs mb-8">{description}</p>
      {action}
    </motion.div>
  )
}

export function Spinner({ size = 'md' }) {
  const s = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size]
  return (
    <div className="flex items-center justify-center">
      <svg className={`animate-spin ${s} text-black`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-xs text-black font-black uppercase tracking-widest font-brand">{label}</label>}
      <input
        className={`w-full bg-white border border-black rounded-none px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:bg-gray-50 transition-colors text-sm ${error ? 'border-red-600' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 uppercase tracking-wider font-semibold">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-xs text-black font-black uppercase tracking-widest font-brand">{label}</label>}
      <textarea
        rows={4}
        className={`w-full bg-white border border-black rounded-none px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:bg-gray-50 transition-colors text-sm resize-none ${error ? 'border-red-600' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 uppercase tracking-wider font-semibold">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-xs text-black font-black uppercase tracking-widest font-brand">{label}</label>}
      <div className="relative">
        <select
          className={`w-full bg-white border border-black rounded-none px-4 py-3 text-black focus:outline-none focus:bg-gray-50 transition-colors text-sm appearance-none ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-black">
          ▼
        </div>
      </div>
      {error && <p className="text-xs text-red-600 uppercase tracking-wider font-semibold">{error}</p>}
    </div>
  )
}

export function StatsCard({ label, value, sub, icon }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white border border-black rounded-none p-6"
    >
      {icon && <div className="text-black text-xl mb-4">{icon}</div>}
      <p className="text-4xl font-black text-black mb-1 font-brand">{value ?? '—'}</p>
      <p className="text-xs uppercase tracking-wider font-bold text-gray-500">{label}</p>
      {sub && <p className="text-xs text-black font-semibold mt-2">{sub}</p>}
    </motion.div>
  )
}

export function Pagination({ current, total, onPage }) {
  if (total <= 1) return null
  const pages = Array.from({ length: total }, (_, i) => i + 1)
  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPage(current - 1)}
        disabled={current === 1}
        className="w-10 h-10 border border-black rounded-none text-black bg-white hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black transition-all text-sm font-black"
      >
        ←
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`w-10 h-10 rounded-none text-sm transition-all font-black border border-black ${
            p === current
              ? 'bg-black text-white'
              : 'bg-white text-black hover:bg-black hover:text-white'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPage(current + 1)}
        disabled={current === total}
        className="w-10 h-10 border border-black rounded-none text-black bg-white hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black transition-all text-sm font-black"
      >
        →
      </button>
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="relative bg-white border border-black rounded-none p-8 max-w-md w-full z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="text-lg font-black uppercase tracking-widest text-black mb-6 font-brand border-b border-black pb-2">{title}</h3>}
        {children}
      </motion.div>
    </motion.div>
  )
}

export function Toast({ message, type = 'success', onClose }) {
  const borderCol = type === 'error' ? 'border-red-600 text-red-600 bg-red-50' : 'border-black text-black bg-white'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-none border text-xs font-black uppercase tracking-widest ${borderCol}`}
    >
      {type === 'success' ? '✓' : '✕'}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-75 font-black">✕</button>
    </motion.div>
  )
}
