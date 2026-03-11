import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tripAPI } from '../api/client'
import Navbar from '../components/Navbar'
import { FiMap, FiBookmark, FiBarChart2, FiPlus, FiCalendar, FiDollarSign } from 'react-icons/fi'
import { formatDate, formatCurrency } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tripAPI.getHistory()
      .then(r => setTrips(r.data.data || []))
      .catch(() => toast.error('Failed to load trips'))
      .finally(() => setLoading(false))
  }, [])

  const recentTrips = trips.slice(0, 4)

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome banner */}
        <div className="glass-card p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-white/60 mt-2">Ready for your next adventure?</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link to="/recommend" className="btn-primary flex items-center gap-2">
                <FiPlus className="w-4 h-4" /> New Recommendation
              </Link>
              <Link to="/saved-trips" className="btn-secondary flex items-center gap-2">
                <FiBookmark className="w-4 h-4" /> Saved Trips
              </Link>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FiBookmark, label: 'Saved Trips', value: trips.length, color: 'text-blue-400' },
            { icon: FiMap, label: 'Destinations', value: new Set(trips.map(t => t.destination)).size, color: 'text-ocean-400' },
            { icon: FiCalendar, label: 'Total Days', value: trips.reduce((s, t) => s + (t.duration || 0), 0), color: 'text-purple-400' },
            { icon: FiDollarSign, label: 'Total Budget', value: formatCurrency(trips.reduce((s, t) => s + (t.budget || 0), 0)), color: 'text-green-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="glass-card p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-white/10`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className={`font-display font-bold text-xl ${color}`}>{value}</p>
                <p className="text-white/50 text-xs">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { to: '/recommend', icon: '🧠', title: 'AI Recommendations', desc: 'Get personalized destination picks from Grok LLM', btn: 'Explore Now' },
            { to: '/compare', icon: '⚖️', title: 'Compare Destinations', desc: 'Side-by-side comparison of weather, costs, and ratings', btn: 'Compare' },
            { to: '/saved-trips', icon: '📅', title: 'My Trip Plans', desc: 'View and manage your saved itineraries and budgets', btn: 'View Trips' },
          ].map(({ to, icon, title, desc, btn }) => (
            <Link key={to} to={to} className="glass-card-hover p-6 group">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-display font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">{title}</h3>
              <p className="text-white/50 text-sm mb-4">{desc}</p>
              <span className="text-primary-400 text-sm font-medium">{btn} →</span>
            </Link>
          ))}
        </div>

        {/* Recent trips */}
        {!loading && recentTrips.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-white">Recent Trips</h2>
              <Link to="/saved-trips" className="text-primary-400 text-sm hover:text-primary-300">View all →</Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {recentTrips.map(trip => (
                <Link key={trip.id} to={`/planner/${trip.id}`}
                  className="glass-card-hover p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-ocean-500 flex items-center justify-center text-xl shrink-0">
                    ✈️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{trip.destination}</p>
                    <p className="text-white/50 text-xs mt-0.5">{trip.duration} days · {formatCurrency(trip.budget)}</p>
                    <p className="text-white/30 text-xs mt-1">{formatDate(trip.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && trips.length === 0 && (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="font-display font-bold text-xl text-white mb-2">No trips yet</h3>
            <p className="text-white/50 mb-6">Start by getting AI travel recommendations</p>
            <Link to="/recommend" className="btn-primary inline-flex items-center gap-2">
              <FiPlus className="w-4 h-4" /> Get Recommendations
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
