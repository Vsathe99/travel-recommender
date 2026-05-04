import { useState } from 'react'
import Navbar from '../components/Navbar'
import ComparisonTable from '../components/ComparisonTable'
import { travelAPI } from '../api/client'
import toast from 'react-hot-toast'
import { FiPlus, FiX, FiRefreshCw, FiBarChart2 } from 'react-icons/fi'

const POPULAR = ['Paris', 'Bali', 'Tokyo', 'New York', 'Santorini', 'Maldives', 'Iceland', 'Bangkok']

export default function ComparisonPage() {
  const [cities, setCities] = useState([])
  const [input, setInput] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const addCity = (city) => {
    const trimmed = city.trim()
    if (!trimmed || cities.includes(trimmed)) return
    if (cities.length >= 4) return toast.error('Maximum 4 destinations')
    setCities(c => [...c, trimmed])
    setInput('')
  }

  const removeCity = (city) => setCities(c => c.filter(x => x !== city))

  const compare = async () => {
    if (cities.length < 2) return toast.error('Add at least 2 destinations')
    setLoading(true)
    try {
      const { data } = await travelAPI.compareDestinations(cities)
      setResults(data.data || [])
      toast.success('Comparison ready!')
    } catch { toast.error('Comparison failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-3">
            <FiBarChart2 className="w-3.5 h-3.5" /> Compare
          </div>
          <h1 className="section-title">Compare Destinations</h1>
          <p className="section-subtitle">Side-by-side analysis of up to 4 destinations</p>
        </div>

        {/* Input area */}
        <div className="glass-gradient p-6 mb-8">
          <div className="flex gap-3 mb-4">
            <input type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCity(input)}
              placeholder="Add a destination…"
              className="input-field" />
            <button onClick={() => addCity(input)} className="btn-primary px-5">
              <FiPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Quick adds */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-[10px] text-[#2d3142]/30 uppercase tracking-wider self-center mr-1">Quick add</span>
            {POPULAR.filter(p => !cities.includes(p)).slice(0, 6).map(p => (
              <button key={p} onClick={() => addCity(p)}
                className="px-3 py-1 bg-black/[0.03] hover:bg-indigo-50 hover:text-indigo-600 rounded-full text-xs text-[#2d3142]/45 transition-all">
                + {p}
              </button>
            ))}
          </div>

          {/* Selected */}
          {cities.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {cities.map(c => (
                <div key={c} className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium">
                  ✈️ {c}
                  <button onClick={() => removeCity(c)} className="hover:text-red-500 transition-colors">
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {cities.length >= 2 && (
                <button onClick={compare} disabled={loading} className="btn-primary py-2 px-5 text-sm ml-auto">
                  {loading ? <span className="spinner w-4 h-4" /> : <FiRefreshCw className="w-4 h-4" />}
                  {loading ? 'Comparing…' : 'Compare'}
                </button>
              )}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="animate-slide-up">
            <ComparisonTable data={results} />
          </div>
        )}
      </div>
    </div>
  )
}
