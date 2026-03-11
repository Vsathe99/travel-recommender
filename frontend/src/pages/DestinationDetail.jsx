import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import WeatherWidget from '../components/WeatherWidget'
import ImageGallery from '../components/ImageGallery'
import { travelAPI } from '../api/client'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiMapPin, FiNavigation, FiCoffee, FiHome } from 'react-icons/fi'
import Map, { Marker, NavigationControl } from 'react-map-gl'

export default function DestinationDetail() {
  const { city } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [attractions, setAttractions] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [accommodations, setAccommodations] = useState([])
  const [loading, setLoading] = useState(true)

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY 

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [destRes, attrRes, restRes, accRes] = await Promise.all([
          travelAPI.getDestination(city),
          travelAPI.getAttractions(city),
          travelAPI.getRestaurants(city),
          travelAPI.getAccommodations(city),
        ])
        setData(destRes.data.data)
        setAttractions(attrRes.data.data || [])
        setRestaurants(restRes.data.data || [])
        setAccommodations(accRes.data.data || [])
      } catch {
        toast.error('Failed to load destination')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [city])

  if (loading) return (
    <div className="page-container flex items-center justify-center">
      <Navbar />
      <div className="spinner w-14 h-14 mt-20" />
    </div>
  )

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors text-sm">
          <FiArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <FiMapPin className="w-7 h-7 text-ocean-400" /> {city}
            </h1>
            {data?.geocode?.country && (
              <p className="text-white/60 mt-1 text-lg">{data.geocode.country}</p>
            )}
          </div>
          <button
            onClick={() => navigate(`/planner?destination=${encodeURIComponent(city)}`)}
            className="btn-primary flex items-center gap-2"
          >
            <FiNavigation className="w-4 h-4" /> Plan This Trip
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-6">
            {/* Images */}
            <div>
              <h2 className="font-display font-bold text-lg text-white mb-3">📸 Photos</h2>
              <ImageGallery images={data?.images || []} destination={city} />
            </div>

            {/* Attractions */}
            {attractions.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-lg text-white mb-3">🎭 Top Attractions</h2>
                <div className="space-y-2">
                  {attractions.slice(0, 8).map((a, i) => (
                    <div key={i} className="glass-card p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-ocean-500 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{a.name || a.full_name}</p>
                        {a.category && (
                          <p className="text-white/40 text-xs capitalize">{a.category.replace(/_/g, ' ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Weather */}
            <div>
              <h2 className="font-display font-bold text-lg text-white mb-3">🌤️ Weather</h2>
              <WeatherWidget
                weather={data?.weather}
                forecast={data?.forecast}
                suitability={data?.travel_suitability}
              />
            </div>

            {/* Location info */}
            {data?.geocode && (
              <div className="glass-card p-5">
                <h2 className="font-display font-bold text-lg text-white mb-4">📍 Location Details</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Coordinates</span>
                    <span className="text-white font-mono text-xs">
                      {data.geocode.coordinates?.lat?.toFixed(4)}, {data.geocode.coordinates?.lng?.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Country</span>
                    <span className="text-white">{data.geocode.country || '—'}</span>
                  </div>
                </div>

                {/* Mapbox Interactive Map */}
                <div className="h-[250px] rounded-xl overflow-hidden border border-white/10">
                  <Map
                    mapboxAccessToken={MAPBOX_TOKEN}
                    initialViewState={{
                      longitude: data.geocode.coordinates.lng,
                      latitude: data.geocode.coordinates.lat,
                      zoom: 12
                    }}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                  >
                    <NavigationControl position="bottom-right" />
                    <Marker longitude={data.geocode.coordinates.lng} latitude={data.geocode.coordinates.lat} color="red" />
                  </Map>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom sections for Food and Stays */}
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Restaurants */}
          <div>
            <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
              <FiCoffee className="w-5 h-5 text-sunset-400" /> Recommended Food Stops
            </h2>
            <div className="space-y-3">
              {restaurants.slice(0, 5).map((r, i) => (
                <div key={i} className="glass-card p-4">
                  <p className="text-white font-medium">{r.name}</p>
                  <p className="text-white/40 text-xs mt-1 capitalize">{r.category?.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Accommodations */}
          <div>
            <h2 className="font-display font-bold text-lg text-white mb-4 flex items-center gap-2">
              <FiHome className="w-5 h-5 text-emerald-400" /> Recommended Stays
            </h2>
            <div className="space-y-3">
              {accommodations.slice(0, 5).map((a, i) => (
                <div key={i} className="glass-card p-4">
                  <p className="text-white font-medium">{a.name}</p>
                  <p className="text-white/40 text-xs mt-1 capitalize">{a.category?.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
