import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import WeatherWidget from '../components/WeatherWidget'
import ImageGallery from '../components/ImageGallery'
import { travelAPI, interactionAPI, cfAPI } from '../api/client'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiMapPin, FiNavigation, FiCoffee, FiHome, FiHeart, FiArrowUpRight } from 'react-icons/fi'
import Map, { Marker, NavigationControl } from 'react-map-gl'

export default function DestinationDetail() {
  const { city } = useParams()
  const [searchParams] = useSearchParams()
  const country = searchParams.get('country') || ''
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [attractions, setAttractions] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [accommodations, setAccommodations] = useState([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [similarDests, setSimilarDests] = useState([])
  const [similarLoading, setSimilarLoading] = useState(false)

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [destRes, attrRes, restRes, accRes] = await Promise.all([
          travelAPI.getDestination(city, country),
          travelAPI.getAttractions(city, undefined, country),
          travelAPI.getRestaurants(city, country),
          travelAPI.getAccommodations(city, country),
        ])
        setData(destRes.data.data)
        setAttractions(attrRes.data.data || [])
        setRestaurants(restRes.data.data || [])
        setAccommodations(accRes.data.data || [])
      } catch { toast.error('Failed to load destination') }
      finally { setLoading(false) }
    }
    fetchAll()

    // Log view interaction for CF
    interactionAPI.log({
      destination_name: city,
      country: country,
      interaction_type: 'view',
      weight: 1.0,
    }).catch(() => {}) // silently fail

    // Fetch similar destinations
    setSimilarLoading(true)
    cfAPI.similarByName(city)
      .then(r => setSimilarDests(r.data.data || []))
      .catch(() => {})
      .finally(() => setSimilarLoading(false))
  }, [city, country])

  const handleLike = async () => {
    if (liked) return
    setLiked(true)
    try {
      await interactionAPI.log({
        destination_name: city,
        country: country,
        interaction_type: 'like',
        weight: 3.0,
      })
      toast.success('Added to your liked destinations!')
    } catch {
      toast.error('Failed to like destination')
      setLiked(false)
    }
  }

  if (loading) return (
    <div className="page-container flex items-center justify-center">
      <Navbar />
      <div className="spinner w-12 h-12 mt-20" />
    </div>
  )

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#2d3142]/40 hover:text-indigo-500 mb-8 text-sm font-medium transition-colors">
          <FiArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header - asymmetric */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#2d3142]/40 mb-2">
              <FiMapPin className="w-3.5 h-3.5" />
              {data?.geocode?.country && <span>{data.geocode.country}</span>}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1a1c2e] tracking-tight">{city}</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={handleLike}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                liked
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                  : 'bg-white/70 backdrop-blur-md text-[#2d3142]/40 hover:bg-rose-50 hover:text-rose-500 border border-white/50'
              }`}
              title="Like this destination">
              <FiHeart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </button>
            <button onClick={() => navigate(`/planner?destination=${encodeURIComponent(city)}`)}
              className="btn-primary">
              <FiNavigation className="w-4 h-4" /> Plan This Trip
            </button>
          </div>
        </div>

        {/* Main content - staggered layout */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Left */}
          <div className="space-y-8">
            <ImageGallery images={data?.images || []} destination={city} />

            {/* Attractions - numbered list with accent */}
            {attractions.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-[#1a1c2e] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" /> Top Attractions
                </h2>
                <div className="space-y-2">
                  {attractions.slice(0, 8).map((a, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 px-4 rounded-2xl hover:bg-white/50 transition-all group">
                      <span className="text-xs font-bold text-indigo-400 w-6 text-center">{String(i + 1).padStart(2, '0')}</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-indigo-100 to-transparent max-w-[40px]" />
                      <div className="flex-1">
                        <p className="text-[#1a1c2e] text-sm font-medium group-hover:text-indigo-600 transition-colors">{a.name || a.full_name}</p>
                        {a.category && <p className="text-[#2d3142]/30 text-xs capitalize mt-0.5">{a.category.replace(/_/g, ' ')}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Food & Stays - horizontal scroll */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-bold text-[#1a1c2e] mb-4 flex items-center gap-2">
                  <FiCoffee className="w-4 h-4 text-amber-500" /> Food Stops
                </h2>
                <div className="space-y-2">
                  {restaurants.slice(0, 5).map((r, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-amber-50/50 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-xs">🍽️</div>
                      <div>
                        <p className="text-sm font-medium text-[#1a1c2e]">{r.name}</p>
                        <p className="text-xs text-[#2d3142]/30 capitalize">{r.category?.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1a1c2e] mb-4 flex items-center gap-2">
                  <FiHome className="w-4 h-4 text-emerald-500" /> Stays
                </h2>
                <div className="space-y-2">
                  {accommodations.slice(0, 5).map((a, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-emerald-50/50 transition-all">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-xs">🏨</div>
                      <div>
                        <p className="text-sm font-medium text-[#1a1c2e]">{a.name}</p>
                        <p className="text-xs text-[#2d3142]/30 capitalize">{a.category?.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Similar Destinations (CF-powered) ── */}
            {similarDests.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-[#1a1c2e] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> You Might Also Like
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {similarDests.slice(0, 6).map((dest, i) => (
                    <div
                      key={dest.id || i}
                      onClick={() => navigate(`/destination/${encodeURIComponent(dest.name)}${dest.country ? `?country=${encodeURIComponent(dest.country)}` : ''}`)}
                      className="group relative rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-500 hover:shadow-xl hover:shadow-black/[0.06]"
                    >
                      <div className="relative h-32 overflow-hidden">
                        <img
                          src={`https://source.unsplash.com/400x300/?${dest.name},travel`}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-white font-semibold text-sm">{dest.name}</p>
                          <p className="text-white/60 text-xs flex items-center gap-1">
                            <FiMapPin className="w-2.5 h-2.5" /> {dest.country}
                          </p>
                        </div>
                      </div>
                      <div className="bg-white/70 backdrop-blur-md p-3 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {(dest.travel_type || []).slice(0, 2).map((t, j) => (
                            <span key={j} className="text-[9px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full capitalize">{t}</span>
                          ))}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white text-indigo-400 transition-all">
                          <FiArrowUpRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {similarLoading && (
              <div className="flex items-center gap-3 text-sm text-[#2d3142]/30">
                <div className="spinner w-5 h-5" /> Finding similar destinations…
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6 lg:sticky lg:top-28 h-fit">
            <WeatherWidget weather={data?.weather} forecast={data?.forecast} suitability={data?.travel_suitability} />

            {/* Map */}
            {data?.geocode?.coordinates && (
              <div className="rounded-2xl overflow-hidden border border-white/50 shadow-lg" style={{ height: 240 }}>
                <Map
                  mapboxAccessToken={MAPBOX_TOKEN}
                  initialViewState={{ longitude: data.geocode.coordinates.lng, latitude: data.geocode.coordinates.lat, zoom: 12 }}
                  mapStyle="mapbox://styles/mapbox/light-v11"
                >
                  <NavigationControl position="bottom-right" />
                  <Marker longitude={data.geocode.coordinates.lng} latitude={data.geocode.coordinates.lat} color="#6366f1" />
                </Map>
              </div>
            )}

            {/* Coords */}
            {data?.geocode && (
              <div className="flex items-center justify-between text-xs text-[#2d3142]/30 px-2">
                <span>{data.geocode.country}</span>
                <span className="font-mono">{data.geocode.coordinates?.lat?.toFixed(4)}, {data.geocode.coordinates?.lng?.toFixed(4)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
