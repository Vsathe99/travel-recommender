import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ItineraryView from '../components/ItineraryView'
import BudgetPlanner from '../components/BudgetPlanner'
import { travelAPI, tripAPI } from '../api/client'
import toast from 'react-hot-toast'
import { FiCalendar, FiDollarSign, FiSave, FiUsers } from 'react-icons/fi'

const TABS = ['itinerary', 'budget']

export default function TripPlannerPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initDest = searchParams.get('destination') || ''

  const [form, setForm] = useState({
    destination: initDest,
    duration: 5,
    budget: 50000,
    travel_type: ['city'],
    travel_companions: 'solo',
    travel_style: 'mid-range',
  })
  const [tab, setTab] = useState('itinerary')
  const [itinerary, setItinerary] = useState([])
  const [budgetData, setBudgetData] = useState(null)
  const [loadingItinerary, setLoadingItinerary] = useState(false)
  const [loadingBudget, setLoadingBudget] = useState(false)
  const [saving, setSaving] = useState(false)

  const generateItinerary = async () => {
    if (!form.destination) return toast.error('Enter a destination')
    setLoadingItinerary(true)
    setTab('itinerary')
    try {
      const { data } = await travelAPI.generateItinerary({
        destination: form.destination,
        duration: form.duration,
        travel_type: form.travel_type,
        budget: form.budget,
        travel_companions: form.travel_companions,
      })
      setItinerary(data.data.itinerary || [])
      toast.success(`${form.duration}-day itinerary ready!`)
    } catch {
      toast.error('Itinerary generation failed')
    } finally {
      setLoadingItinerary(false)
    }
  }

  const estimateBudget = async () => {
    if (!form.destination) return toast.error('Enter a destination')
    setLoadingBudget(true)
    setTab('budget')
    try {
      const { data } = await travelAPI.budgetEstimate({
        destination: form.destination,
        duration: form.duration,
        total_budget: form.budget,
        travel_companions: form.travel_companions,
        travel_style: form.travel_style,
      })
      setBudgetData(data.data)
      toast.success('Budget estimate ready!')
    } catch {
      toast.error('Budget estimation failed')
    } finally {
      setLoadingBudget(false)
    }
  }

  const saveTrip = async () => {
    if (!itinerary.length && !budgetData) return toast.error('Generate itinerary or budget first')
    setSaving(true)
    try {
      await tripAPI.save({
        destination: form.destination,
        duration: form.duration,
        budget: form.budget,
        travel_type: form.travel_type,
        itinerary: itinerary,
        budget_breakdown: budgetData || {},
      })
      toast.success('Trip saved! ✅')
      navigate('/saved-trips')
    } catch {
      toast.error('Failed to save trip')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="section-title">✈️ Trip Planner</h1>
            <p className="section-subtitle">Generate AI itineraries and budget breakdowns</p>
          </div>
          {(itinerary.length > 0 || budgetData) && (
            <button onClick={saveTrip} disabled={saving} className="btn-primary flex items-center gap-2">
              <FiSave className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Trip'}
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-8">
          {/* Settings Panel */}
          <div className="glass-card p-6 space-y-5 h-fit">
            <h2 className="font-display font-bold text-lg text-white">Trip Details</h2>

            <div>
              <label className="block text-white/70 text-sm mb-1.5">Destination</label>
              <input type="text" value={form.destination}
                onChange={(e) => setForm(f => ({ ...f, destination: e.target.value }))}
                placeholder="e.g., Bali, Paris, Tokyo…"
                className="input-field" />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1.5 flex items-center gap-1">
                <FiCalendar className="w-3.5 h-3.5" /> Duration: {form.duration} days
              </label>
              <input type="range" min={2} max={30} value={form.duration}
                onChange={(e) => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
                className="w-full accent-primary-500" />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1.5 flex items-center gap-1">
                <FiDollarSign className="w-3.5 h-3.5" /> Budget: ₹{form.budget.toLocaleString('en-IN')}
              </label>
              <input type="range" min={5000} max={500000} step={1000} value={form.budget}
                onChange={(e) => setForm(f => ({ ...f, budget: Number(e.target.value) }))}
                className="w-full accent-green-500" />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1.5 flex items-center gap-1">
                <FiUsers className="w-3.5 h-3.5" /> Companions
              </label>
              <select value={form.travel_companions}
                onChange={(e) => setForm(f => ({ ...f, travel_companions: e.target.value }))}
                className="input-field">
                {['solo', 'couple', 'family', 'friends'].map(c => (
                  <option key={c} value={c} className="bg-dark-800 capitalize">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1.5">Travel Style</label>
              <select value={form.travel_style}
                onChange={(e) => setForm(f => ({ ...f, travel_style: e.target.value }))}
                className="input-field">
                {['budget', 'mid-range', 'luxury'].map(s => (
                  <option key={s} value={s} className="bg-dark-800 capitalize">{s}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={generateItinerary} disabled={loadingItinerary}
                className="btn-primary py-3 text-sm">
                {loadingItinerary ? '⏳ Generating…' : '📅 Itinerary'}
              </button>
              <button onClick={estimateBudget} disabled={loadingBudget}
                className="btn-secondary py-3 text-sm">
                {loadingBudget ? '⏳ Estimating…' : '💰 Budget'}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div>
            {/* Tab switcher */}
            <div className="flex gap-2 mb-6">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-xl text-sm font-medium capitalize border transition-all
                    ${tab === t ? 'bg-primary-600/20 border-primary-500/50 text-primary-400' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                  {t === 'itinerary' ? '📅 Itinerary' : '💰 Budget'}
                </button>
              ))}
            </div>

            {tab === 'itinerary' && (
              loadingItinerary
                ? <div className="glass-card p-16 text-center"><div className="spinner w-12 h-12 mx-auto mb-4" /><p className="text-white/50">Grok AI is building your itinerary…</p></div>
                : <ItineraryView itinerary={itinerary} destination={form.destination} />
            )}
            {tab === 'budget' && (
              loadingBudget
                ? <div className="glass-card p-16 text-center"><div className="spinner w-12 h-12 mx-auto mb-4" /><p className="text-white/50">Estimating costs…</p></div>
                : <BudgetPlanner budget={budgetData} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
