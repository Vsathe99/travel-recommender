import { FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi'
import { formatCurrency } from '../utils/helpers'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6']

const CATEGORY_ICONS = {
  accommodation: '🏨', flights: '✈️', food: '🍽️', activities: '🎭', local_transport: '🚕',
}

export default function BudgetPlanner({ budget }) {
  if (!budget) return (
    <div className="py-20 text-center text-[#2d3142]/30 text-sm">No budget estimate available</div>
  )

  const breakdown = budget.breakdown || {}
  const chartData = Object.entries(breakdown).map(([key, val]) => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: typeof val === 'object' ? val.total : val,
  })).filter(d => d.value > 0)

  return (
    <div className="animate-slide-up space-y-8">
      {/* Summary - flowing stats */}
      <div className="flex flex-wrap gap-6">
        {[
          { label: 'Total Budget', value: formatCurrency(budget.total_budget), color: 'text-indigo-600' },
          { label: 'Per Person', value: formatCurrency(budget.per_person_budget), color: 'text-cyan-600' },
          { label: 'Duration', value: `${budget.duration_days} days`, color: 'text-violet-600' },
          { label: 'Travelers', value: budget.num_travelers, color: 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-[#2d3142]/35 uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Feasibility */}
      <div className={`flex items-start gap-3 p-4 rounded-2xl ${budget.is_feasible
        ? 'bg-emerald-50/80 border border-emerald-200/50'
        : 'bg-red-50/80 border border-red-200/50'}`}>
        {budget.is_feasible
          ? <FiCheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
          : <FiAlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />}
        <div>
          <p className={`font-semibold text-sm ${budget.is_feasible ? 'text-emerald-700' : 'text-red-700'}`}>
            {budget.is_feasible ? 'Budget is feasible ✓' : 'Budget may be tight'}
          </p>
          <p className="text-xs text-[#2d3142]/45 mt-0.5">{budget.feasibility_note}</p>
        </div>
      </div>

      {/* Chart + Breakdown side by side */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <p className="text-xs text-[#2d3142]/35 uppercase tracking-wider mb-4">Distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" outerRadius={75} innerRadius={45} dataKey="value" strokeWidth={0}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', color: '#2d3142', fontSize: '13px' }}
                formatter={(v) => formatCurrency(v)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-xs text-[#2d3142]/35 uppercase tracking-wider mb-4">Breakdown</p>
          <div className="space-y-3">
            {Object.entries(breakdown).map(([key, val], i) => {
              const total = typeof val === 'object' ? val.total : val
              const details = typeof val === 'object' ? val.details : ''
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ backgroundColor: `${COLORS[i % COLORS.length]}15` }}>
                    {CATEGORY_ICONS[key] || '💰'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1c2e] capitalize">{key.replace(/_/g, ' ')}</p>
                    {details && <p className="text-xs text-[#2d3142]/30 truncate">{details}</p>}
                  </div>
                  <span className="text-sm font-bold" style={{ color: COLORS[i % COLORS.length] }}>
                    {formatCurrency(total)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tips */}
      {budget.savings_tips?.length > 0 && (
        <div className="pt-4 border-t border-black/[0.04]">
          <div className="flex items-center gap-2 mb-3">
            <FiInfo className="w-4 h-4 text-cyan-500" />
            <p className="text-xs font-semibold text-[#2d3142]/60 uppercase tracking-wider">Saving Tips</p>
          </div>
          <div className="space-y-2">
            {budget.savings_tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-[#2d3142]/50">
                <span className="text-emerald-500 font-bold shrink-0">✓</span> {tip}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
