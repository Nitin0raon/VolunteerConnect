import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiArrowRight } from 'react-icons/hi2'
import PublicLayout from '../components/layout/PublicLayout'

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
      <div className="bg-white text-black font-sans min-h-screen">
        
        {/* SECTION 1: HERO TYPOGRAPHY */}
        <section className="px-6 md:px-12 py-16 md:py-24 border-b border-black">
          <div className="max-w-7xl mx-auto flex flex-col items-start">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-brand font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase tracking-tighter leading-[0.9] text-black w-full"
            >
              UNITED VOICES
            </motion.h1>
            
            <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between w-full gap-8">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="text-lg md:text-xl text-black max-w-2xl leading-snug font-brand font-medium"
              >
                Together, we fight for justice, equality, and freedom, protecting and upholding human rights worldwide.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex-shrink-0"
              >
                <Link
                  to="/register"
                  className="btn-editorial border-2 border-black text-xs uppercase tracking-widest font-black py-4 px-8"
                >
                  Get Involved
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* HERO IMAGE CONTAINER */}
        <section className="px-6 md:px-12 py-6 border-b border-black">
          <div className="max-w-7xl mx-auto h-[60vh] md:h-[75vh] overflow-hidden border border-black relative">
            <img
              src="https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=1800&q=80"
              alt="Activist shouting with a megaphone"
              className="w-full h-full object-cover img-grayscale"
            />
            <div className="absolute inset-0 bg-black/5 mix-blend-overlay pointer-events-none" />
          </div>
        </section>

        {/* SECTION 2: MISSION STATEMENT (BLACK BG) */}
        <section className="bg-black text-white px-6 md:px-12 py-24 border-b border-black">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            <ScrollReveal>
              <h2 className="font-brand font-black text-4xl md:text-6xl uppercase tracking-tight leading-none text-white">
                OUR MISSION
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="space-y-6">
                <p className="text-xl md:text-2xl leading-relaxed text-gray-200 font-brand">
                  At Volunect, we are dedicated to advocating for the protection of all human rights through awareness and action. Our hands-on approach ensures that we actively work towards enforcing human rights by educating, raising awareness, and engaging with communities to bring about positive change.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* SECTION 3: STATS GRID */}
        <section className="px-6 md:px-12 py-20 border-b border-black bg-white">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-3 border-t border-black">
                {stats.map(({ value, label }, i) => (
                  <div 
                    key={i} 
                    className="py-12 border-b md:border-b-0 border-black md:border-r border-black last:border-r-0 md:px-8 first:pl-0 last:pr-0"
                  >
                    <p className="font-brand font-black text-5xl md:text-7xl tracking-tighter text-black mb-2">{value}</p>
                    <p className="text-xs uppercase tracking-widest font-black text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* SECTION 4: FEATURED PROGRAMS */}
        <section className="px-6 md:px-12 py-24 border-b border-black bg-white">
          <div className="max-w-7xl mx-auto">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div>
                  <p className="text-xs uppercase tracking-widest font-black text-gray-500 mb-4 font-brand">
                    Featured Actions
                  </p>
                  <h2 className="font-brand font-black text-4xl md:text-5xl uppercase tracking-tighter text-black">
                    JOIN THE MOVEMENT
                  </h2>
                </div>
                <Link 
                  to="/programs" 
                  className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-black underline underline-offset-4"
                >
                  View all actions
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </ScrollReveal>

            {/* Grid of Grayscale Program Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {programs.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 0.1}>
                  <Link to={`/programs/${p.id}`} className="group block border border-black bg-white rounded-none p-0 overflow-hidden">
                    <div className="h-64 overflow-hidden border-b border-black relative">
                      <div className="absolute top-4 left-4 bg-black text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider z-10">
                        ADMIN
                      </div>
                      <img
                        src={p.img}
                        alt={p.title}
                        className="w-full h-full object-cover img-grayscale transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-md font-black uppercase tracking-tight text-black mb-1 font-brand">{p.title}</h3>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{p.ngo} &middot; {p.location}</p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: CTA STATEMENT & CHARACTER PHOTO (BLACK BG) */}
        <section className="bg-black text-white px-6 md:px-12 py-24">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <ScrollReveal>
              <p className="text-xl md:text-2xl font-brand font-medium leading-relaxed max-w-4xl mb-10 text-gray-200">
                "We believe that every individual has the right to dignity, freedom, and equality. Through our efforts, we aim to create a world where human rights are respected and upheld, regardless of race, gender, or background."
              </p>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
              <Link
                to="/register"
                className="btn-editorial-dark border-2 border-white text-xs uppercase tracking-widest font-black py-4 px-10 mb-20"
              >
                Learn More
              </Link>
            </ScrollReveal>

            {/* Large Character Photo at the bottom */}
            <ScrollReveal delay={0.2} className="w-full">
              <div className="w-full max-w-5xl h-[50vh] md:h-[60vh] overflow-hidden border border-white mx-auto relative">
                <img
                  src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1800&q=80"
                  alt="Smiling activist holding a blank banner"
                  className="w-full h-full object-cover img-grayscale"
                />
              </div>
            </ScrollReveal>
          </div>
        </section>

      </div>
    </PublicLayout>
  )
}
