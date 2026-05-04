import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database.mongodb import connect_db, close_db
from api.auth import router as auth_router
from api.user import router as user_router
from api.travel import router as travel_router
from api.trips import router as trips_router
from api.admin import router as admin_router
from api.interactions import router as interactions_router
from api.cf import router as cf_router
from dotenv import load_dotenv

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Smart Travel Recommendation System API",
    description="AI-powered travel recommendation engine using Grok LLM, Mapbox, and OpenWeatherMap",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend origin
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(travel_router)
app.include_router(trips_router)
app.include_router(admin_router)
app.include_router(interactions_router)
app.include_router(cf_router)


@app.get("/")
async def root():
    return {
        "name": "Smart Travel Recommendation System",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "travel-recommendation-api"}
