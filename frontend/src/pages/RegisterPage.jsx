import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Welcome aboard 🎉')
      navigate('/recommend')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  const fields = [
    { field: 'name', label: 'Full Name', type: 'text', icon: FiUser, placeholder: 'Your Name' },
    { field: 'email', label: 'Email', type: 'email', icon: FiMail, placeholder: 'you@example.com' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative" style={{ background: '#f5f3f0' }}>
      <div className="absolute top-16 right-[20%] w-80 h-80 rounded-full bg-gradient-to-br from-violet-400/12 to-indigo-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 left-[15%] w-60 h-60 rounded-full bg-gradient-to-br from-teal-300/10 to-emerald-300/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[420px]">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">✈️</span>
            <span className="font-helvetica font-bold text-xl text-gradient">SmartTravel</span>
          </Link>
          <h1 className="text-3xl font-bold text-[#1a1c2e] tracking-tight">Create your account</h1>
          <p className="text-[#2d3142]/40 mt-2 text-sm">Start planning AI-powered trips for free</p>
        </div>

        <div className="glass-gradient p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ field, label, type, icon: Icon, placeholder }) => (
              <div key={field}>
                <label className="block text-[#2d3142]/60 text-xs font-semibold uppercase tracking-wider mb-2">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2d3142]/25" />
                  <input type={type} required placeholder={placeholder}
                    value={form[field]}
                    onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}
                    className="input-field pl-11" />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-[#2d3142]/60 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2d3142]/25" />
                <input type={showPw ? 'text' : 'password'} required placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field pl-11 pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2d3142]/25 hover:text-[#2d3142]/50 transition-colors">
                  {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#2d3142]/60 text-xs font-semibold uppercase tracking-wider mb-2">Confirm</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2d3142]/25" />
                <input type={showPw ? 'text' : 'password'} required placeholder="Repeat password"
                  value={form.confirm}
                  onChange={(e) => setForm(f => ({ ...f, confirm: e.target.value }))}
                  className="input-field pl-11" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-1">
              {loading ? <span className="spinner w-5 h-5" /> : <>Create Account <FiArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-black/[0.04] text-center">
            <span className="text-sm text-[#2d3142]/40">Have an account? </span>
            <Link to="/login" className="text-sm text-indigo-500 hover:text-indigo-600 font-semibold transition-colors">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
