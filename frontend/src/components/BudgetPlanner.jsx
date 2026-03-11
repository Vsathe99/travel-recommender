import { FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi'
import { formatCurrency } from '../utils/helpers'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#3b82f6', '#06b6d4', '#f97316', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']

const CATEGORY_ICONS = {
  accommodation: '🏨', flights: '✈️', food: '🍽️',
  activities: '🎭', local_transport: '🚕', shopping: '🛍️', miscellaneous: '💰',
}

export default function BudgetPlanner({ budget }) {
  if (!budget) return (
    <div className="glass-card p-8 text-center text-white/40">
      No budget estimate available
    </div>
  )

  const breakdown = budget.breakdown || {}
  const chartData = Object.entries(breakdown).map(([key, val]) => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: typeof val === 'object' ? val.total : val,
  })).filter(d => d.value > 0)

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget', value: formatCurrency(budget.total_budget), color: 'text-blue-400' },
          { label: 'Per Person', value: formatCurrency(budget.per_person_budget), color: 'text-ocean-400' },
          { label: 'Duration', value: `${budget.duration_days} days`, color: 'text-purple-400' },
          { label: 'Travelers', value: budget.num_travelers, color: 'text-sunset-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4 text-center">
            <p className={`font-bold text-xl font-display ${color}`}>{value}</p>
            <p className="text-white/50 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Feasibility */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${budget.is_feasible
        ? 'bg-emerald-500/10 border-emerald-500/30'
        : 'bg-red-500/10 border-red-500/30'}`}>
        {budget.is_feasible
          ? <FiCheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          : <FiAlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />}
        <div>
          <p className={`font-semibold text-sm ${budget.is_feasible ? 'text-emerald-400' : 'text-red-400'}`}>
            {budget.is_feasible ? 'Budget is feasible ✓' : 'Budget may be tight'}
          </p>
          <p className="text-white/60 text-xs mt-1">{budget.feasibility_note}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="glass-card p-4">
          <h4 className="text-white/60 text-sm font-medium mb-4">Budget Distribution</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={false}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }}
                formatter={(v) => formatCurrency(v)}
              />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown list */}
        <div className="glass-card p-4 space-y-3">
          <h4 className="text-white/60 text-sm font-medium mb-1">Itemized Breakdown</h4>
          {Object.entries(breakdown).map(([key, val], i) => {
            const total = typeof val === 'object' ? val.total : val
            const details = typeof val === 'object' ? val.details : ''
            return (
              <div key={key} className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{CATEGORY_ICONS[key] || '💰'}</span>
                  <div>
                    <p className="text-white text-sm capitalize">{key.replace(/_/g, ' ')}</p>
                    {details && <p className="text-white/40 text-xs">{details}</p>}
                  </div>
                </div>
                <span className="font-semibold text-sm" style={{ color: COLORS[i % COLORS.length] }}>
                  {formatCurrency(total)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Savings tips */}
      {budget.savings_tips?.length > 0 && (
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <FiInfo className="w-4 h-4 text-ocean-400" />
            <h4 className="text-white font-medium text-sm">Money-Saving Tips</h4>
          </div>
          {budget.savings_tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-white/60">
              <span className="text-green-400 font-bold shrink-0">✓</span>
              {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
