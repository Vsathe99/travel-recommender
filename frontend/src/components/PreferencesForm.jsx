import { useState, useEffect, useRef } from 'react'
import { travelAPI } from '../api/client'
import { FiDollarSign, FiCalendar, FiWind, FiUsers, FiGlobe, FiMapPin } from 'react-icons/fi'

const TRAVEL_TYPES = [
  { value: 'beach', label: '🏖️ Beach' },
  { value: 'mountains', label: '🏔️ Mountains' },
  { value: 'city', label: '🏙️ City' },
  { value: 'adventure', label: '🧗 Adventure' },
  { value: 'culture', label: '🏛️ Culture' },
  { value: 'wildlife', label: '🦁 Wildlife' },
]

const CLIMATES = ['warm', 'cool', 'tropical', 'dry', 'any']
const COMPANIONS = ['solo', 'couple', 'family', 'friends']

export default function PreferencesForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    travel_type: ['beach'],
    budget: 50000,
    duration: 7,
    preferred_climate: 'warm',
    travel_companions: 'solo',
    preferred_regions: [],
    city: '',
    state: '',
    country: '',
  })

  const toggleType = (type) => {
    setForm(f => ({
      ...f,
      travel_type: f.travel_type.includes(type)
        ? f.travel_type.filter(t => t !== type)
        : [...f.travel_type, type],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (form.travel_type.length === 0) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Travel Type */}
      <div>
        <label className="block text-white/70 text-sm font-medium mb-3 flex items-center gap-2">
          <FiGlobe className="w-4 h-4 text-ocean-400" /> Travel Type (select all that apply)
        </label>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleType(value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border
                ${form.travel_type.includes(value)
                  ? 'bg-primary-600/30 border-primary-500 text-primary-300'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
            <FiDollarSign className="w-4 h-4 text-green-400" /> Budget: ₹{form.budget.toLocaleString()}
          </label>
          <input
            type="range" min="5000" max="500000" step="1000"
            value={form.budget}
            onChange={(e) => setForm(f => ({ ...f, budget: Number(e.target.value) }))}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>₹5,000</span><span>₹5,00,000</span>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-purple-400" /> Duration: {form.duration} days
          </label>
          <input
            type="range" min="2" max="30" step="1"
            value={form.duration}
            onChange={(e) => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>2 days</span><span>30 days</span>
          </div>
        </div>

        {/* Climate */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
            <FiWind className="w-4 h-4 text-ocean-400" /> Preferred Climate
          </label>
          <select
            value={form.preferred_climate}
            onChange={(e) => setForm(f => ({ ...f, preferred_climate: e.target.value }))}
            className="input-field"
          >
            {CLIMATES.map(c => (
              <option key={c} value={c} className="bg-dark-800">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Companions */}
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
            <FiUsers className="w-4 h-4 text-sunset-400" /> Travel Companions
          </label>
          <div className="grid grid-cols-2 gap-2">
            {COMPANIONS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setForm(f => ({ ...f, travel_companions: c }))}
                className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all capitalize
                  ${form.travel_companions === c
                    ? 'bg-sunset-500/20 border-sunset-500/50 text-sunset-300'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
              >
                {c === 'solo' ? '🧳' : c === 'couple' ? '💑' : c === 'family' ? '👨‍👩‍👧' : '👥'} {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Precise Location Context */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
        <label className="block text-white/90 text-sm font-bold flex items-center gap-2">
          <FiMapPin className="w-4 h-4 text-primary-400" /> Precise Location Constraints
        </label>
        <p className="text-xs text-white/60">Help the AI provide strictly contextual recommendations by providing geography layers.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/70 text-xs font-medium mb-1.5">City (optional)</label>
              <input
                type="text"
                placeholder="e.g. Kyoto"
                className="input-field w-full text-sm py-2"
                value={form.city}
                onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-white/70 text-xs font-medium mb-1.5">State / Region (optional)</label>
              <input
                type="text"
                placeholder="e.g. Kansai"
                className="input-field w-full text-sm py-2"
                value={form.state}
                onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-white/70 text-xs font-medium mb-1.5">Country (optional)</label>
              <input
                type="text"
                placeholder="e.g. Japan"
                className="input-field w-full text-sm py-2"
                value={form.country}
                onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))}
              />
            </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || form.travel_type.length === 0}
        className="btn-primary w-full text-center py-4 text-base"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner w-5 h-5 inline-block" /> Getting AI Recommendations…
          </span>
        ) : (
          '🚀 Get AI-Powered Recommendations'
        )}
      </button>
    </form>
  )
}
