import { Link } from 'react-router-dom'
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa'
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md'

const social = [
  { icon: FaFacebook, href: '#' },
  { icon: FaTwitter, href: '#' },
  { icon: FaLinkedin, href: '#' },
  { icon: FaInstagram, href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-subtle">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-bg font-bold text-sm">V</span>
              </div>
              <span className="font-semibold text-white">Volunect</span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              Where compassion meets action. Connecting passionate volunteers with NGOs making a difference.
            </p>
            <div className="flex gap-4 mt-8">
              {social.map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 border border-subtle rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/30 transition-all"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs uppercase tracking-widest2 text-text-secondary mb-6">Navigate</p>
            <div className="flex flex-col gap-3">
              {['Home', 'Programs', 'About', 'Contact'].map((l) => (
                <Link key={l} to={l === 'Home' ? '/' : `/${l.toLowerCase()}`}
                  className="text-sm text-text-secondary hover:text-white transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-widest2 text-text-secondary mb-6">Contact</p>
            <div className="flex flex-col gap-4">
              <a href="mailto:hello@volunect.org" className="flex items-center gap-3 text-sm text-text-secondary hover:text-white transition-colors">
                <MdEmail className="text-primary flex-shrink-0" />
                hello@volunect.org
              </a>
              <a href="tel:+919999999999" className="flex items-center gap-3 text-sm text-text-secondary hover:text-white transition-colors">
                <MdPhone className="text-primary flex-shrink-0" />
                +91 99999 99999
              </a>
              <span className="flex items-start gap-3 text-sm text-text-secondary">
                <MdLocationOn className="text-primary flex-shrink-0 mt-0.5" />
                Somewhere in the World
              </span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-subtle pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-secondary">© 2025 Volunect. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((l) => (
              <Link key={l} to="#" className="text-xs text-text-secondary hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
