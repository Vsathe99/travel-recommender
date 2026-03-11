import { FiCalendar, FiInfo, FiMapPin } from 'react-icons/fi'

function DayCard({ day }) {
  return (
    <div className="glass-card p-5 space-y-4">
      {/* Day header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-ocean-500 flex items-center justify-center font-bold text-sm shrink-0">
          {day.day}
        </div>
        <div>
          <h4 className="font-semibold text-white">{day.title}</h4>
          {day.theme && <p className="text-white/50 text-xs">{day.theme}</p>}
        </div>
        {day.estimated_cost && (
          <div className="ml-auto flex items-center gap-1 text-green-400 text-sm">
            <span className="font-bold">₹</span>
            {day.estimated_cost}
          </div>
        )}
      </div>

      {/* Activities */}
      <ul className="space-y-2">
        {(day.activities || []).map((activity, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-ocean-400 mt-2 shrink-0" />
            {activity}
          </li>
        ))}
      </ul>

      {/* Meals */}
      {day.meals && Object.keys(day.meals).length > 0 && (
        <div className="bg-white/5 rounded-xl p-3 space-y-1.5">
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">Meals</p>
          {Object.entries(day.meals).map(([meal, desc]) => (
            <div key={meal} className="flex gap-2 text-sm">
              <span className="text-primary-400 capitalize min-w-[80px]">{meal}:</span>
              <span className="text-white/60">{desc}</span>
            </div>
          ))}
        </div>
      )}

      {/* Accommodation & Tips */}
      <div className="grid grid-cols-2 gap-3">
        {day.accommodation && (
          <div className="flex items-start gap-2 text-sm text-white/60">
            <FiMapPin className="w-3.5 h-3.5 text-ocean-400 mt-0.5 shrink-0" />
            {day.accommodation}
          </div>
        )}
        {day.tips && (
          <div className="flex items-start gap-2 text-sm text-white/60">
            <FiInfo className="w-3.5 h-3.5 text-sunset-400 mt-0.5 shrink-0" />
            {day.tips}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ItineraryView({ itinerary = [], destination }) {
  if (!itinerary.length) return (
    <div className="glass-card p-8 text-center text-white/40">
      No itinerary generated yet
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <FiCalendar className="w-5 h-5 text-primary-400" />
        <h3 className="font-display font-bold text-xl text-white">
          {itinerary.length}-Day Itinerary for {destination}
        </h3>
      </div>
      {itinerary.map((day, i) => (
        <DayCard key={i} day={day} />
      ))}
    </div>
  )
}
