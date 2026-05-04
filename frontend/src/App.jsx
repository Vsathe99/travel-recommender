import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import RecommendationPage from './pages/RecommendationPage'
import DestinationDetail from './pages/DestinationDetail'
import TripPlannerPage from './pages/TripPlannerPage'
import SavedTripsPage from './pages/SavedTripsPage'
import ComparisonPage from './pages/ComparisonPage'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(20px) saturate(180%)',
              color: '#2d3142',
              border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: '14px',
              boxShadow: '0 8px 32px rgba(45,49,66,0.08)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/recommend" element={<ProtectedRoute><RecommendationPage /></ProtectedRoute>} />
          <Route path="/destination/:city" element={<ProtectedRoute><DestinationDetail /></ProtectedRoute>} />
          <Route path="/planner" element={<ProtectedRoute><TripPlannerPage /></ProtectedRoute>} />
          <Route path="/planner/:id" element={<ProtectedRoute><TripPlannerPage /></ProtectedRoute>} />
          <Route path="/saved-trips" element={<ProtectedRoute><SavedTripsPage /></ProtectedRoute>} />
          <Route path="/compare" element={<ProtectedRoute><ComparisonPage /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
