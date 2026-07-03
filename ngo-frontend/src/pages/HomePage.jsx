import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { HiArrowRight, HiChevronDown } from 'react-icons/hi'
import { FaQuoteLeft } from 'react-icons/fa'
import PublicLayout from '../components/layout/PublicLayout'
import { fadeUp, staggerContainer, fadeLeft, fadeRight } from '../utils/motion'

const stats = [
  { value: '2,400+', label: 'Volunteers Placed' },
  { value: '180+', label: 'NGO Partners' },
  { value: '640+', label: 'Programs Completed' },
  { value: '38', label: 'Cities Reached' },
]

const features = [
  {
    n: '01',
    title: 'Verified NGOs',
    desc: 'Every organization on our platform is reviewed and approved by our team before listing programs.',
  },
  {
    n: '02',
    title: 'Smart Matching',
    desc: 'Find programs aligned with your skills, location, and availability in seconds.',
  },
  {
    n: '03',
    title: 'Waitlist System',
    desc: 'Never miss a spot — our automatic FIFO waitlist promotes you the moment a slot opens.',
  },
  {
    n: '04',
    title: 'Certificates',
    desc: 'Receive a verified digital certificate for every program you complete.',
  },
]

const testimonials = [
  {
    quote: 'Volunect gave our small NGO a professional platform to manage hundreds of volunteers. The approval system builds trust instantly.',
    name: 'Priya Sharma',
    role: 'Director, Green Earth Foundation',
    initials: 'PS',
  },
  {
    quote: 'I joined three programs through Volunect. The waitlist feature is brilliant — I got in even when the first slot was full.',
    name: 'Rahul Mehta',
    role: 'Volunteer',
    initials: 'RM',
  },
  {
    quote: 'The analytics dashboard gives us real clarity on impact. We can see exactly how many volunteers participated in each program.',
    name: 'Anita Desai',
    role: 'NGO Manager, Care India',
    initials: 'AD',
  },
]

const programs = [
  { id: 1, title: 'Coastal Cleanup Drive', ngo: 'Blue Ocean NGO', location: 'Mumbai', img: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=700&q=80', tag: 'Environment' },
  { id: 2, title: 'Teach for Tomorrow', ngo: 'Bright Minds Foundation', location: 'Delhi', img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=700&q=80', tag: 'Education' },
  { id: 3, title: 'Food for All', ngo: 'Hunger Free India', location: 'Bangalore', img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=700&q=80', tag: 'Community' },
]

function ScrollReveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function HomePage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <PublicLayout>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax image */}
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1800&q=80"
            alt="Volunteers"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/70 to-bg" />
        </motion.div>

        {/* Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center max-w-5xl mx-auto px-6 pt-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 rounded-full px-4 py-2 mb-8"
          >
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-primary text-xs tracking-widest uppercase">Now live — 180+ NGOs onboard</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-7xl lg:text-8xl font-light leading-[0.95] tracking-tight text-white mb-8"
          >
            Where Purpose<br />
            <span className="text-gradient italic">Meets Action</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-text-secondary text-xl max-w-xl mx-auto leading-relaxed mb-12"
          >
            Connecting passionate volunteers with verified NGOs across India. Find your cause, join a program, make a difference.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="group flex items-center gap-2 bg-primary text-bg font-medium px-8 py-4 rounded-full hover:bg-primary-hover transition-all text-sm"
            >
              Start Volunteering
              <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/programs"
              className="flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full hover:border-white/40 hover:bg-white/5 transition-all text-sm"
            >
              Browse Programs
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-text-secondary"
        >
          <HiChevronDown size={24} />
        </motion.div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
      <div className="border-y border-subtle py-5 overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-12">
              {['Education', 'Environment', 'Healthcare', 'Food Security', 'Women Empowerment', 'Child Welfare', 'Elder Care', 'Animal Welfare'].map((t) => (
                <span key={t} className="text-text-secondary text-sm tracking-widest uppercase flex items-center gap-4">
                  <span className="text-primary">✦</span> {t}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── MISSION ──────────────────────────────────────────────────────── */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-widest2 text-primary mb-6">Our Mission</p>
            <h2 className="text-5xl md:text-6xl font-light leading-tight text-white mb-8">
              Bridging the gap between<br />
              <span className="italic text-gradient">goodwill and action</span>
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed mb-8 max-w-xl">
              Millions want to volunteer but don't know where to start. Thousands of NGOs need help but struggle to find reliable volunteers. Volunect is the bridge.
            </p>
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors"
            >
              Join the movement
              <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=800&q=80"
                  alt="Volunteers working"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/60 to-transparent" />
              </div>
              {/* Floating card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 -left-6 bg-card border border-subtle rounded-2xl p-5 glow-sm"
              >
                <p className="text-3xl font-light text-white mb-1">2,400<span className="text-primary">+</span></p>
                <p className="text-xs text-text-secondary uppercase tracking-wider">Lives Impacted</p>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="border-y border-subtle py-24 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-subtle"
          >
            {stats.map(({ value, label }, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-bg-secondary p-12 text-center">
                <p className="text-5xl md:text-6xl font-light text-white mb-3">{value}</p>
                <p className="text-sm text-text-secondary uppercase tracking-widest">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PROGRAMS ─────────────────────────────────────────────────────── */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <p className="text-xs uppercase tracking-widest2 text-primary mb-4">Featured Programs</p>
              <h2 className="text-5xl font-light text-white leading-tight">
                Programs making<br />a real difference
              </h2>
            </div>
            <Link
              to="/programs"
              className="group inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors flex-shrink-0"
            >
              View all programs
              <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {programs.map((p, i) => (
            <ScrollReveal key={p.id} delay={i * 0.1}>
              <Link to={`/programs/${p.id}`} className="group block">
                <div className="rounded-3xl overflow-hidden aspect-[4/3] mb-5 relative">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-bg/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="text-xs border border-primary/30 bg-primary/10 text-primary px-3 py-1 rounded-full">{p.tag}</span>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-xl font-medium text-white mb-1">{p.title}</h3>
                    <p className="text-text-secondary text-sm">{p.ngo} · {p.location}</p>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-32 bg-bg-secondary border-y border-subtle">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="text-xs uppercase tracking-widest2 text-primary mb-4">How it works</p>
              <h2 className="text-5xl font-light text-white">Everything you need</h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="bg-card border border-subtle rounded-3xl p-8 group"
                >
                  <p className="text-6xl font-light text-white/5 group-hover:text-primary/10 transition-colors mb-6 select-none">
                    {f.n}
                  </p>
                  <h3 className="text-lg font-medium text-white mb-3">{f.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPLIT SECTION ────────────────────────────────────────────────── */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <ScrollReveal>
            <div className="rounded-3xl overflow-hidden aspect-[3/2]">
              <img
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=900&q=80"
                alt="Community cleanup"
                className="w-full h-full object-cover"
              />
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="text-xs uppercase tracking-widest2 text-primary mb-6">For NGOs</p>
            <h2 className="text-4xl md:text-5xl font-light text-white leading-tight mb-6">
              Grow your volunteer base with zero friction
            </h2>
            <p className="text-text-secondary leading-relaxed mb-8">
              Create programs, manage participants, track impact with analytics, issue certificates — all in one elegant dashboard. Get approved in 24 hours.
            </p>
            <div className="space-y-4 mb-10">
              {['Admin approval ensures only legitimate NGOs', 'Real-time participant tracking', 'Automated waitlist management', 'PDF certificate generation'].map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm text-text-secondary">
                  <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs flex-shrink-0">✓</span>
                  {f}
                </div>
              ))}
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-primary text-bg font-medium px-7 py-3.5 rounded-full hover:bg-primary-hover transition-all text-sm"
            >
              Register your NGO
              <HiArrowRight />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-32 bg-bg-secondary border-y border-subtle overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-widest2 text-primary mb-4">Testimonials</p>
              <h2 className="text-5xl font-light text-white">What people say</h2>
            </div>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <FaQuoteLeft className="text-primary/30 text-4xl mx-auto mb-8" />
                <p className="text-2xl md:text-3xl font-light text-white leading-relaxed mb-10">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary font-medium">
                    {testimonials[activeTestimonial].initials}
                  </div>
                  <p className="text-white font-medium">{testimonials[activeTestimonial].name}</p>
                  <p className="text-text-secondary text-sm">{testimonials[activeTestimonial].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-12">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`rounded-full transition-all ${i === activeTestimonial ? 'w-8 h-2 bg-primary' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────────────────── */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="relative rounded-3xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80"
              alt="Community"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-bg/85" />
            <div className="relative z-10 text-center py-24 px-8">
              <p className="text-xs uppercase tracking-widest2 text-primary mb-6">Get Started Today</p>
              <h2 className="text-5xl md:text-6xl font-light text-white mb-6 leading-tight">
                Ready to make<br />
                <span className="italic text-gradient">a difference?</span>
              </h2>
              <p className="text-text-secondary text-lg max-w-lg mx-auto mb-12">
                Join thousands of volunteers and hundreds of NGOs already using Volunect to create real impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-bg font-medium px-8 py-4 rounded-full hover:bg-primary-hover transition-all text-sm"
                >
                  Join as Volunteer <HiArrowRight />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center border border-white/20 text-white px-8 py-4 rounded-full hover:border-white/40 hover:bg-white/5 transition-all text-sm"
                >
                  Register your NGO
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── CONTACT / NEWSLETTER ─────────────────────────────────────────── */}
      <section id="contact" className="py-32 border-t border-subtle bg-bg-secondary">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-widest2 text-primary mb-4">Stay Updated</p>
            <h2 className="text-5xl font-light text-white mb-4">Get in touch</h2>
            <p className="text-text-secondary mb-12">Have questions? We'd love to hear from you. Send us a message and we'll get back within 24 hours.</p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="bg-card border border-subtle rounded-xl px-5 py-4 text-white placeholder-text-secondary/50 focus:outline-none focus:border-primary/40 text-sm w-full"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="bg-card border border-subtle rounded-xl px-5 py-4 text-white placeholder-text-secondary/50 focus:outline-none focus:border-primary/40 text-sm w-full"
                />
              </div>
              <textarea
                rows={4}
                placeholder="Your message..."
                className="w-full bg-card border border-subtle rounded-xl px-5 py-4 text-white placeholder-text-secondary/50 focus:outline-none focus:border-primary/40 text-sm resize-none"
              />
              <button
                type="submit"
                className="w-full bg-primary text-bg font-medium py-4 rounded-full hover:bg-primary-hover transition-all text-sm"
              >
                Send Message
              </button>
            </form>
          </ScrollReveal>
        </div>
      </section>
    </PublicLayout>
  )
}
