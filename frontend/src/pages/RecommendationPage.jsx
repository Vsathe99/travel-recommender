import { useState } from 'react'
import Navbar from '../components/Navbar'
import PreferencesForm from '../components/PreferencesForm'
import DestinationCard from '../components/DestinationCard'
import { travelAPI } from '../api/client'
import toast from 'react-hot-toast'
import { FiRefreshCw, FiCompass } from 'react-icons/fi'

export default function RecommendationPage() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastPrefs, setLastPrefs] = useState(null)

  const handleRecommend = async (prefs) => {
    setLoading(true)
    setLastPrefs(prefs)
    try {
      const { data } = await travelAPI.recommend(prefs)
      setRecommendations(data.data || [])
      if ((data.data || []).length === 0) toast('No recommendations found. Try different preferences.', { icon: '🗺️' })
      else toast.success(`Found ${data.data.length} destinations!`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Recommendation failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* Page header */}
        <div className="mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
            <FiCompass className="w-3.5 h-3.5" /> AI-Powered
          </div>
          <h1 className="section-title">Discover your next destination</h1>
          <p className="section-subtitle">Tell us your preferences and Grok AI will rank the best destinations for you</p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-10">
          {/* Preferences - sticky sidebar */}
          <div>
            <div className="lg:sticky lg:top-28">
              <div className="glass-gradient p-6">
                <h2 className="font-bold text-base text-[#1a1c2e] mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Preferences
                </h2>
                <PreferencesForm onSubmit={handleRecommend} loading={loading} />
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="spinner w-12 h-12 mb-6" />
                <h3 className="text-lg font-bold text-[#1a1c2e] mb-2">Analyzing destinations…</h3>
                <p className="text-sm text-[#2d3142]/40 max-w-xs">Fetching weather, analyzing preferences, ranking destinations</p>
              </div>
            )}

            {!loading && recommendations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-5 animate-float">🌍</div>
                <h3 className="text-lg font-bold text-[#1a1c2e] mb-2">Ready to Discover</h3>
                <p className="text-sm text-[#2d3142]/40 max-w-xs">Fill in your preferences and let AI find the perfect destinations</p>
              </div>
            )}

            {!loading && recommendations.length > 0 && (
              <div className="animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#1a1c2e]">
                    Top {recommendations.length} Destinations
                  </h2>
                  <button onClick={() => handleRecommend(lastPrefs)}
                    className="btn-secondary py-2 px-4 text-sm">
                    <FiRefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {recommendations.map((rec, i) => (
                    <DestinationCard key={i} destination={rec} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
