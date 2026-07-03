import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { Badge, Spinner, EmptyState } from '../../components/ui/index'
import { programService } from '../../services/programService'
import { certificateService } from '../../services/dashboardService'
import { formatDate } from '../../utils'

export function MyParticipationsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    programService.myParticipations()
      .then(({ data }) => setItems(data.results || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout title="My Programs">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-xs uppercase tracking-widest2 text-primary mb-3">History</p>
        <h1 className="text-4xl font-light text-white">My Programs</h1>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No programs yet"
          description="Join a volunteer program to see it here."
          action={<Link to="/programs" className="text-sm text-primary hover:text-primary-hover">Browse Programs →</Link>}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-subtle rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-1">
                  <p className="text-sm font-medium text-white">{item.program_title}</p>
                  <Badge status={item.status} />
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
                  <span>Joined {formatDate(item.joined_at)}</span>
                  {item.left_at && <span>Left {formatDate(item.left_at)}</span>}
                  {item.waitlist_position && <span className="text-yellow-400">Waitlist #{item.waitlist_position}</span>}
                </div>
              </div>
              <Link
                to={`/programs/${item.program}`}
                className="text-xs text-primary hover:text-primary-hover transition-colors flex-shrink-0"
              >
                View program →
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}

export function MyCertificatesPage() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    certificateService.mine()
      .then(({ data }) => setCerts(data.results || []))
      .finally(() => setLoading(false))
  }, [])

  const handleDownload = async (cert) => {
    try {
      const res = await certificateService.download(cert.id)
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cert.certificate_number}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Could not download certificate.')
    }
  }

  return (
    <DashboardLayout title="Certificates">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-xs uppercase tracking-widest2 text-primary mb-3">Achievements</p>
        <h1 className="text-4xl font-light text-white">My Certificates</h1>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : certs.length === 0 ? (
        <EmptyState
          icon="🏆"
          title="No certificates yet"
          description="Complete programs to earn certificates."
          action={<Link to="/programs" className="text-sm text-primary">Browse Programs →</Link>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certs.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4 }}
              className="bg-card border border-subtle rounded-3xl p-6 flex flex-col"
            >
              {/* Certificate visual */}
              <div className="bg-bg rounded-2xl border border-primary/10 p-6 mb-5 text-center">
                <div className="text-3xl mb-3">🏆</div>
                <p className="text-xs text-primary uppercase tracking-wider mb-1">Certificate of Participation</p>
                <p className="text-lg font-medium text-white mb-1">{cert.program_title}</p>
                <p className="text-xs text-text-secondary">{cert.ngo_name}</p>
              </div>

              <div className="flex-1">
                <p className="text-xs text-text-secondary mb-1">Certificate No.</p>
                <p className="text-sm font-mono text-primary mb-3">{cert.certificate_number}</p>
                <p className="text-xs text-text-secondary">Issued {formatDate(cert.issued_at)}</p>
              </div>

              <button
                onClick={() => handleDownload(cert)}
                className="mt-5 w-full text-center text-sm border border-primary/30 bg-primary/5 text-primary rounded-full py-2.5 hover:bg-primary/10 transition-all"
              >
                Download PDF
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
