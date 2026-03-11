export const formatCurrency = (amount, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount ?? 0)

export const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const getScoreColor = (score) => {
    if (score >= 8.5) return 'text-emerald-400 border-emerald-400'
    if (score >= 7.0) return 'text-blue-400 border-blue-400'
    if (score >= 5.5) return 'text-yellow-400 border-yellow-400'
    return 'text-red-400 border-red-400'
}

export const getSuitabilityColor = (suitability) => {
    const map = {
        Excellent: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        Good: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        Fair: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        Poor: 'bg-red-500/20 text-red-400 border-red-500/30',
    }
    return map[suitability] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

export const getTravelTypeIcon = (type) => {
    const icons = {
        beach: '🏖️', mountains: '🏔️', city: '🏙️', adventure: '🧗',
        culture: '🏛️', wildlife: '🦁', default: '✈️',
    }
    return icons[type] || icons.default
}

export const truncate = (str, n = 100) =>
    str && str.length > n ? str.slice(0, n) + '…' : str

export const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

export const getWeatherIcon = (iconCode) =>
    `https://openweathermap.org/img/wn/${iconCode}@2x.png`
