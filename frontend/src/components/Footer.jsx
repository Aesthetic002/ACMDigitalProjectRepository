import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-zinc-900/80 border-t border-zinc-800/50">
      {/* Subtle top gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/10">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold gradient-text">ACM Projects</span>
            </div>
            <p className="text-zinc-400 mb-6 max-w-md leading-relaxed">
              A platform for ACM club members to showcase their projects,
              collaborate with peers, and discover innovative work from the community.
            </p>
            <div className="flex space-x-3">
              {[
                { icon: Github, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Linkedin, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-all duration-300 border border-zinc-700/40 hover:border-zinc-600/60"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/projects" className="text-zinc-400 hover:text-primary-400 transition-colors">
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-zinc-400 hover:text-primary-400 transition-colors">
                  Search
                </Link>
              </li>
              <li>
                <Link to="/projects/new" className="text-zinc-400 hover:text-primary-400 transition-colors">
                  Submit Project
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-zinc-400 hover:text-primary-400 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-primary-400 transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-primary-400 transition-colors">
                  Contributing Guide
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} ACM Project Archive. All rights reserved.
          </p>
          <p className="text-zinc-500 text-sm flex items-center mt-4 md:mt-0">
            Made with <Heart className="w-4 h-4 mx-1 text-red-500/80" /> by ACM Team
          </p>
        </div>
      </div>
    </footer>
  )
}
