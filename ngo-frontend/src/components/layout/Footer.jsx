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
    <footer className="bg-black text-white border-t border-black">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-black text-lg tracking-widest text-white font-brand uppercase">
                Volunect
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-sans">
              Protecting people, restoring the future. Connecting passionate volunteers with verified NGOs making a difference.
            </p>
            <div className="flex gap-3 mt-6">
              {social.map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-10 h-10 border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all rounded-none"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs uppercase tracking-widest font-black text-white mb-6 font-brand">Navigate</p>
            <div className="flex flex-col gap-3 font-sans">
              {['Home', 'Programs'].map((l) => (
                <Link key={l} to={l === 'Home' ? '/' : `/${l.toLowerCase()}`}
                  className="text-sm text-gray-400 hover:text-white transition-colors">
                  {l}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-widest font-black text-white mb-6 font-brand">Contact</p>
            <div className="flex flex-col gap-4 font-sans">
              <a href="mailto:hello@volunect.org" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                <MdEmail className="text-white flex-shrink-0" />
                hello@volunect.org
              </a>
              <a href="tel:+919999999999" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                <MdPhone className="text-white flex-shrink-0" />
                +91 99999 99999
              </a>
              <span className="flex items-start gap-3 text-sm text-gray-400">
                <MdLocationOn className="text-white flex-shrink-0 mt-0.5" />
                India
              </span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 font-sans">
          <p className="text-xs text-gray-500">© 2026 Volunect. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((l) => (
              <Link key={l} to="#" className="text-xs text-gray-500 hover:text-white transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
