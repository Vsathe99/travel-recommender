import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! 🌍')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: '#f5f3f0' }}>
      {/* Decorative blobs */}
      <div className="absolute top-20 left-[15%] w-72 h-72 rounded-full bg-gradient-to-br from-indigo-400/15 to-violet-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-[10%] w-64 h-64 rounded-full bg-gradient-to-br from-amber-300/10 to-rose-300/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">✈️</span>
            <span className="font-helvetica font-bold text-xl text-gradient">SmartTravel</span>
          </Link>
          <h1 className="text-3xl font-bold text-[#1a1c2e] tracking-tight">Welcome back</h1>
          <p className="text-[#2d3142]/40 mt-2 text-sm">Sign in to continue your journey</p>
        </div>

        <div className="glass-gradient p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[#2d3142]/60 text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2d3142]/25" />
                <input type="email" required autoComplete="email" placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  className="input-field pl-11" />
              </div>
            </div>

            <div>
              <label className="block text-[#2d3142]/60 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2d3142]/25" />
                <input type={showPw ? 'text' : 'password'} required placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field pl-11 pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2d3142]/25 hover:text-[#2d3142]/50 transition-colors">
                  {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <span className="spinner w-5 h-5" /> : <>Sign In <FiArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-black/[0.04] text-center">
            <span className="text-sm text-[#2d3142]/40">No account? </span>
            <Link to="/register" className="text-sm text-indigo-500 hover:text-indigo-600 font-semibold transition-colors">
              Sign up free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
