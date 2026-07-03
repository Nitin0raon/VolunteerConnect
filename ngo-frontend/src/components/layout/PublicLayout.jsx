import Navbar from './Navbar'
import Footer from './Footer'
import { motion } from 'framer-motion'

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  )
}
