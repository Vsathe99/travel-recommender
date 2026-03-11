import { FiMapPin, FiCloud, FiThermometer, FiStar } from 'react-icons/fi'
import { getSuitabilityColor } from '../utils/helpers'

export default function ComparisonTable({ data = [] }) {
  if (!data.length) return (
    <div className="glass-card p-8 text-center text-white/40">Select destinations to compare</div>
  )

  const fields = [
    { key: 'country', label: 'Country', icon: FiMapPin },
    { key: 'weather.temperature', label: 'Temperature', icon: FiThermometer },
    { key: 'weather.description', label: 'Weather', icon: FiCloud },
    { key: 'travel_suitability', label: 'Travel Suitability', icon: FiStar },
  ]

  const getVal = (obj, path) => {
    return path.split('.').reduce((acc, key) => acc?.[key], obj)
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-4 text-left text-white/50 text-sm font-medium">Attribute</th>
              {data.map((d) => (
                <th key={d.city} className="p-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    {d.thumbnail && (
                      <img src={d.thumbnail} alt={d.city} className="w-16 h-12 rounded-lg object-cover" />
                    )}
                    <span className="text-white font-semibold">{d.city}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map(({ key, label, icon: Icon }) => (
              <tr key={key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Icon className="w-4 h-4 text-ocean-400" />
                    {label}
                  </div>
                </td>
                {data.map((d) => {
                  const val = getVal(d, key)
                  return (
                    <td key={d.city} className="p-4 text-center">
                      {key === 'travel_suitability' ? (
                        <span className={`badge border ${getSuitabilityColor(val)}`}>{val || 'N/A'}</span>
                      ) : key === 'weather.temperature' ? (
                        <span className="text-white font-semibold">{val != null ? `${val}°C` : 'N/A'}</span>
                      ) : (
                        <span className="text-white/70 text-sm">{val || 'N/A'}</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
