import { Link } from 'react-router-dom'
import { FiArrowRight, FiStar, FiMap, FiCalendar, FiDollarSign } from 'react-icons/fi'

const FEATURES = [
  { icon: '🧠', title: 'AI-Powered Rankings', desc: 'Grok LLM analyzes your preferences to recommend the perfect destinations' },
  { icon: '🗺️', title: 'Interactive Maps', desc: 'Explore destinations with Mapbox-powered interactive maps and attractions' },
  { icon: '🌤️', title: 'Live Weather', desc: 'Real-time weather data and 7-day forecasts for every destination' },
  { icon: '📅', title: 'Smart Itineraries', desc: 'Day-by-day AI-generated itineraries tailored to your travel style' },
  { icon: '💰', title: 'Budget Planner', desc: 'Detailed cost breakdowns with savings tips for any budget' },
  { icon: '📸', title: 'Photo Galleries', desc: 'Beautiful high-resolution images from Unsplash for every destination' },
]

const DESTINATIONS = ['Bali', 'Tokyo', 'Paris', 'Iceland', 'Santorini', 'Maldives']

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950 overflow-hidden">
      {/* Hero */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-ocean-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-900/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white/70 mb-8">
            ✨ Powered by xAI Grok · Mapbox · OpenWeather
          </div>

          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-tight mb-6">
            Discover Your
            <br />
            <span className="text-gradient">Perfect Trip</span>
          </h1>

          <p className="text-white/60 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-10">
            AI-powered travel recommendations tailored to your preferences,
            budget, and travel style. Plan smarter. Travel better.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
              Start Planning Free <FiArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-4">
              Sign in
            </Link>
          </div>

          {/* Floating destination pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-14">
            {DESTINATIONS.map((d, i) => (
              <div key={d}
                className="px-4 py-2 glass-card text-white/70 text-sm rounded-full"
                style={{ animationDelay: `${i * 0.2}s` }}>
                ✈️ {d}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="relative py-16 border-y border-white/10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '50+', label: 'Destinations' },
            { value: 'Grok AI', label: 'LLM Powered' },
            { value: '7-Day', label: 'Weather Forecast' },
            { value: 'Free', label: 'To Get Started' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-display text-3xl font-bold text-gradient">{value}</p>
              <p className="text-white/50 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="section-title">Everything You Need to Plan Your Dream Trip</h2>
          <p className="section-subtitle">Powered by AI, real data, and beautiful design</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="glass-card-hover p-6">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 border-t border-white/10">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="section-title mb-4">Ready to Explore the World?</h2>
          <p className="section-subtitle mb-8">Join thousands of travelers using AI to plan better trips</p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Get Started Free <FiArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-white/30 text-sm">
        Smart Travel Recommendation System · Built with React, FastAPI, Grok AI, Mapbox & OpenWeather
      </footer>
    </div>
  )
}
