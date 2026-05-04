import { useState } from 'react'
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
const COMPANION_ICONS = { solo: '🧳', couple: '💑', family: '👨‍👩‍👧', friends: '👥' }

export default function PreferencesForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    travel_type: ['beach'],
    budget: 50000,
    duration: 7,
    preferred_climate: 'warm',
    travel_companions: 'solo',
    preferred_regions: [],
    city: '', state: '', country: '',
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
      {/* Travel Type - flowing chips */}
      <div>
        <label className="block text-[#2d3142]/50 text-xs font-semibold uppercase tracking-wider mb-3">
          Travel Type
        </label>
        <div className="flex flex-wrap gap-2">
          {TRAVEL_TYPES.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => toggleType(value)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-300
                ${form.travel_type.includes(value)
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-black/[0.03] text-[#2d3142]/50 hover:bg-black/[0.06] hover:text-[#2d3142]/70'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="flex items-center justify-between text-[#2d3142]/50 text-xs font-semibold uppercase tracking-wider mb-3">
          <span className="flex items-center gap-1.5"><FiDollarSign className="w-3.5 h-3.5 text-emerald-500" /> Budget</span>
          <span className="text-emerald-600 text-sm font-bold normal-case">₹{form.budget.toLocaleString()}</span>
        </label>
        <input type="range" min="5000" max="500000" step="1000" value={form.budget}
          onChange={(e) => setForm(f => ({ ...f, budget: Number(e.target.value) }))}
          className="w-full" />
      </div>

      {/* Duration */}
      <div>
        <label className="flex items-center justify-between text-[#2d3142]/50 text-xs font-semibold uppercase tracking-wider mb-3">
          <span className="flex items-center gap-1.5"><FiCalendar className="w-3.5 h-3.5 text-violet-500" /> Duration</span>
          <span className="text-violet-600 text-sm font-bold normal-case">{form.duration} days</span>
        </label>
        <input type="range" min="2" max="30" value={form.duration}
          onChange={(e) => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
          className="w-full" />
      </div>

      {/* Climate */}
      <div>
        <label className="block text-[#2d3142]/50 text-xs font-semibold uppercase tracking-wider mb-3">
          <FiWind className="w-3.5 h-3.5 text-cyan-500 inline mr-1.5" /> Climate
        </label>
        <select value={form.preferred_climate}
          onChange={(e) => setForm(f => ({ ...f, preferred_climate: e.target.value }))}
          className="input-field text-sm">
          {CLIMATES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {/* Companions - flowing pills */}
      <div>
        <label className="block text-[#2d3142]/50 text-xs font-semibold uppercase tracking-wider mb-3">
          <FiUsers className="w-3.5 h-3.5 text-amber-500 inline mr-1.5" /> Companions
        </label>
        <div className="flex flex-wrap gap-2">
          {COMPANIONS.map(c => (
            <button key={c} type="button"
              onClick={() => setForm(f => ({ ...f, travel_companions: c }))}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-300 capitalize
                ${form.travel_companions === c
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                  : 'bg-black/[0.03] text-[#2d3142]/50 hover:bg-black/[0.06]'}`}>
              {COMPANION_ICONS[c]} {c}
            </button>
          ))}
        </div>
      </div>

      {/* Location context - subtle section */}
      <div className="pt-3 border-t border-black/[0.04]">
        <label className="block text-[#2d3142]/50 text-xs font-semibold uppercase tracking-wider mb-3">
          <FiMapPin className="w-3.5 h-3.5 text-rose-400 inline mr-1.5" /> Location Focus <span className="normal-case font-normal text-[#2d3142]/30">(optional)</span>
        </label>
        <div className="space-y-2">
          {[
            { key: 'city', placeholder: 'City — e.g. Kyoto' },
            { key: 'state', placeholder: 'State/Region — e.g. Kansai' },
            { key: 'country', placeholder: 'Country — e.g. Japan' },
          ].map(({ key, placeholder }) => (
            <input key={key} type="text" placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="input-field text-sm py-2.5" />
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading || form.travel_type.length === 0}
        className="btn-primary w-full py-3.5 text-sm mt-2">
        {loading ? (
          <span className="flex items-center gap-2"><span className="spinner w-4 h-4" /> Analyzing…</span>
        ) : '🚀 Get Recommendations'}
      </button>
    </form>
  )
}
