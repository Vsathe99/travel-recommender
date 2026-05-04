import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tripAPI, cfAPI } from '../api/client'
import Navbar from '../components/Navbar'
import { FiMap, FiBookmark, FiBarChart2, FiPlus, FiCalendar, FiDollarSign, FiArrowRight, FiCompass, FiMapPin, FiArrowUpRight, FiTrendingUp, FiZap } from 'react-icons/fi'
import { formatDate, formatCurrency } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [forYou, setForYou] = useState([])
  const [forYouLoading, setForYouLoading] = useState(true)
  const [forYouMessage, setForYouMessage] = useState('')

  useEffect(() => {
    tripAPI.getHistory()
      .then(r => setTrips(r.data.data || []))
      .catch(() => toast.error('Failed to load trips'))
      .finally(() => setLoading(false))

    // Fetch CF "For You" recommendations
    cfAPI.forYou()
      .then(r => {
        setForYou(r.data.data || [])
        setForYouMessage(r.data.message || '')
      })
      .catch(() => {})
      .finally(() => setForYouLoading(false))
  }, [])

  const recentTrips = trips.slice(0, 3)
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pb-16">

        {/* ─── HERO WELCOME ─── */}
        <div className="relative mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-indigo-500 mb-2">{greeting}</p>
              <h1 className="text-4xl md:text-5xl font-bold text-[#1a1c2e] tracking-tight leading-[1.1]">
                {user?.name?.split(' ')[0]} <span className="text-gradient">✦</span>
              </h1>
              <p className="text-[#2d3142]/45 mt-3 text-base max-w-md">
                Your next adventure awaits. Explore destinations, plan trips, and let AI guide you.
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/recommend" className="btn-primary">
                <FiCompass className="w-4 h-4" /> Discover
              </Link>
              <Link to="/planner" className="btn-secondary">
                <FiPlus className="w-4 h-4" /> Plan Trip
              </Link>
            </div>
          </div>
        </div>

        {/* ─── BENTO GRID ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {/* Large stat */}
          <div className="col-span-2 glass-gradient p-6 flex items-center gap-5 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400/20 to-violet-400/20 blur-2xl" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FiBookmark className="w-6 h-6 text-white" />
            </div>
            <div className="relative">
              <p className="text-3xl font-bold text-[#1a1c2e]">{trips.length}</p>
              <p className="text-sm text-[#2d3142]/40 mt-0.5">Total Trips Saved</p>
            </div>
          </div>

          {/* Smaller stats */}
          <div className="glass p-5 flex flex-col justify-between min-h-[120px]">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FiMap className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a1c2e]">{new Set(trips.map(t => t.destination)).size}</p>
              <p className="text-xs text-[#2d3142]/40">Destinations</p>
            </div>
          </div>

          <div className="glass p-5 flex flex-col justify-between min-h-[120px]">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <FiCalendar className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a1c2e]">{trips.reduce((s, t) => s + (t.duration || 0), 0)}</p>
              <p className="text-xs text-[#2d3142]/40">Days Planned</p>
            </div>
          </div>
        </div>

        {/* ─── FOR YOU — CF RECOMMENDATIONS ─── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-[#1a1c2e]">For You</h2>
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-indigo-600 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
                <FiZap className="w-3 h-3" /> AI-Powered
              </span>
            </div>
            <button
              onClick={() => cfAPI.train().then(() => {
                toast.success('Model retrained!')
                cfAPI.forYou().then(r => setForYou(r.data.data || []))
              }).catch(() => toast.error('Training failed'))}
              className="text-xs text-[#2d3142]/30 hover:text-indigo-500 font-medium transition-colors flex items-center gap-1"
            >
              <FiTrendingUp className="w-3 h-3" /> Retrain
            </button>
          </div>

          {forYouLoading ? (
            <div className="flex items-center gap-3 py-12 justify-center text-sm text-[#2d3142]/30">
              <div className="spinner w-5 h-5" /> Loading personalized recommendations…
            </div>
          ) : forYou.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {forYou.slice(0, 10).map((dest, i) => (
                <div
                  key={dest.id || i}
                  onClick={() => navigate(`/destination/${encodeURIComponent(dest.name)}${dest.country ? `?country=${encodeURIComponent(dest.country)}` : ''}`)}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1.5 transition-all duration-500 hover:shadow-xl hover:shadow-black/[0.06]"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={`https://source.unsplash.com/400x300/?${dest.name},travel`}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Budget tier badge */}
                    {dest.budget_tier && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className={`text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full backdrop-blur-md ${
                          dest.budget_tier === 'luxury' ? 'bg-amber-400/80 text-amber-950' :
                          dest.budget_tier === 'mid' ? 'bg-blue-400/80 text-blue-950' :
                          'bg-emerald-400/80 text-emerald-950'
                        }`}>
                          {dest.budget_tier}
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-2.5 left-3 right-3">
                      <p className="text-white font-bold text-sm leading-tight">{dest.name}</p>
                      <p className="text-white/60 text-[11px] flex items-center gap-1 mt-0.5">
                        <FiMapPin className="w-2.5 h-2.5" /> {dest.country}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-md px-3 py-2 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {(dest.travel_type || []).slice(0, 2).map((t, j) => (
                        <span key={j} className="text-[9px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full capitalize">{t}</span>
                      ))}
                    </div>
                    <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white text-indigo-400 transition-all">
                      <FiArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-gradient text-center py-10 px-6 rounded-2xl">
              <div className="text-3xl mb-3">🤖</div>
              <p className="text-sm text-[#2d3142]/45 max-w-md mx-auto">
                {forYouMessage || 'Start exploring destinations to get personalized recommendations. Browse, like, and save trips — the more you interact, the smarter your suggestions become!'}
              </p>
            </div>
          )}
        </div>

        {/* ─── QUICK ACTIONS (flowing cards, not boxes) ─── */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-[#1a1c2e] mb-5">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { to: '/recommend', emoji: '🧠', title: 'AI Recommendations', desc: 'Personalized picks powered by Grok', gradient: 'from-indigo-500/10 to-violet-500/10', iconBg: 'bg-indigo-50', arrow: 'text-indigo-500' },
              { to: '/compare', emoji: '⚖️', title: 'Compare Places', desc: 'Side-by-side weather & cost analysis', gradient: 'from-emerald-500/10 to-teal-500/10', iconBg: 'bg-emerald-50', arrow: 'text-emerald-500' },
              { to: '/saved-trips', emoji: '📅', title: 'My Itineraries', desc: 'Manage saved plans & budgets', gradient: 'from-amber-500/10 to-orange-500/10', iconBg: 'bg-amber-50', arrow: 'text-amber-500' },
            ].map(({ to, emoji, title, desc, gradient, iconBg, arrow }) => (
              <Link key={to} to={to}
                className={`group relative p-6 rounded-2xl bg-gradient-to-br ${gradient} border border-white/50 hover:border-white/80 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.04]`}>
                <div className={`text-2xl w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                  {emoji}
                </div>
                <h3 className="font-semibold text-[#1a1c2e] mb-1">{title}</h3>
                <p className="text-sm text-[#2d3142]/45 mb-4">{desc}</p>
                <div className={`flex items-center gap-1 text-sm font-medium ${arrow} group-hover:gap-2 transition-all`}>
                  Explore <FiArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ─── RECENT TRIPS (timeline style) ─── */}
        {!loading && recentTrips.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#1a1c2e]">Recent Trips</h2>
              <Link to="/saved-trips" className="text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1 transition-colors">
                View all <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentTrips.map((trip, i) => (
                <Link key={trip.id} to={`/planner/${trip.id}`}
                  className="glass-card-hover flex items-center gap-5 p-5 group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-lg shrink-0 shadow-lg shadow-indigo-500/15 group-hover:shadow-indigo-500/25 transition-shadow">
                    ✈️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1a1c2e] truncate">{trip.destination}</p>
                    <p className="text-xs text-[#2d3142]/40 mt-0.5">{trip.duration} days · {formatCurrency(trip.budget)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-[#2d3142]/30">{formatDate(trip.created_at)}</p>
                    <FiArrowRight className="w-4 h-4 text-[#2d3142]/20 group-hover:text-indigo-500 ml-auto mt-1 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && trips.length === 0 && (
          <div className="glass-gradient text-center py-20 px-8">
            <div className="text-6xl mb-5 animate-float">🗺️</div>
            <h3 className="text-xl font-bold text-[#1a1c2e] mb-2">No trips yet</h3>
            <p className="text-[#2d3142]/45 mb-8 max-w-sm mx-auto">
              Start by getting AI-powered destination recommendations tailored to your preferences
            </p>
            <Link to="/recommend" className="btn-primary">
              <FiCompass className="w-4 h-4" /> Get Recommendations
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
