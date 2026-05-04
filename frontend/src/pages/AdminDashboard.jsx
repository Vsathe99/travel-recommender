import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { adminAPI } from '../api/client'
import toast from 'react-hot-toast'
import { FiUsers, FiMap, FiBarChart2, FiTrash2, FiShield } from 'react-icons/fi'
import { formatDate, formatCurrency } from '../utils/helpers'

const TABS = ['overview', 'users', 'trips']

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getUsers(), adminAPI.getTrips()])
      .then(([s, u, t]) => {
        setStats(s.data.data)
        setUsers(u.data.data?.users || [])
        setTrips(t.data.data?.trips || [])
      })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false))
  }, [])

  const handleDeleteUser = async (id) => {
    if (!confirm('Permanently delete?')) return
    try { await adminAPI.deleteUser(id); setUsers(u => u.filter(x => x.id !== id)); toast.success('Deleted') }
    catch { toast.error('Failed') }
  }

  const handleMakeAdmin = async (id) => {
    try { await adminAPI.makeAdmin(id); setUsers(u => u.map(x => x.id === id ? { ...x, role: 'admin' } : x)); toast.success('Promoted') }
    catch { toast.error('Failed') }
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-3">
            <FiShield className="w-3.5 h-3.5" /> Admin
          </div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="section-subtitle">Manage users, trips, and analytics</p>
        </div>

        {loading ? (
          <div className="py-24 flex items-center justify-center"><div className="spinner w-10 h-10" /></div>
        ) : (
          <>
            {/* Stats bento */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: FiUsers, label: 'Users', value: stats.total_users, gradient: 'from-indigo-500 to-violet-500' },
                  { icon: FiMap, label: 'Trips', value: stats.total_trips, gradient: 'from-emerald-500 to-teal-500' },
                  { icon: FiShield, label: 'Admins', value: stats.total_admins, gradient: 'from-amber-500 to-orange-500' },
                  { icon: FiBarChart2, label: 'Top Dest.', value: stats.popular_destinations?.[0]?.destination || '—', gradient: 'from-rose-500 to-pink-500' },
                ].map(({ icon: Icon, label, value, gradient }) => (
                  <div key={label} className="glass p-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-[#1a1c2e]">{value}</p>
                      <p className="text-[10px] text-[#2d3142]/35 uppercase tracking-wider">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Popular destinations bar */}
            {stats?.popular_destinations?.length > 0 && (
              <div className="glass p-5 mb-8">
                <p className="text-xs text-[#2d3142]/35 uppercase tracking-widest mb-4">Most Popular</p>
                <div className="space-y-3">
                  {stats.popular_destinations.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-[#2d3142]/30 font-mono w-5">{i + 1}</span>
                      <div className="flex-1 h-2 bg-black/[0.03] rounded-full overflow-hidden">
                        <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-700"
                          style={{ width: `${Math.min(100, (d.count / stats.popular_destinations[0].count) * 100)}%` }} />
                      </div>
                      <span className="text-sm font-medium text-[#1a1c2e] min-w-[100px]">{d.destination}</span>
                      <span className="text-xs text-[#2d3142]/30 font-mono">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-black/[0.03] rounded-xl p-1 w-fit mb-6">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-300
                    ${tab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-[#2d3142]/40 hover:text-[#2d3142]/60'}`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Users */}
            {tab === 'users' && (
              <div className="glass overflow-hidden" style={{ borderRadius: '1.5rem' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black/[0.04]">
                        {['Name', 'Email', 'Role', 'Trips', 'Joined', ''].map(h => (
                          <th key={h} className="p-4 text-left text-[10px] text-[#2d3142]/35 uppercase tracking-widest font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-black/[0.03]">
                          <td className="p-4 text-sm font-medium text-[#1a1c2e]">{u.name}</td>
                          <td className="p-4 text-sm text-[#2d3142]/50">{u.email}</td>
                          <td className="p-4">
                            <span className={`badge ${u.role === 'admin' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-black/[0.03] text-[#2d3142]/40 border border-black/[0.05]'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-[#2d3142]/40">{u.saved_trips_count}</td>
                          <td className="p-4 text-xs text-[#2d3142]/30">{formatDate(u.created_at)}</td>
                          <td className="p-4">
                            <div className="flex gap-1.5">
                              {u.role !== 'admin' && (
                                <button onClick={() => handleMakeAdmin(u.id)}
                                  className="p-2 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors" title="Promote">
                                  <FiShield className="w-3.5 h-3.5 text-amber-600" />
                                </button>
                              )}
                              <button onClick={() => handleDeleteUser(u.id)}
                                className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Delete">
                                <FiTrash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Trips */}
            {tab === 'trips' && (
              <div className="glass overflow-hidden" style={{ borderRadius: '1.5rem' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black/[0.04]">
                        {['Destination', 'Budget', 'Duration', 'User', 'Date'].map(h => (
                          <th key={h} className="p-4 text-left text-[10px] text-[#2d3142]/35 uppercase tracking-widest font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trips.map(t => (
                        <tr key={t.id} className="border-b border-black/[0.03]">
                          <td className="p-4 text-sm font-medium text-[#1a1c2e]">{t.destination}</td>
                          <td className="p-4 text-sm text-emerald-600 font-medium">{formatCurrency(t.budget)}</td>
                          <td className="p-4 text-sm text-[#2d3142]/50">{t.duration}d</td>
                          <td className="p-4 text-xs text-[#2d3142]/25 font-mono truncate max-w-[120px]">{t.user_id}</td>
                          <td className="p-4 text-xs text-[#2d3142]/30">{formatDate(t.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
