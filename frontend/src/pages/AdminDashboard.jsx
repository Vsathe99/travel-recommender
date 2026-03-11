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
    Promise.all([
      adminAPI.getStats(),
      adminAPI.getUsers(),
      adminAPI.getTrips(),
    ]).then(([s, u, t]) => {
      setStats(s.data.data)
      setUsers(u.data.data?.users || [])
      setTrips(t.data.data?.trips || [])
    }).catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false))
  }, [])

  const handleDeleteUser = async (id) => {
    if (!confirm('Permanently delete this user?')) return
    try {
      await adminAPI.deleteUser(id)
      setUsers(u => u.filter(x => x.id !== id))
      toast.success('User deleted')
    } catch { toast.error('Delete failed') }
  }

  const handleMakeAdmin = async (id) => {
    try {
      await adminAPI.makeAdmin(id)
      setUsers(u => u.map(x => x.id === id ? { ...x, role: 'admin' } : x))
      toast.success('User promoted to admin')
    } catch { toast.error('Failed to promote user') }
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="section-title flex items-center gap-3">
            <FiShield className="w-8 h-8 text-sunset-400" /> Admin Dashboard
          </h1>
          <p className="section-subtitle">Manage users, trips, and system statistics</p>
        </div>

        {loading ? (
          <div className="glass-card p-16 flex items-center justify-center"><div className="spinner w-12 h-12" /></div>
        ) : (
          <>
            {/* Stats overview */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: FiUsers, label: 'Total Users', value: stats.total_users, color: 'text-blue-400' },
                  { icon: FiMap, label: 'Total Trips', value: stats.total_trips, color: 'text-ocean-400' },
                  { icon: FiShield, label: 'Admins', value: stats.total_admins, color: 'text-sunset-400' },
                  { icon: FiBarChart2, label: 'Popular Destination', value: stats.popular_destinations?.[0]?.destination || 'N/A', color: 'text-purple-400' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="glass-card p-5 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/10"><Icon className={`w-5 h-5 ${color}`} /></div>
                    <div>
                      <p className={`font-display font-bold text-xl ${color}`}>{value}</p>
                      <p className="text-white/50 text-xs">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Popular Destinations */}
            {stats?.popular_destinations?.length > 0 && (
              <div className="glass-card p-5 mb-8">
                <h3 className="font-display font-semibold text-white mb-4">🏆 Most Saved Destinations</h3>
                <div className="space-y-2">
                  {stats.popular_destinations.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-6 text-white/40 text-sm font-medium">{i + 1}.</span>
                      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-primary-500 to-ocean-500 rounded-full"
                          style={{ width: `${Math.min(100, (d.count / stats.popular_destinations[0].count) * 100)}%` }} />
                      </div>
                      <span className="text-white text-sm font-medium">{d.destination}</span>
                      <span className="text-white/50 text-xs">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab switcher */}
            <div className="flex gap-2 mb-6">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-xl text-sm font-medium capitalize border transition-all
                    ${tab === t ? 'bg-primary-600/20 border-primary-500/50 text-primary-400' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Users table */}
            {tab === 'users' && (
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
                        <th className="p-4 text-left">Name</th>
                        <th className="p-4 text-left">Email</th>
                        <th className="p-4 text-left">Role</th>
                        <th className="p-4 text-left">Trips</th>
                        <th className="p-4 text-left">Joined</th>
                        <th className="p-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 text-white text-sm font-medium">{u.name}</td>
                          <td className="p-4 text-white/60 text-sm">{u.email}</td>
                          <td className="p-4">
                            <span className={`badge border ${u.role === 'admin' ? 'bg-sunset-500/20 text-sunset-400 border-sunset-500/30' : 'bg-white/10 text-white/50 border-white/20'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-white/60 text-sm">{u.saved_trips_count}</td>
                          <td className="p-4 text-white/40 text-xs">{formatDate(u.created_at)}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {u.role !== 'admin' && (
                                <button onClick={() => handleMakeAdmin(u.id)}
                                  className="p-2 bg-sunset-500/20 hover:bg-sunset-500/30 border border-sunset-500/30 rounded-lg transition-colors" title="Make Admin">
                                  <FiShield className="w-3.5 h-3.5 text-sunset-400" />
                                </button>
                              )}
                              <button onClick={() => handleDeleteUser(u.id)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors" title="Delete User">
                                <FiTrash2 className="w-3.5 h-3.5 text-red-400" />
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

            {/* Trips table */}
            {tab === 'trips' && (
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
                        <th className="p-4 text-left">Destination</th>
                        <th className="p-4 text-left">Budget</th>
                        <th className="p-4 text-left">Duration</th>
                        <th className="p-4 text-left">User ID</th>
                        <th className="p-4 text-left">Saved At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.map(t => (
                        <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 text-white text-sm font-medium">{t.destination}</td>
                          <td className="p-4 text-green-400 text-sm">{formatCurrency(t.budget)}</td>
                          <td className="p-4 text-white/60 text-sm">{t.duration}d</td>
                          <td className="p-4 text-white/30 text-xs font-mono truncate max-w-xs">{t.user_id}</td>
                          <td className="p-4 text-white/40 text-xs">{formatDate(t.created_at)}</td>
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
