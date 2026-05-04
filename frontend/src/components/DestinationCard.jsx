import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCloud, FiMapPin, FiArrowUpRight, FiCoffee, FiHome } from 'react-icons/fi'
import { getScoreColor, getSuitabilityColor, formatCurrency } from '../utils/helpers'

export default function DestinationCard({ destination }) {
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)

  const {
    destination: name, country, score, reason, weather_suitability,
    highlights = [], thumbnail, avg_cost_inr, restaurants = [], hotels = [], coordinates,
  } = destination

  const fallbackImg = `https://source.unsplash.com/600x400/?${name},travel`

  return (
    <div
      className="group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/[0.08]"
      onClick={() => navigate(`/destination/${encodeURIComponent(name)}${country ? `?country=${encodeURIComponent(country)}` : ''}`)}
    >
      {/* Image with overlay */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={imgError || !thumbnail ? fallbackImg : thumbnail}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Score - floating pill */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
          <div className={`w-2 h-2 rounded-full ${score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-blue-500' : 'bg-amber-500'}`} />
          <span className="text-sm font-bold text-[#1a1c2e]">{score?.toFixed(1)}</span>
        </div>

        {/* Suitability badge */}
        {weather_suitability && (
          <div className="absolute top-4 left-4">
            <span className={`badge border ${getSuitabilityColor(weather_suitability)}`}>
              <FiCloud className="w-3 h-3 mr-1" /> {weather_suitability}
            </span>
          </div>
        )}

        {/* Location text on image */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-xl tracking-tight">{name}</h3>
          {country && (
            <p className="text-white/70 text-sm flex items-center gap-1 mt-0.5">
              <FiMapPin className="w-3 h-3" /> {country}
            </p>
          )}
        </div>
      </div>

      {/* Content below image - organic, not boxy */}
      <div className="bg-white/70 backdrop-blur-md p-5 space-y-3 border-t-0" style={{ borderRadius: '0 0 1.5rem 1.5rem' }}>
        {/* Cost */}
        {avg_cost_inr && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#2d3142]/40 uppercase tracking-wider font-medium">Avg Cost</span>
            <span className="text-sm font-bold text-emerald-600">{formatCurrency(avg_cost_inr)}/day</span>
          </div>
        )}

        {/* Reason */}
        <p className="text-[#2d3142]/55 text-sm leading-relaxed line-clamp-2">{reason}</p>

        {/* Places row - inline chips, not boxes */}
        <div className="flex flex-wrap gap-1.5">
          {restaurants.slice(0, 2).map((r, i) => (
            <span key={`r-${i}`} className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
              <FiCoffee className="w-2.5 h-2.5" /> {r.name?.split(' ').slice(0, 2).join(' ')}
            </span>
          ))}
          {hotels.slice(0, 1).map((h, i) => (
            <span key={`h-${i}`} className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
              <FiHome className="w-2.5 h-2.5" /> {h.name?.split(' ').slice(0, 2).join(' ')}
            </span>
          ))}
        </div>

        {/* Highlights as inline tags */}
        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {highlights.slice(0, 3).map((h, i) => (
              <span key={i} className="text-[10px] text-[#2d3142]/35 bg-black/[0.03] px-2 py-0.5 rounded-full">{h}</span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-indigo-500 font-semibold group-hover:text-indigo-600 transition-colors">
            Explore destination
          </span>
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white text-indigo-500 transition-all duration-300">
            <FiArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
