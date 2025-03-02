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
# Added more common development ports for convenience
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:5173,http://localhost:3000,http://localhost:8000,http://localhost:8080,http://127.0.0.1:5173,http://127.0.0.1:3000,http://127.0.0.1:8000,http://127.0.0.1:8080,https://chatlore.xyz"
).split(",")

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