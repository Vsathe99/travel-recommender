import { FiCalendar, FiInfo, FiMapPin } from 'react-icons/fi'

function DayCard({ day, index }) {
  return (
    <div className="relative flex gap-5">
      {/* Timeline line */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
          {day.day}
        </div>
        <div className="w-px flex-1 bg-gradient-to-b from-indigo-200 to-transparent mt-2 min-h-[20px]" />
      </div>

      {/* Content */}
      <div className="pb-8 flex-1 min-w-0">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-[#1a1c2e]">{day.title}</h4>
          {day.estimated_cost && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">₹{day.estimated_cost}</span>
          )}
        </div>

        {day.theme && <p className="text-xs text-[#2d3142]/35 mb-3 italic">— {day.theme}</p>}

        {/* Activities */}
        <ul className="space-y-2 mb-4">
          {(day.activities || []).map((activity, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-[#2d3142]/60">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
              {activity}
            </li>
          ))}
        </ul>

        {/* Meals */}
        {day.meals && Object.keys(day.meals).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.entries(day.meals).map(([meal, desc]) => (
              <span key={meal} className="inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                <span className="font-semibold capitalize">{meal}:</span> {desc}
              </span>
            ))}
          </div>
        )}

        {/* Accommodation & Tips */}
        <div className="flex flex-wrap gap-3">
          {day.accommodation && (
            <span className="inline-flex items-center gap-1 text-xs text-[#2d3142]/40">
              <FiMapPin className="w-3 h-3 text-cyan-500" /> {day.accommodation}
            </span>
          )}
          {day.tips && (
            <span className="inline-flex items-center gap-1 text-xs text-[#2d3142]/40">
              <FiInfo className="w-3 h-3 text-amber-500" /> {day.tips}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ItineraryView({ itinerary = [], destination }) {
  if (!itinerary.length) return (
    <div className="py-20 text-center text-[#2d3142]/30 text-sm">No itinerary generated yet</div>
  )

  return (
    <div className="animate-slide-up">
      <h3 className="text-lg font-bold text-[#1a1c2e] mb-8 flex items-center gap-2">
        <FiCalendar className="w-5 h-5 text-indigo-500" />
        {itinerary.length}-Day Itinerary for {destination}
      </h3>
      <div className="pl-1">
        {itinerary.map((day, i) => (
          <DayCard key={i} day={day} index={i} />
        ))}
      </div>
    </div>
  )
}
