import { motion } from 'framer-motion'

export function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all rounded-none border border-black disabled:opacity-50 disabled:cursor-not-allowed text-xs font-brand'
  const sizes = { sm: 'px-4 py-2', md: 'px-6 py-3.5', lg: 'px-8 py-4' }
  const variants = {
    primary: 'bg-black text-white hover:bg-white hover:text-black border-black',
    outline: 'bg-white text-black border-black hover:bg-black hover:text-white',
    ghost: 'bg-transparent text-black border-transparent hover:bg-gray-100',
    danger: 'bg-red-600 text-white border-red-600 hover:bg-white hover:text-red-600',
  }
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
}
