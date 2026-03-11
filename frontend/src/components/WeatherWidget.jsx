import { FiThermometer, FiDroplet, FiWind, FiEye } from 'react-icons/fi'
import { getSuitabilityColor } from '../utils/helpers'

function WeatherStat({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Icon className="w-4 h-4 text-ocean-400" />
      <span className="text-white font-semibold text-sm">{value}</span>
      <span className="text-white/40 text-xs">{label}</span>
    </div>
  )
}

export default function WeatherWidget({ weather, forecast, suitability }) {
  if (!weather) return (
    <div className="glass-card p-6 flex items-center justify-center h-40">
      <p className="text-white/40">Weather data unavailable</p>
    </div>
  )

  return (
    <div className="glass-card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display font-bold text-xl text-white">
            {weather.city}, {weather.country}
          </h3>
          <p className="text-white/60 text-sm mt-0.5">{weather.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {weather.icon_url && (
            <img src={weather.icon_url} alt={weather.description} className="w-12 h-12" />
          )}
          <span className="font-display font-bold text-4xl text-white">
            {weather.temperature}°C
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
        <WeatherStat icon={FiThermometer} label="Feels like" value={`${weather.feels_like}°C`} />
        <WeatherStat icon={FiDroplet} label="Humidity" value={`${weather.humidity}%`} />
        <WeatherStat icon={FiWind} label="Wind" value={`${weather.wind_speed} m/s`} />
        <WeatherStat icon={FiEye} label="Visibility" value={weather.visibility ? `${(weather.visibility / 1000).toFixed(1)}km` : 'N/A'} />
      </div>

      {/* Travel Suitability */}
      {suitability && (
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Travel Suitability:</span>
          <span className={`badge border ${getSuitabilityColor(suitability)}`}>
            {suitability}
          </span>
        </div>
      )}

      {/* 7-day Forecast */}
      {forecast && forecast.length > 0 && (
        <div>
          <h4 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">7-Day Forecast</h4>
          <div className="grid grid-cols-7 gap-1">
            {forecast.slice(0, 7).map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1 bg-white/5 rounded-lg p-2">
                <span className="text-white/50 text-xs">
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
                {day.icon_url && (
                  <img src={day.icon_url} alt={day.description} className="w-7 h-7" />
                )}
                <span className="text-white text-xs font-medium">{Math.round(day.temp_max)}°</span>
                <span className="text-white/40 text-xs">{Math.round(day.temp_min)}°</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
