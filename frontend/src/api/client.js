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
    getDestination: (city, country) => api.get(`/destination/${encodeURIComponent(city)}`, { params: { country: country || undefined } }),
    getRestaurants: (city, country) => api.get(`/destination/${encodeURIComponent(city)}/restaurants`, { params: { country: country || undefined } }),
    getAccommodations: (city, country) => api.get(`/destination/${encodeURIComponent(city)}/accommodations`, { params: { country: country || undefined } }),
    getAttractions: (city, category, country) => api.get(`/attractions/${encodeURIComponent(city)}`, { params: { category, country: country || undefined } }),
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

// ── Interactions (CF training data) ─────────────────────────────────────────
export const interactionAPI = {
    log: (data) => api.post('/interactions', data),
    history: () => api.get('/interactions/history'),
    popular: () => api.get('/interactions/popular'),
}

// ── Collaborative Filtering ─────────────────────────────────────────────────
export const cfAPI = {
    forYou: () => api.get('/cf/for-you'),
    similar: (destId) => api.get(`/cf/similar/${destId}`),
    similarByName: (name) => api.get(`/cf/similar-by-name/${encodeURIComponent(name)}`),
    train: () => api.post('/cf/train'),
    status: () => api.get('/cf/status'),
}

export default api
