import { motion } from 'framer-motion'
import { getStatusColor } from '../../utils'

export function SectionHeader({ eyebrow, title, subtitle, center = false, light = false }) {
  return (
    <div className={center ? 'text-center' : ''}>
      {eyebrow && (
        <p className="text-xs uppercase tracking-widest2 text-primary mb-4">{eyebrow}</p>
      )}
      <h2 className={`text-4xl md:text-5xl font-light leading-tight mb-4 ${light ? 'text-white' : 'text-white'}`}>
        {title}
      </h2>
      {subtitle && <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">{subtitle}</p>}
    </div>
  )
}

export function Badge({ status, children }) {
  const label = children || status
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="bg-card border border-subtle rounded-3xl p-6 space-y-4">
      <Skeleton className="h-48 w-full rounded-2xl" />
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 bg-card border border-subtle rounded-3xl flex items-center justify-center mb-6 text-text-secondary text-3xl">
        {icon || '✦'}
      </div>
      <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
      <p className="text-text-secondary text-sm max-w-xs mb-8">{description}</p>
      {action}
    </motion.div>
  )
}

export function Spinner({ size = 'md' }) {
  const s = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size]
  return (
    <div className="flex items-center justify-center">
      <svg className={`animate-spin ${s} text-primary`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs text-text-secondary uppercase tracking-wider">{label}</label>}
      <input
        className={`w-full bg-bg-secondary border border-subtle rounded-xl px-4 py-3 text-white placeholder-text-secondary/50 focus:outline-none focus:border-primary/50 transition-colors text-sm ${error ? 'border-red-500/50' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs text-text-secondary uppercase tracking-wider">{label}</label>}
      <textarea
        rows={4}
        className={`w-full bg-bg-secondary border border-subtle rounded-xl px-4 py-3 text-white placeholder-text-secondary/50 focus:outline-none focus:border-primary/50 transition-colors text-sm resize-none ${error ? 'border-red-500/50' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs text-text-secondary uppercase tracking-wider">{label}</label>}
      <select
        className={`w-full bg-bg-secondary border border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors text-sm appearance-none ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

export function StatsCard({ label, value, sub, icon }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-card border border-subtle rounded-3xl p-6"
    >
      {icon && <div className="text-primary text-2xl mb-4">{icon}</div>}
      <p className="text-4xl font-light text-white mb-1">{value}</p>
      <p className="text-sm text-text-secondary">{label}</p>
      {sub && <p className="text-xs text-primary mt-2">{sub}</p>}
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
        className="w-10 h-10 border border-subtle rounded-full text-text-secondary hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
      >
        ←
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`w-10 h-10 rounded-full text-sm transition-all ${
            p === current
              ? 'bg-primary text-bg font-medium'
              : 'border border-subtle text-text-secondary hover:text-white hover:border-white/20'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPage(current + 1)}
        disabled={current === total}
        className="w-10 h-10 border border-subtle rounded-full text-text-secondary hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-card border border-subtle rounded-3xl p-8 max-w-md w-full z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="text-xl font-medium text-white mb-6">{title}</h3>}
        {children}
      </motion.div>
    </motion.div>
  )
}

export function Toast({ message, type = 'success', onClose }) {
  const colors = {
    success: 'bg-primary/10 border-primary/30 text-primary',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-medium ${colors[type]}`}
    >
      {type === 'success' ? '✓' : '✕'}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </motion.div>
  )
}
