import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/client'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('travel_user')
    const token = localStorage.getItem('travel_token')
    if (stored && token) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.clear()
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    const { token, user: userData } = data.data
    localStorage.setItem('travel_token', token)
    localStorage.setItem('travel_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password })
    const { token, user: userData } = data.data
    localStorage.setItem('travel_token', token)
    localStorage.setItem('travel_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('travel_token')
    localStorage.removeItem('travel_user')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('travel_user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
