import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiStar, FiDollarSign, FiCloud, FiMapPin, FiArrowRight, FiCoffee, FiHome } from 'react-icons/fi'
import { getScoreColor, getSuitabilityColor, formatCurrency } from '../utils/helpers'

export default function DestinationCard({ destination, onSave }) {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)

  const {
    destination: name,
    country,
    score,
    reason,
    estimated_cost,
    weather_suitability,
    highlights = [],
    thumbnail,
    avg_cost_inr,
    restaurants = [],
    hotels = [],
    coordinates,
  } = destination

  const fallbackImg = `https://source.unsplash.com/600x400/?${name},travel`

  return (
    <div className="glass-card-hover group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-blue"
      onClick={() => navigate(`/destination/${encodeURIComponent(name)}`)}>
      
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imgError || !thumbnail ? fallbackImg : thumbnail}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
        
        {/* Score badge */}
        <div className={`absolute top-3 right-3 score-ring w-11 h-11 text-sm font-bold ${getScoreColor(score)} bg-dark-900/80 backdrop-blur-sm`}>
          {score?.toFixed(1)}
        </div>

        {/* Location */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-sm">
          <FiMapPin className="w-3.5 h-3.5 text-ocean-400" />
          <span className="font-medium">{name}</span>
          {country && <span className="text-white/60">, {country}</span>}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Suitability & Cost */}
        <div className="flex flex-wrap items-center justify-between gap-y-2">
          <span className={`badge border ${getSuitabilityColor(weather_suitability)}`}>
            <FiCloud className="w-3 h-3 mr-1" />
            {weather_suitability || 'Unknown'}
          </span>
          {avg_cost_inr && (
            <span className="flex items-center gap-1 text-green-400 text-sm font-medium bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
              <span className="text-sm font-bold">₹</span>
              {formatCurrency(avg_cost_inr).replace('$', '')} avg/day
            </span>
          )}
        </div>

        {/* Reason */}
        <p className="text-white/70 text-sm leading-relaxed line-clamp-2">{reason}</p>

        {/* Places Grid */}
        <div className="grid grid-cols-2 gap-2 mt-2">
            {restaurants.length > 0 && (
                <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <p className="text-xs text-sunset-400 font-bold mb-1 flex items-center gap-1">
                        <FiCoffee className="w-3 h-3"/> Best Food
                    </p>
                    <p className="text-[10px] text-white/70 truncate">{restaurants[0]?.name}</p>
                    {restaurants[1] && <p className="text-[10px] text-white/70 truncate">{restaurants[1]?.name}</p>}
                </div>
            )}
            {hotels.length > 0 && (
                <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <p className="text-xs text-emerald-400 font-bold mb-1 flex items-center gap-1">
                        <FiHome className="w-3 h-3"/> Recommended Stays
                    </p>
                    <p className="text-[10px] text-white/70 truncate">{hotels[0]?.name}</p>
                    {hotels[1] && <p className="text-[10px] text-white/70 truncate">{hotels[1]?.name}</p>}
                </div>
            )}
        </div>

        {/* Mini Map */}
        {coordinates && coordinates.lat !== 0 && (
            <div className="h-32 w-full rounded-lg overflow-hidden border border-white/10 mt-2 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
              <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=11&output=embed`}
                  allowFullScreen
              />
            </div>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {highlights.slice(0, 3).map((h, i) => (
              <span key={i} className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/60">
                {h}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-primary-600/20 border border-white/10 hover:border-primary-500/50 rounded-xl text-sm font-medium text-white/70 hover:text-primary-400 transition-all duration-200"
          onClick={(e) => { e.stopPropagation(); navigate(`/destination/${encodeURIComponent(name)}`) }}
        >
          Explore Destination <FiArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
