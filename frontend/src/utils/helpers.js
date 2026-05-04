export const formatCurrency = (amount, currency = 'INR') =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount ?? 0)

export const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const getScoreColor = (score) => {
    if (score >= 8.5) return 'text-emerald-500 border-emerald-400'
    if (score >= 7.0) return 'text-blue-500 border-blue-400'
    if (score >= 5.5) return 'text-amber-500 border-amber-400'
    return 'text-red-500 border-red-400'
}

export const getSuitabilityColor = (suitability) => {
    const map = {
        Excellent: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        Good: 'bg-blue-50 text-blue-600 border-blue-200',
        Fair: 'bg-amber-50 text-amber-600 border-amber-200',
        Poor: 'bg-red-50 text-red-600 border-red-200',
    }
    return map[suitability] || 'bg-black/[0.03] text-[#2d3142]/40 border-black/[0.05]'
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
