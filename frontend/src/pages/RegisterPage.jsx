import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome aboard 🎉')
      navigate('/recommend')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-ocean-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">✈️</span>
            <span className="font-display font-bold text-2xl text-gradient">SmartTravel</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-white mt-4">Create your account</h1>
          <p className="text-white/50 mt-1.5">Start planning AI-powered trips for free</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { field: 'name', label: 'Full Name', type: 'text', icon: FiUser, placeholder: 'Your Name' },
              { field: 'email', label: 'Email', type: 'email', icon: FiMail, placeholder: 'you@example.com' },
            ].map(({ field, label, type, icon: Icon, placeholder }) => (
              <div key={field}>
                <label className="block text-white/70 text-sm font-medium mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type={type} required placeholder={placeholder}
                    value={form[field]}
                    onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="input-field pl-10" />
                </div>
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type={showPw ? 'text' : 'password'} required placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type={showPw ? 'text' : 'password'} required placeholder="Repeat password"
                  value={form.confirm}
                  onChange={(e) => setForm(f => ({ ...f, confirm: e.target.value }))}
                  className="input-field pl-10" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
              {loading ? <span className="spinner w-5 h-5 inline-block" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-white/50 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
