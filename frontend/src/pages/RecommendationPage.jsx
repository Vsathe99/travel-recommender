import { useState } from 'react'
import Navbar from '../components/Navbar'
import PreferencesForm from '../components/PreferencesForm'
import DestinationCard from '../components/DestinationCard'
import { travelAPI } from '../api/client'
import toast from 'react-hot-toast'
import { FiRefreshCw } from 'react-icons/fi'

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
      if ((data.data || []).length === 0) {
        toast('No recommendations found. Try different preferences.', { icon: '🗺️' })
      } else {
        toast.success(`Found ${data.data.length} destinations!`)
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Recommendation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="section-title">
            🧠 AI Travel Recommendations
          </h1>
          <p className="section-subtitle">Tell us your preferences and Grok AI will rank the best destinations for you</p>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          {/* Preferences panel */}
          <div className="space-y-4">
            <div className="glass-card p-6">
              <h2 className="font-display font-bold text-lg text-white mb-5">Your Preferences</h2>
              <PreferencesForm onSubmit={handleRecommend} loading={loading} />
            </div>
          </div>

          {/* Results */}
          <div>
            {loading && (
              <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
                <div className="spinner w-14 h-14 mb-5" />
                <h3 className="font-display font-bold text-xl text-white mb-2">
                  Grok AI is analyzing destinations…
                </h3>
                <p className="text-white/50">Fetching weather data, analyzing your preferences, ranking destinations…</p>
              </div>
            )}

            {!loading && recommendations.length === 0 && (
              <div className="glass-card p-16 text-center">
                <div className="text-6xl mb-4">✈️</div>
                <h3 className="font-display font-bold text-xl text-white mb-2">
                  Ready to Discover
                </h3>
                <p className="text-white/50">Fill in your travel preferences and let AI find the perfect destinations for you</p>
              </div>
            )}

            {!loading && recommendations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-xl text-white">
                    🎯 Top {recommendations.length} Destinations
                  </h2>
                  <button onClick={() => handleRecommend(lastPrefs)}
                    className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
                    <FiRefreshCw className="w-4 h-4" /> Refresh
                  </button>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
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
