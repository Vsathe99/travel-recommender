import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { tripAPI } from '../api/client'
import toast from 'react-hot-toast'
import { FiTrash2, FiEdit, FiCalendar, FiDollarSign, FiMapPin, FiPlus, FiArrowRight } from 'react-icons/fi'
import { formatDate, formatCurrency } from '../utils/helpers'

export default function SavedTripsPage() {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    tripAPI.getHistory()
      .then(r => setTrips(r.data.data || []))
      .catch(() => toast.error('Failed to load trips'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this trip?')) return
    setDeleting(id)
    try {
      await tripAPI.delete(id)
      setTrips(t => t.filter(x => x.id !== id))
      toast.success('Trip deleted')
    } catch { toast.error('Failed to delete trip') }
    finally { setDeleting(null) }
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pb-16">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-3">
              <FiCalendar className="w-3.5 h-3.5" /> Saved
            </div>
            <h1 className="section-title">Your Trips</h1>
            <p className="section-subtitle">{trips.length} trip{trips.length !== 1 ? 's' : ''} saved</p>
          </div>
          <Link to="/planner" className="btn-primary">
            <FiPlus className="w-4 h-4" /> New Trip
          </Link>
        </div>

        {loading && (
          <div className="py-24 flex items-center justify-center">
            <div className="spinner w-10 h-10" />
          </div>
        )}

        {!loading && trips.length === 0 && (
          <div className="glass-gradient text-center py-20 px-8">
            <div className="text-5xl mb-5 animate-float">✈️</div>
            <h3 className="text-lg font-bold text-[#1a1c2e] mb-2">No saved trips yet</h3>
            <p className="text-sm text-[#2d3142]/40 mb-6">Plan your first trip with AI assistance</p>
            <Link to="/planner" className="btn-primary">
              <FiPlus className="w-4 h-4" /> Plan a Trip
            </Link>
          </div>
        )}

        {/* Trip list - timeline style */}
        <div className="space-y-4">
          {trips.map(trip => (
            <div key={trip.id} className="glass-card-hover p-6 group">
              <div className="flex items-start gap-5">
                {/* Gradient icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-2xl shrink-0 shadow-lg shadow-indigo-500/15 group-hover:shadow-indigo-500/25 transition-shadow">
                  ✈️
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[#1a1c2e] group-hover:text-indigo-600 transition-colors truncate">
                    {trip.destination}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-[#2d3142]/40">
                      <FiCalendar className="w-3 h-3" /> {trip.duration} days
                    </span>
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <FiDollarSign className="w-3 h-3" /> {formatCurrency(trip.budget)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#2d3142]/30">
                      <FiMapPin className="w-3 h-3" /> {formatDate(trip.created_at)}
                    </span>
                  </div>

                  {/* Travel types as chips */}
                  {trip.travel_type?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {trip.travel_type.map(t => (
                        <span key={t} className="text-[10px] text-[#2d3142]/40 bg-black/[0.03] px-2 py-0.5 rounded-full capitalize">{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Itinerary preview chips */}
                  {trip.itinerary?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {trip.itinerary.slice(0, 4).map((day, i) => (
                        <span key={i} className="text-[10px] text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                          Day {day.day}: {day.title?.split(' ').slice(0, 3).join(' ')}
                        </span>
                      ))}
                      {trip.itinerary.length > 4 && (
                        <span className="text-[10px] text-[#2d3142]/30 px-2 py-0.5">+{trip.itinerary.length - 4} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/planner?destination=${encodeURIComponent(trip.destination)}`) }}
                    className="btn-secondary p-2.5">
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(trip.id) }} disabled={deleting === trip.id}
                    className="btn-danger p-2.5">
                    {deleting === trip.id ? <span className="spinner w-4 h-4" /> : <FiTrash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
