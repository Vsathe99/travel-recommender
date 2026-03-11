import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { tripAPI } from '../api/client'
import toast from 'react-hot-toast'
import { FiTrash2, FiEdit, FiCalendar, FiDollarSign, FiMapPin, FiPlus } from 'react-icons/fi'
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
    } catch {
      toast.error('Failed to delete trip')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">🗓️ Saved Trips</h1>
            <p className="section-subtitle">{trips.length} trip{trips.length !== 1 ? 's' : ''} saved</p>
          </div>
          <Link to="/planner" className="btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> New Trip
          </Link>
        </div>

        {loading && (
          <div className="glass-card p-16 flex items-center justify-center">
            <div className="spinner w-10 h-10" />
          </div>
        )}

        {!loading && trips.length === 0 && (
          <div className="glass-card p-16 text-center">
            <div className="text-5xl mb-4">✈️</div>
            <h3 className="font-display font-bold text-xl text-white mb-2">No saved trips yet</h3>
            <p className="text-white/50 mb-6">Plan your first trip with AI assistance</p>
            <Link to="/planner" className="btn-primary inline-flex items-center gap-2">
              <FiPlus className="w-4 h-4" /> Plan a Trip
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {trips.map(trip => (
            <div key={trip.id} className="glass-card-hover p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-600 to-ocean-500 flex items-center justify-center text-2xl shrink-0">
                    ✈️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-xl text-white">{trip.destination}</h3>
                      {trip.country && (
                        <span className="text-white/40 text-sm">, {trip.country}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5" /> {trip.duration} days
                      </span>
                      <span className="flex items-center gap-1">
                        <FiDollarSign className="w-3.5 h-3.5" /> {formatCurrency(trip.budget)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-3.5 h-3.5" /> {formatDate(trip.created_at)}
                      </span>
                    </div>
                    {trip.travel_type?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {trip.travel_type.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/50 capitalize">{t}</span>
                        ))}
                      </div>
                    )}
                    {trip.notes && (
                      <p className="text-white/40 text-sm mt-2 italic">"{trip.notes}"</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => navigate(`/planner?destination=${encodeURIComponent(trip.destination)}`)}
                    className="btn-secondary p-2">
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(trip.id)} disabled={deleting === trip.id}
                    className="btn-danger p-2">
                    {deleting === trip.id
                      ? <span className="spinner w-4 h-4 inline-block" />
                      : <FiTrash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Itinerary preview */}
              {trip.itinerary?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/50 text-xs mb-2 uppercase tracking-wider">Itinerary Preview</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {trip.itinerary.slice(0, 5).map((day, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-2 text-center">
                        <p className="text-ocean-400 text-xs font-medium">Day {day.day}</p>
                        <p className="text-white/60 text-xs mt-0.5 truncate">{day.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
