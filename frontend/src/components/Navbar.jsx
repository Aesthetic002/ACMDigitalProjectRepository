import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  Menu, X, Search, Plus, User, LogOut, Settings,
  LayoutDashboard, FolderOpen, ChevronDown
} from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/projects', label: 'Projects', icon: FolderOpen },
    { to: '/search', label: 'Search', icon: Search },
  ]

  return (
    <nav className="sticky top-0 z-50 glass-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/30 transition-shadow">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              ACM Projects
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-primary-500/15 text-primary-400 shadow-sm shadow-primary-500/10'
                    : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                  }`
                }
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/projects/new"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-zinc-800/80 transition-colors"
                  >
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-zinc-700"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center ring-2 ring-zinc-700">
                        <span className="text-white text-sm font-medium">
                          {user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 py-2 glass-premium rounded-xl shadow-2xl animate-fade-in">
                      <div className="px-4 py-3 border-b border-zinc-700/50">
                        <p className="text-sm font-medium text-white">{user?.name}</p>
                        <p className="text-xs text-zinc-400">{user?.email}</p>
                        {user?.role === 'admin' && (
                          <span className="badge badge-info mt-1">Admin</span>
                        )}
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-zinc-300 hover:bg-zinc-700/40 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2.5 text-zinc-300 hover:bg-zinc-700/40 hover:text-white transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <hr className="my-2 border-zinc-700/50" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="btn-ghost">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-zinc-800/80 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-zinc-700/50 animate-slide-in glass-premium">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${isActive
                    ? 'bg-primary-500/15 text-primary-400'
                    : 'text-zinc-300 hover:bg-zinc-800/80'
                  }`
                }
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  to="/projects/new"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-4 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800/80"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Project</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-4 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800/80"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-4 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800/80"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Admin</span>
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="flex items-center space-x-2 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="pt-4 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center btn-secondary"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center btn-primary"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
