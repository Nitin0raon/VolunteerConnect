import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiUsers, HiCalendar, HiLocationMarker } from 'react-icons/hi'
import { Badge } from './index'
import { truncate, formatDate } from '../../utils'
import { cardHover } from '../../utils/motion'

const PROGRAM_IMAGES = [
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80',
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80',
  'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=600&q=80',
  'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
]

function getProgramImage(id) {
  return PROGRAM_IMAGES[id % PROGRAM_IMAGES.length]
}

export default function ProgramCard({ program, onJoin, onLeave, myParticipation, loading }) {
  const isFull = program.current_participants >= program.capacity
  const pct = Math.min(100, Math.round((program.current_participants / program.capacity) * 100))

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      className="bg-card border border-subtle rounded-3xl overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={getProgramImage(program.id)}
          alt={program.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <Badge status={program.status} />
        </div>
        <div className="absolute top-4 right-4 bg-bg/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-text-secondary">
          {program.ngo_name}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-white mb-2 leading-snug">{program.title}</h3>
        <p className="text-sm text-text-secondary mb-5 leading-relaxed">
          {truncate(program.description, 100)}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 mb-5">
          <span className="flex items-center gap-1.5 text-xs text-text-secondary">
            <HiUsers className="text-primary" />
            {program.current_participants}/{program.capacity}
          </span>
          {program.location && (
            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              <HiLocationMarker className="text-primary" />
              {program.location}
            </span>
          )}
          {program.start_date && (
            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              <HiCalendar className="text-primary" />
              {formatDate(program.start_date)}
            </span>
          )}
        </div>

        {/* Capacity bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-text-secondary mb-1.5">
            <span>Capacity</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${pct >= 90 ? 'bg-red-400' : 'bg-primary'}`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/programs/${program.id}`}
            className="flex-1 text-center text-sm border border-subtle rounded-full py-2.5 text-text-secondary hover:text-white hover:border-white/20 transition-all"
          >
            View Details
          </Link>
          {myParticipation ? (
            <button
              onClick={() => onLeave(program.id)}
              disabled={loading}
              className="flex-1 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-full py-2.5 hover:bg-red-500/20 transition-all disabled:opacity-50"
            >
              Leave
            </button>
          ) : program.status === 'active' ? (
            <button
              onClick={() => onJoin(program.id)}
              disabled={loading}
              className="flex-1 text-sm bg-primary text-bg rounded-full py-2.5 hover:bg-primary-hover transition-all disabled:opacity-50"
            >
              {isFull ? 'Join Waitlist' : 'Join'}
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
