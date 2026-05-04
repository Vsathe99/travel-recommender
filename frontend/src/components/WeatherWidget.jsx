import { FiThermometer, FiDroplet, FiWind, FiEye } from 'react-icons/fi'
import { getSuitabilityColor } from '../utils/helpers'

export default function WeatherWidget({ weather, forecast, suitability }) {
  if (!weather) return (
    <div className="glass p-6 text-center text-[#2d3142]/30 text-sm">Weather data unavailable</div>
  )

  return (
    <div className="glass p-5 space-y-5">
      {/* Current weather - organic layout */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#2d3142]/40 uppercase tracking-wider font-medium">Current Weather</p>
          <p className="text-4xl font-bold text-[#1a1c2e] mt-1 tracking-tight">{weather.temperature}°C</p>
          <p className="text-sm text-[#2d3142]/50 mt-1 capitalize">{weather.description}</p>
        </div>
        {weather.icon_url && <img src={weather.icon_url} alt="" className="w-16 h-16 -mr-2 -mt-2" />}
      </div>

      {/* Stats - flowing row */}
      <div className="flex gap-3">
        {[
          { icon: FiThermometer, val: `${weather.feels_like}°C`, label: 'Feels' },
          { icon: FiDroplet, val: `${weather.humidity}%`, label: 'Humidity' },
          { icon: FiWind, val: `${weather.wind_speed}`, label: 'm/s' },
        ].map(({ icon: Icon, val, label }) => (
          <div key={label} className="flex-1 bg-black/[0.02] rounded-xl py-3 text-center">
            <Icon className="w-3.5 h-3.5 text-indigo-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-[#1a1c2e]">{val}</p>
            <p className="text-[10px] text-[#2d3142]/35">{label}</p>
          </div>
        ))}
      </div>

      {/* Suitability */}
      {suitability && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#2d3142]/40">Suitability</span>
          <span className={`badge border ${getSuitabilityColor(suitability)}`}>{suitability}</span>
        </div>
      )}

      {/* Forecast - minimal bar chart style */}
      {forecast?.length > 0 && (
        <div>
          <p className="text-[10px] text-[#2d3142]/30 uppercase tracking-widest mb-3">7-Day</p>
          <div className="flex gap-1">
            {forecast.slice(0, 7).map((day, i) => (
              <div key={i} className="flex-1 text-center">
                <p className="text-[10px] text-[#2d3142]/35 mb-1">
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'narrow' })}
                </p>
                {day.icon_url && <img src={day.icon_url} alt="" className="w-6 h-6 mx-auto" />}
                <p className="text-xs font-bold text-[#1a1c2e] mt-1">{Math.round(day.temp_max)}°C</p>
                <p className="text-[10px] text-[#2d3142]/25">{Math.round(day.temp_min)}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
