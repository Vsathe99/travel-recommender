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

  const handleLogout = () => { logout(); navigate('/') }

  if (!user) return null

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
      <div className="glass px-5 py-2.5 flex items-center justify-between" style={{ borderRadius: '1rem' }}>
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="text-xl">✈️</span>
          <span className="font-helvetica font-bold text-base text-gradient hidden sm:inline">SmartTravel</span>
        </Link>

        {/* Center Nav Pills */}
        <div className="hidden md:flex items-center gap-0.5 bg-black/[0.03] rounded-xl p-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-300
                ${location.pathname === to
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-[#2d3142]/50 hover:text-[#2d3142]/80'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-300
                ${location.pathname === '/admin'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-[#2d3142]/50 hover:text-[#2d3142]/80'
                }`}
            >
              <FiSettings className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
        </div>

        {/* Right: User */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 hover:bg-black/[0.03] px-2 py-1.5 rounded-xl transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-indigo-500/20">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm text-[#2d3142]/60 font-medium">{user.name?.split(' ')[0]}</span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 glass p-1.5 z-50" style={{ borderRadius: '1rem' }}>
                <div className="px-3 py-2.5 mb-1">
                  <p className="text-sm font-semibold text-[#2d3142]">{user.name}</p>
                  <p className="text-xs text-[#2d3142]/40 mt-0.5">{user.email}</p>
                </div>
                <div className="h-px bg-black/[0.06] mx-2 mb-1" />
                <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#2d3142]/60 hover:text-[#2d3142] hover:bg-black/[0.03] rounded-lg transition-all">
                  <FiUser className="w-4 h-4" /> Profile
                </Link>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <FiLogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            )}
          </div>

          {/* Mobile */}
          <button className="md:hidden p-1.5 text-[#2d3142]/60 hover:text-[#2d3142]" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden glass mt-2 p-2" style={{ borderRadius: '1rem' }}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${location.pathname === to ? 'bg-white text-indigo-600 shadow-sm' : 'text-[#2d3142]/50'}`}>
              <Icon className="w-5 h-5" /> {label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-amber-600">
              <FiSettings className="w-5 h-5" /> Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
