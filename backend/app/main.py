from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import chat, security, search
import os

app = FastAPI(
    title="ChatLore API",
    description="AI-powered WhatsApp chat analysis API (Stateless)",
    version="1.0.0"
)

# Get allowed origins from environment or use default
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Use environment variable or default to localhost
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(security.router, prefix="/api/security", tags=["security"])
app.include_router(search.router, prefix="/api/search", tags=["search"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to ChatLore API (Stateless)",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    } 