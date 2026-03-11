import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('travel_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle 401 globally — redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('travel_token')
            localStorage.removeItem('travel_user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// ── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
}

// ── User ────────────────────────────────────────────────────────────────────
export const userAPI = {
    getProfile: () => api.get('/user/profile'),
    updatePreferences: (data) => api.put('/user/preferences', data),
}

// ── Travel ──────────────────────────────────────────────────────────────────
export const travelAPI = {
    recommend: (data) => api.post('/recommend-destination', data),
    searchLocation: (query) => api.get('/search-location', { params: { query } }),
    getDestination: (city) => api.get(`/destination/${encodeURIComponent(city)}`),
    getRestaurants: (city) => api.get(`/destination/${encodeURIComponent(city)}/restaurants`),
    getAccommodations: (city) => api.get(`/destination/${encodeURIComponent(city)}/accommodations`),
    getAttractions: (city, category) => api.get(`/attractions/${encodeURIComponent(city)}`, { params: { category } }),
    getWeather: (city) => api.get(`/weather/${encodeURIComponent(city)}`),
    getImages: (city, count = 12) => api.get(`/images/${encodeURIComponent(city)}`, { params: { count } }),
    generateItinerary: (data) => api.post('/generate-itinerary', data),
    budgetEstimate: (data) => api.post('/budget-estimate', data),
    compareDestinations: (cities) => api.post('/compare-destinations', cities),
}

// ── Trips ───────────────────────────────────────────────────────────────────
export const tripAPI = {
    save: (data) => api.post('/trip/save', data),
    getHistory: () => api.get('/trip/history'),
    getById: (id) => api.get(`/trip/${id}`),
    update: (id, data) => api.put(`/trip/${id}`, data),
    delete: (id) => api.delete(`/trip/${id}`),
}

// ── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: (page = 1) => api.get('/admin/users', { params: { page } }),
    getTrips: (page = 1) => api.get('/admin/trips', { params: { page } }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    makeAdmin: (id) => api.put(`/admin/users/${id}/make-admin`),
}

export default api
