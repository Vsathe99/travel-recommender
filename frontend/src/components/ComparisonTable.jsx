import { FiMapPin, FiCloud, FiThermometer, FiStar } from 'react-icons/fi'
import { getSuitabilityColor } from '../utils/helpers'

export default function ComparisonTable({ data = [] }) {
  if (!data.length) return null

  const fields = [
    { key: 'country', label: 'Country', icon: FiMapPin },
    { key: 'weather.temperature', label: 'Temperature', icon: FiThermometer },
    { key: 'weather.description', label: 'Weather', icon: FiCloud },
    { key: 'travel_suitability', label: 'Suitability', icon: FiStar },
  ]

  const getVal = (obj, path) => path.split('.').reduce((acc, key) => acc?.[key], obj)

  return (
    <div className="glass overflow-hidden" style={{ borderRadius: '1.5rem' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.04]">
              <th className="p-5 text-left text-[10px] text-[#2d3142]/35 uppercase tracking-widest font-semibold">Attribute</th>
              {data.map((d) => (
                <th key={d.city} className="p-5 text-center">
                  <div className="flex flex-col items-center gap-2">
                    {d.thumbnail && (
                      <img src={d.thumbnail} alt={d.city} className="w-14 h-10 rounded-lg object-cover" />
                    )}
                    <span className="text-sm font-bold text-[#1a1c2e]">{d.city}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map(({ key, label, icon: Icon }) => (
              <tr key={key} className="border-b border-black/[0.03]">
                <td className="p-5">
                  <div className="flex items-center gap-2 text-sm text-[#2d3142]/50">
                    <Icon className="w-4 h-4 text-indigo-400" /> {label}
                  </div>
                </td>
                {data.map((d) => {
                  const val = getVal(d, key)
                  return (
                    <td key={d.city} className="p-5 text-center">
                      {key === 'travel_suitability' ? (
                        <span className={`badge border ${getSuitabilityColor(val)}`}>{val || 'N/A'}</span>
                      ) : key === 'weather.temperature' ? (
                        <span className="text-lg font-bold text-[#1a1c2e]">{val != null ? `${val}°` : '—'}</span>
                      ) : (
                        <span className="text-sm text-[#2d3142]/60">{val || '—'}</span>
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
