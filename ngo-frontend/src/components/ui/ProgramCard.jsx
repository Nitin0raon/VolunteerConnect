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
      className="bg-white border border-black rounded-none overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden border-b border-black">
        <img
          src={getProgramImage(program.id)}
          alt={program.title}
          className="w-full h-full object-cover img-grayscale transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <Badge status={program.status} />
        </div>
        <div className="absolute top-4 right-4 bg-black px-3 py-1 rounded-none text-[10px] uppercase tracking-wider font-black text-white">
          {program.ngo_name}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-black uppercase tracking-tight text-black mb-2 leading-snug font-brand">{program.title}</h3>
        <p className="text-xs text-gray-500 mb-5 leading-relaxed">
          {truncate(program.description, 100)}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 mb-5 border-t border-b border-black py-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wider">
            👥 {program.current_participants}/{program.capacity}
          </span>
          {program.location && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wider">
              📍 {program.location}
            </span>
          )}
          {program.start_date && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-black uppercase tracking-wider">
              📅 {formatDate(program.start_date)}
            </span>
          )}
        </div>

        {/* Capacity bar */}
        <div className="mb-5">
          <div className="flex justify-between text-[10px] uppercase tracking-wider font-black text-black mb-1.5">
            <span>Capacity</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 bg-gray-100 border border-black rounded-none overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-none bg-black`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/programs/${program.id}`}
            className="flex-1 text-center text-xs font-black uppercase tracking-widest border border-black rounded-none py-3 text-black hover:bg-black hover:text-white transition-all"
          >
            Details
          </Link>
          {myParticipation ? (
            <button
              onClick={() => onLeave(program.id)}
              disabled={loading}
              className="flex-1 text-xs font-black uppercase tracking-widest bg-red-600 border border-red-600 text-white rounded-none py-3 hover:bg-white hover:text-red-600 transition-all disabled:opacity-50"
            >
              Leave
            </button>
          ) : program.status === 'active' ? (
            <button
              onClick={() => onJoin(program.id)}
              disabled={loading}
              className="flex-1 text-xs font-black uppercase tracking-widest bg-black border border-black text-white rounded-none py-3 hover:bg-white hover:text-black transition-all disabled:opacity-50"
            >
              {isFull ? 'Waitlist' : 'Join'}
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
