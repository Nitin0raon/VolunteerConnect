import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowRight } from 'react-icons/hi2'
import PublicLayout from '../components/layout/PublicLayout'

/* ────────────────────────────────────────────────────────────────────────
   VOLUNECT — "framed card" nature style
   Warm off-white page bed, one large rounded hero card with a misty forest
   photo, a floating glass pill nav, bold black sans headline, and a soft
   amber glow standing in for a focal light-source (kept as CSS gradients
   rather than a literal illustration).
   ─────────────────────────────────────────────────────────────────────── */
const pageBg = '#EEECE4'
const ink = '#141310'
const inkSoft = '#6B685F'
const amber = '#E8A33D'

// Hero-only text colors: the new background photo (a dark pine forest with a
// golden sunset light beam) is much moodier/darker than a plain misty
// canopy shot, so the headline/subtext need to sit in cream/white rather
// than the page's near-black ink to stay readable. Scoped to the hero only
// — the rest of the page keeps its original ink/inkSoft on the light page bed.
const heroText = '#D9CDAE'
const heroTextSoft = 'rgba(217, 205, 174, 0.82)'

const stats = [
  { value: '2,400+', label: 'Volunteers placed' },
  { value: '180+', label: 'NGO partners' },
  { value: '38', label: 'Cities reached' },
]

const steps = [
  { n: '01', title: 'Discover', desc: 'Browse verified NGOs by cause, city, and the time you actually have.' },
  { n: '02', title: 'Apply', desc: 'Join a program, or land on the waitlist and get bumped the moment a spot opens.' },
  { n: '03', title: 'Volunteer', desc: 'Show up, do the work, walk away with a certificate that means something.' },
]

const programs = [
  { id: 1, title: 'Coastal Cleanup Drive', ngo: 'Blue Ocean NGO', location: 'Mumbai', img: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=700&q=80' },
  { id: 2, title: 'Teach for Tomorrow', ngo: 'Bright Minds Foundation', location: 'Delhi', img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=700&q=80' },
  { id: 3, title: 'Food for All', ngo: 'Hunger Free India', location: 'Bangalore', img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=700&q=80' },
]

function ScrollReveal({ children, delay = 0, y = 28 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function HomePage() {
  return (
    <PublicLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .font-brand { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div className="font-brand" style={{ background: pageBg, color: ink }}>
        {/* ── FRAMED HERO CARD ─────────────────────────────────────────── */}
        <div className="p-3 md:p-6">
          <section
            className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] min-h-[92vh] flex flex-col shadow-2xl"
          >
            {/* background photo — golden sunbeam breaking through a pine forest */}
            <img
              src="https://images.unsplash.com/photo-1612821394773-23f0a7d33ede?w=1800&q=80&auto=format&fit=crop"
              alt="Sunbeam breaking through a pine forest at golden hour"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/50" />

            {/* hero copy — top padding clears the fixed global Navbar */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-28 md:pt-24 pb-4">
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="font-extrabold leading-[1.05] tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl"
                style={{ color: heroText }}
              >
                Protecting People,
                <br />
                Restoring the Future
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="mt-6 max-w-md text-base leading-relaxed"
                style={{ color: heroTextSoft }}
              >
                Volunect connects volunteers with verified NGOs across India — find a cause
                that fits your life, and give your time where it takes root.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-9 flex items-center gap-4"
              >
                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-full text-sm font-semibold text-white shadow-lg"
                  style={{ background: ink }}
                >
                  Join The Mission
                </Link>
                <Link
                  to="/programs"
                  className="px-6 py-3.5 rounded-full text-sm font-semibold bg-white/70 backdrop-blur-md"
                >
                  Browse Programs
                </Link>
              </motion.div>
            </div>

            {/* warm glow standing in for a focal light-source, bottom center */}
            <div className="relative z-0 h-40 md:h-56 -mt-24 pointer-events-none">
              <div
                className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-70"
                style={{ background: `radial-gradient(circle, ${amber} 0%, transparent 70%)` }}
              />
              <div
                className="absolute left-1/2 bottom-0 -translate-x-1/2 w-40 h-40 rounded-full blur-2xl"
                style={{ background: '#FFF3D6', opacity: 0.9 }}
              />
            </div>
          </section>
        </div>

        {/* ── MISSION, STATS, HOW IT WORKS ─────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="max-w-2xl mb-16">
                <p className="text-xs uppercase tracking-[0.25em] font-bold mb-5" style={{ color: amber }}>
                  Our Mission
                </p>
                <h2 className="font-extrabold text-4xl md:text-5xl leading-tight mb-6 tracking-tight">
                  Goodwill needs a place to land
                </h2>
                <p className="text-lg leading-relaxed" style={{ color: inkSoft }}>
                  Millions want to volunteer but don't know where to start. Thousands of NGOs
                  need help but struggle to find reliable people. Volunect is the ground
                  between them.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="grid grid-cols-3 gap-8 pb-16 mb-16 border-b" style={{ borderColor: '#DEDACB' }}>
                {stats.map(({ value, label }, i) => (
                  <div key={i} className={i > 0 ? 'border-l pl-8' : ''} style={{ borderColor: '#DEDACB' }}>
                    <p className="font-extrabold text-4xl md:text-5xl mb-2 tracking-tight">{value}</p>
                    <p className="text-sm" style={{ color: inkSoft }}>{label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-10">
              {steps.map((s, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <div>
                    <p className="font-extrabold text-sm mb-4" style={{ color: amber }}>{s.n}</p>
                    <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: inkSoft }}>{s.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROGRAMS + CLOSING CTA ───────────────────────────────────── */}
        <section className="pb-24 px-6">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] font-bold mb-4" style={{ color: amber }}>
                    Featured Programs
                  </p>
                  <h2 className="font-extrabold text-4xl md:text-5xl leading-tight tracking-tight">
                    A few places to start
                  </h2>
                </div>
                <Link to="/programs" className="group inline-flex items-center gap-2 font-semibold flex-shrink-0">
                  View all programs
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6 mb-24">
              {programs.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 0.1}>
                  <Link to={`/programs/${p.id}`} className="group block">
                    <div className="rounded-[1.75rem] overflow-hidden aspect-[4/3] mb-4 shadow-sm">
                      <img
                        src={p.img}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-lg font-bold mb-1">{p.title}</h3>
                    <p className="text-sm" style={{ color: inkSoft }}>{p.ngo} · {p.location}</p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal>
              <div
                className="relative rounded-[2.5rem] overflow-hidden text-center py-20 px-8"
                style={{ background: ink }}
              >
                <div
                  aria-hidden
                  className="absolute left-1/2 -translate-x-1/2 -bottom-24 w-72 h-72 rounded-full blur-3xl opacity-40"
                  style={{ background: amber }}
                />
                <p className="relative text-xs uppercase tracking-[0.25em] font-bold mb-6 text-white/70">
                  Get Started
                </p>
                <h2 className="relative font-extrabold text-4xl md:text-5xl text-white mb-8 leading-tight tracking-tight">
                  Your time, somewhere it matters
                </h2>
                <Link
                  to="/register"
                  className="relative inline-flex items-center justify-center gap-2 bg-white font-semibold px-8 py-4 rounded-full transition-transform hover:-translate-y-0.5"
                  style={{ color: ink }}
                >
                  Join as a Volunteer <HiArrowRight />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}

/* NOTE
   - Only two things changed from your version: the hero background photo
     and the hero headline/subtext colors. Everything else — layout,
     structure, buttons, sections below — is untouched.
   - New photo: a golden-hour sunbeam breaking through a pine forest
     (Joshua Woroniecki, Unsplash). It reads darker and moodier than the
     previous canopy shot, so the old near-black `ink` headline would have
     nearly disappeared into it.
   - To fix that without touching `ink`/`inkSoft` used elsewhere on the page
     (mission section, buttons, stats — all on the light page bed and still
     fine as-is), I added two hero-only constants: `heroText` (warm cream,
     for the h1) and `heroTextSoft` (softened cream, for the subhead). They
     only apply inside the hero.
   - The dark overlay over the photo was flipped from a white-based wash to
     a black-based one (from-black/55 via-black/15 to-black/50) so the cream
     text has enough contrast against the sky/light-beam areas of the new
     image. Font family is unchanged (Plus Jakarta Sans still suits this
     bold, geometric headline style) — only color needed adjusting.
*/
