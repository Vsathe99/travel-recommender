import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiHome, FiMap, FiBookmark, FiBarChart2 } from 'react-icons/fi'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/recommend', label: 'Discover', icon: FiMap },
  { to: '/saved-trips', label: 'Saved Trips', icon: FiBookmark },
  { to: '/compare', label: 'Compare', icon: FiBarChart2 },
]

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="font-display font-bold text-lg text-gradient">SmartTravel</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${location.pathname === to
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${location.pathname === '/admin'
                    ? 'bg-sunset-500/20 text-sunset-400 border border-sunset-500/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <FiSettings className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-ocean-500 flex items-center justify-center text-xs font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm text-white/80">{user.name}</span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 glass-card shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-white/10">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-white/50">{user.email}</p>
                </div>
                <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                  <FiUser className="w-4 h-4" /> Profile
                </Link>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                  <FiLogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-900/95 border-t border-white/10 px-4 py-4 space-y-2">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${location.pathname === to ? 'bg-primary-600/20 text-primary-400' : 'text-white/70'}`}>
              <Icon className="w-5 h-5" /> {label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sunset-400">
              <FiSettings className="w-5 h-5" /> Admin Panel
            </Link>
          )}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400">
            <FiLogOut className="w-5 h-5" /> Log out
          </button>
        </div>
      )}
    </nav>
  )
}
