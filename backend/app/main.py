from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import documents, admin, chat
import os

app = FastAPI(
    title="Syntrax.ai API",
    description="Enterprise IDP Backend with OpenRouter Intelligence",
    version="0.1.0"
)

# CORS Configuration
_default_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:8000",
    "http://localhost:3005",
    "http://127.0.0.1:3000",
]
_extra = os.getenv("ALLOWED_ORIGINS", "")
origins = _default_origins + [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Syntrax.ai API is running",
        "status": "active",
        "version": "0.1.0"
    }

from fastapi.staticfiles import StaticFiles
from app.database import init_db
import os

# ... (Previous code)

# Initialize Database
init_db()

# Mount Static Files for serving images (dev only — Vercel Blob used in production)
if not os.getenv("VERCEL") and not os.getenv("BLOB_READ_WRITE_TOKEN"):
    os.makedirs("uploads", exist_ok=True)
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(documents.router)
app.include_router(admin.router)
app.include_router(chat.router)
from app.routers import auth
app.include_router(auth.router)
from app.routers import payments
app.include_router(payments.router)
from app.routers import webhooks
app.include_router(webhooks.router)
# app.include_router(extractions.router)

from app.services.cleanup_service import start_cleanup_service

@app.on_event("startup")
async def startup_event():
    # Start the daily cleanup background thread
    start_cleanup_service()
    pass

# Reload trigger 2
