# 🌍 Smart Travel Recommendation System

An AI-powered, full-stack travel recommendation platform using **xAI Grok**, **Mapbox**, **OpenWeatherMap**, and **Unsplash**. No model training — only free pretrained LLMs and external APIs.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 AI Recommendations | Grok LLM ranks destinations by preferences, budget, weather |
| 🗺️ Interactive Maps | Mapbox geocoding for destinations and nearby attractions |
| 🌤️ Live Weather | OpenWeatherMap — current conditions + 7-day forecast |
| 📅 AI Itineraries | Day-by-day LLM-generated trip plans |
| 💰 Budget Planner | Itemized cost breakdowns with Recharts pie chart |
| 📸 Photo Galleries | Unsplash high-quality destination images |
| ⚖️ Destination Compare | Side-by-side weather & travel suitability comparison |
| 🔐 JWT Auth | Register, login, bcrypt passwords, protected routes |
| 🗓️ Trip Management | Save, view, edit, delete trips |
| 🛡️ Admin Panel | User/trip management dashboard |
| 🐳 Docker | Single `docker compose up` deployment |
| 📦 Redis Cache | Cached weather, geocoding, images |

---

## 🏗️ Architecture

```
travel-recommendation-system/
├── backend/                    # FastAPI Python backend
│   ├── api/                    # Route handlers (auth, user, travel, trips, admin)
│   ├── auth/                   # JWT creation & verification
│   ├── database/               # MongoDB async connection (Motor)
│   ├── models/                 # Pydantic schemas (User, Destination, Trip)
│   ├── services/               # LLM, Map, Weather, Image, Recommendation, Itinerary, Budget
│   ├── utils/                  # Cache (Redis), Password (bcrypt), Response helpers
│   ├── tests/                  # pytest async tests
│   └── main.py                 # FastAPI app entry point
├── frontend/                   # React + Vite + TailwindCSS
│   └── src/
│       ├── api/                # Axios client with JWT interceptors
│       ├── context/            # AuthContext (JWT state)
│       ├── pages/              # 10 pages (Landing, Login, Register, Dashboard, etc.)
│       ├── components/         # Reusable UI components
│       └── utils/              # Formatting helpers
├── docker-compose.yml
└── .env.example
```

---

## 🧠 How the Recommendation Engine Works

```
User Preferences
       ↓
Mapbox → Fetch candidate destinations (beach/mountains/city/etc.)
       ↓
OpenWeatherMap → Enrich each destination with current weather
       ↓
Grok LLM Prompt → Rank destinations by suitability
       ↓
Rule-based fallback if LLM unavailable
       ↓
Frontend → Display top 6 ranked cards with scores, reasons, estimated costs
```

**Grok LLM prompt structure:**
```
User Preferences:
- Travel Type: beach, culture
- Budget: $1500 for 7 days
- Climate: warm, Travel Companions: couple
- Preferred Regions: Southeast Asia

Candidate Destinations:
- Bali, Indonesia (weather: Partly Cloudy, temp: 28°C)
- Phuket, Thailand (weather: Sunny, temp: 32°C)
...

Rank the TOP 6 destinations. Return JSON array with destination, score, reason, estimated_cost, weather_suitability, highlights.
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- API keys (see Environment Variables section)

### 1. Clone & Configure

```bash
git clone <repo-url>
cd travel-recommendation-system

# Copy and fill in your API keys
cp .env.example backend/.env
```

### 2. Start Everything

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **API Docs** | http://localhost:8000/docs |
| **MongoDB** | mongodb://localhost:27017 |
| **Redis** | redis://localhost:6379 |

### 3. Local Development (without Docker)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # fill in your keys
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev                  # starts at http://localhost:3000
```

---

## 🔑 Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Description | Free Source |
|---|---|---|
| `JWT_SECRET` | Secret for signing JWT tokens | generate random string |
| `GROK_API_KEY` | xAI Grok API key (primary LLM) | [console.x.ai](https://console.x.ai/) |
| `HF_API_KEY` | HuggingFace token (fallback LLM) | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| `MAPBOX_API_KEY` | Mapbox public token | [account.mapbox.com](https://account.mapbox.com/) |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | [openweathermap.org/api](https://openweathermap.org/api) |
| `UNSPLASH_ACCESS_KEY` | Unsplash access key | [unsplash.com/developers](https://unsplash.com/developers) |
| `MONGO_URI` | MongoDB connection string | Docker: `mongodb://mongodb:27017` |
| `REDIS_URL` | Redis connection string | Docker: `redis://redis:6379` |

> **Note:** All external API integrations have graceful mock fallbacks if the API key is missing. The system will still work with mock data.

---

## 📡 API Reference

### Authentication
| Endpoint | Method | Description |
|---|---|---|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login, returns JWT |
| `/auth/reset-password` | POST | Reset user password |

### User
| Endpoint | Method | Description |
|---|---|---|
| `/user/profile` | GET | Get current user profile |
| `/user/preferences` | PUT | Update travel preferences |

### Travel (all require JWT)
| Endpoint | Method | Description |
|---|---|---|
| `/recommend-destination` | POST | Get AI-ranked destination list |
| `/destination/{city}` | GET | Get weather, geocode, images for city |
| `/attractions/{city}` | GET | Get top 10 nearby attractions |
| `/weather/{city}` | GET | Get current weather + 7-day forecast |
| `/images/{city}` | GET | Get Unsplash images for city |
| `/generate-itinerary` | POST | Generate day-by-day itinerary via LLM |
| `/budget-estimate` | POST | Generate budget breakdown via LLM |
| `/compare-destinations` | POST | Compare up to 4 destinations |

### Trips (all require JWT)
| Endpoint | Method | Description |
|---|---|---|
| `/trip/save` | POST | Save a new trip |
| `/trip/history` | GET | List user's saved trips |
| `/trip/{id}` | GET | Get a specific trip |
| `/trip/{id}` | PUT | Update a trip |
| `/trip/{id}` | DELETE | Delete a trip |

### Admin (requires admin JWT)
| Endpoint | Method | Description |
|---|---|---|
| `/admin/stats` | GET | System statistics |
| `/admin/users` | GET | List all users |
| `/admin/trips` | GET | List all trips |
| `/admin/users/{id}` | DELETE | Delete a user |
| `/admin/users/{id}/make-admin` | PUT | Promote user to admin |

---

## 🧪 Running Tests

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
```

Tests cover:
- `test_auth.py` — Register, login, duplicate email, invalid credentials
- `test_travel.py` — Weather mock fallback, image placeholders, rule-based ranking, budget fallback
- `test_trips.py` — Itinerary template generation, day numbering

---

## 🖥️ Frontend Pages

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Marketing page with features |
| Login | `/login` | Email + password login |
| Register | `/register` | Account creation |
| Dashboard | `/dashboard` | User stats + quick actions |
| Discover | `/recommend` | AI recommendation engine |
| Destination | `/destination/:city` | Maps, weather, images, attractions |
| Trip Planner | `/planner` | Itinerary + budget generator |
| Saved Trips | `/saved-trips` | Manage saved trips |
| Compare | `/compare` | Side-by-side comparison |
| Admin | `/admin` | Admin dashboard (admin only) |

---

## 🛡️ Security

- bcrypt password hashing (via passlib)
- JWT tokens with expiration (24h default)
- All sensitive routes require valid JWT
- Admin routes require `role: "admin"` in token
- CORS limited to frontend origin

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Recharts |
| Backend | FastAPI (Python 3.11), Motor (async) |
| Database | MongoDB 7 |
| Cache | Redis 7 |
| LLM (primary) | xAI Grok (grok-3-mini) |
| LLM (fallback) | HuggingFace Inference API |
| Maps | Mapbox GL JS + Geocoding API |
| Weather | OpenWeatherMap |
| Images | Unsplash API |
| Auth | JWT (python-jose) + bcrypt |
| Containerization | Docker + Docker Compose |
