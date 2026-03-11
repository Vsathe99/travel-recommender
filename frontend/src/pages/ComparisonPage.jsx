import { useState } from 'react'
import Navbar from '../components/Navbar'
import ComparisonTable from '../components/ComparisonTable'
import { travelAPI } from '../api/client'
import toast from 'react-hot-toast'
import { FiPlus, FiX, FiRefreshCw } from 'react-icons/fi'

const POPULAR = ['Paris', 'Bali', 'Tokyo', 'New York', 'Santorini', 'Maldives', 'Iceland', 'Bangkok']

export default function ComparisonPage() {
  const [cities, setCities] = useState([])
  const [input, setInput] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const addCity = (city) => {
    const trimmed = city.trim()
    if (!trimmed) return
    if (cities.includes(trimmed)) return toast.error(`${trimmed} already added`)
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
    } catch {
      toast.error('Comparison failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="section-title mb-2">⚖️ Destination Comparison</h1>
        <p className="section-subtitle mb-8">Compare up to 4 destinations side-by-side</p>

        {/* Input */}
        <div className="glass-card p-6 mb-8">
          <div className="flex gap-3 mb-4">
            <input type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCity(input)}
              placeholder="Add a destination (e.g. Paris, Tokyo…)"
              className="input-field" />
            <button onClick={() => addCity(input)} className="btn-primary px-5">
              <FiPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Popular quick-adds */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-white/40 text-xs self-center">Quick add:</span>
            {POPULAR.filter(p => !cities.includes(p)).slice(0, 6).map(p => (
              <button key={p} onClick={() => addCity(p)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-white/60 hover:text-white transition-all">
                + {p}
              </button>
            ))}
          </div>

          {/* Selected cities */}
          {cities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {cities.map(c => (
                <div key={c} className="flex items-center gap-2 px-3 py-1.5 bg-primary-600/20 border border-primary-500/30 rounded-full text-sm text-primary-300">
                  <span>✈️ {c}</span>
                  <button onClick={() => removeCity(c)} className="hover:text-red-400 transition-colors">
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {cities.length >= 2 && (
                <button onClick={compare} disabled={loading}
                  className="btn-primary py-2 px-5 text-sm flex items-center gap-2 ml-auto">
                  {loading ? <span className="spinner w-4 h-4 inline-block" /> : <FiRefreshCw className="w-4 h-4" />}
                  {loading ? 'Comparing…' : 'Compare Now'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="animate-slide-up">
            <h2 className="font-display font-bold text-xl text-white mb-4">Comparison Results</h2>
            <ComparisonTable data={results} />
          </div>
        )}
      </div>
    </div>
  )
}
