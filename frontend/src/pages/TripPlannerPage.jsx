import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ItineraryView from '../components/ItineraryView'
import BudgetPlanner from '../components/BudgetPlanner'
import { travelAPI, tripAPI } from '../api/client'
import toast from 'react-hot-toast'
import { FiCalendar, FiDollarSign, FiSave, FiUsers, FiMap } from 'react-icons/fi'

export default function TripPlannerPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initDest = searchParams.get('destination') || ''

  const [form, setForm] = useState({
    destination: initDest, duration: 5, budget: 50000,
    travel_type: ['city'], travel_companions: 'solo', travel_style: 'mid-range',
  })
  const [tab, setTab] = useState('itinerary')
  const [itinerary, setItinerary] = useState([])
  const [budgetData, setBudgetData] = useState(null)
  const [loadingItinerary, setLoadingItinerary] = useState(false)
  const [loadingBudget, setLoadingBudget] = useState(false)
  const [saving, setSaving] = useState(false)

  const generateItinerary = async () => {
    if (!form.destination) return toast.error('Enter a destination')
    setLoadingItinerary(true); setTab('itinerary')
    try {
      const { data } = await travelAPI.generateItinerary({ destination: form.destination, duration: form.duration, travel_type: form.travel_type, budget: form.budget, travel_companions: form.travel_companions })
      setItinerary(data.data.itinerary || [])
      toast.success(`${form.duration}-day itinerary ready!`)
    } catch { toast.error('Itinerary generation failed') }
    finally { setLoadingItinerary(false) }
  }

  const estimateBudget = async () => {
    if (!form.destination) return toast.error('Enter a destination')
    setLoadingBudget(true); setTab('budget')
    try {
      const { data } = await travelAPI.budgetEstimate({ destination: form.destination, duration: form.duration, total_budget: form.budget, travel_companions: form.travel_companions, travel_style: form.travel_style })
      setBudgetData(data.data)
      toast.success('Budget estimate ready!')
    } catch { toast.error('Budget estimation failed') }
    finally { setLoadingBudget(false) }
  }

  const saveTrip = async () => {
    if (!itinerary.length && !budgetData) return toast.error('Generate itinerary or budget first')
    setSaving(true)
    try {
      await tripAPI.save({ destination: form.destination, duration: form.duration, budget: form.budget, travel_type: form.travel_type, itinerary, budget_breakdown: budgetData || {} })
      toast.success('Trip saved! ✅'); navigate('/saved-trips')
    } catch { toast.error('Failed to save trip') }
    finally { setSaving(false) }
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-600 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-3">
              <FiMap className="w-3.5 h-3.5" /> Trip Planner
            </div>
            <h1 className="section-title">Plan your journey</h1>
            <p className="section-subtitle">Generate AI itineraries and budget breakdowns</p>
          </div>
          {(itinerary.length > 0 || budgetData) && (
            <button onClick={saveTrip} disabled={saving} className="btn-primary">
              <FiSave className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Trip'}
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-[340px_1fr] gap-10">
          {/* Settings - sticky sidebar */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="glass-gradient p-6 space-y-5">
              <h2 className="font-bold text-base text-[#1a1c2e] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500" /> Trip Details
              </h2>

              <div>
                <label className="block text-[#2d3142]/50 text-xs font-semibold uppercase tracking-wider mb-2">Destination</label>
                <input type="text" value={form.destination}
                  onChange={(e) => setForm(f => ({ ...f, destination: e.target.value }))}
                  placeholder="e.g., Bali, Paris, Tokyo…" className="input-field" />
              </div>

              <div>
                <label className="flex items-center justify-between text-[#2d3142]/50 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span><FiCalendar className="w-3 h-3 inline mr-1" /> Duration</span>
                  <span className="text-violet-600 text-sm font-bold normal-case">{form.duration}d</span>
                </label>
                <input type="range" min={2} max={30} value={form.duration}
                  onChange={(e) => setForm(f => ({ ...f, duration: Number(e.target.value) }))} className="w-full" />
              </div>

              <div>
                <label className="flex items-center justify-between text-[#2d3142]/50 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span><FiDollarSign className="w-3 h-3 inline mr-1" /> Budget</span>
                  <span className="text-emerald-600 text-sm font-bold normal-case">₹{form.budget.toLocaleString('en-IN')}</span>
                </label>
                <input type="range" min={5000} max={500000} step={1000} value={form.budget}
                  onChange={(e) => setForm(f => ({ ...f, budget: Number(e.target.value) }))} className="w-full" />
              </div>

              <div>
                <label className="block text-[#2d3142]/50 text-xs font-semibold uppercase tracking-wider mb-2">
                  <FiUsers className="w-3 h-3 inline mr-1" /> Companions
                </label>
                <select value={form.travel_companions}
                  onChange={(e) => setForm(f => ({ ...f, travel_companions: e.target.value }))}
                  className="input-field text-sm">
                  {['solo', 'couple', 'family', 'friends'].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[#2d3142]/50 text-xs font-semibold uppercase tracking-wider mb-2">Style</label>
                <div className="flex gap-2">
                  {['budget', 'mid-range', 'luxury'].map(s => (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, travel_style: s }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all duration-300
                        ${form.travel_style === s
                          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                          : 'bg-black/[0.03] text-[#2d3142]/50 hover:bg-black/[0.06]'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={generateItinerary} disabled={loadingItinerary} className="btn-primary py-3 text-xs">
                  {loadingItinerary ? '⏳ Working…' : '📅 Itinerary'}
                </button>
                <button onClick={estimateBudget} disabled={loadingBudget} className="btn-secondary py-3 text-xs">
                  {loadingBudget ? '⏳ Working…' : '💰 Budget'}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            <div className="flex gap-2 mb-6">
              {['itinerary', 'budget'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-300
                    ${tab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-[#2d3142]/40 hover:text-[#2d3142]/60'}`}>
                  {t === 'itinerary' ? '📅 Itinerary' : '💰 Budget'}
                </button>
              ))}
            </div>

            {tab === 'itinerary' && (
              loadingItinerary
                ? <div className="py-24 text-center"><div className="spinner w-10 h-10 mx-auto mb-4" /><p className="text-sm text-[#2d3142]/35">Building your itinerary…</p></div>
                : <ItineraryView itinerary={itinerary} destination={form.destination} />
            )}
            {tab === 'budget' && (
              loadingBudget
                ? <div className="py-24 text-center"><div className="spinner w-10 h-10 mx-auto mb-4" /><p className="text-sm text-[#2d3142]/35">Estimating costs…</p></div>
                : <BudgetPlanner budget={budgetData} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
