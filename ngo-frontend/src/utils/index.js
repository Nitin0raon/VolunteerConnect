export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

export const formatRelative = (d) => {
  if (!d) return ''
  const diff = (Date.now() - new Date(d)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export const getStatusColor = (status) => {
  const map = {
    active: 'text-primary border-primary/30 bg-primary/10',
    completed: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    cancelled: 'text-red-400 border-red-400/30 bg-red-400/10',
    pending: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    approved: 'text-primary border-primary/30 bg-primary/10',
    rejected: 'text-red-400 border-red-400/30 bg-red-400/10',
    joined: 'text-primary border-primary/30 bg-primary/10',
    waitlisted: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  }
  return map[status] || 'text-text-secondary border-border bg-card'
}

export const truncate = (str, n = 120) =>
  str && str.length > n ? str.slice(0, n) + '…' : str
