# ============================================
# MAIN APPLICATION - FastAPI Entry Point
# ============================================

from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI

from app.core import settings, init_db, close_db, start_scheduler, stop_scheduler, get_scheduler_status
from app.middleware import setup_cors, register_exception_handlers, LoggingMiddleware
from app.routes import register_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Handles startup and shutdown events.
    """
    # ===== STARTUP =====
    print("=" * 50)
    print(f"Starting {settings.app_name} v{settings.app_version}")
    print(f"Environment: {'Development' if settings.debug else 'Production'}")
    print("=" * 50)
    
    # Initialize database
    print("Initializing database...")
    try:
        await init_db()
        print("Database initialized")
    except Exception as e:
        print(f"⚠️  Database connection failed: {e}")
        print("   Server will start but database operations will fail.")
        print("   Check your DB_HOST, DB_PORT, DB_USER, DB_PASSWORD settings.")
    
    # Start background scheduler
    print("Starting scheduler...")
    start_scheduler()
    
    print("Application ready!")
    print("=" * 50)
    
    yield
    
    # ===== SHUTDOWN =====
    print("=" * 50)
    print("Shutting down...")
    
    # Stop scheduler
    stop_scheduler()
    
    # Close database connections
    try:
        await close_db()
    except Exception:
        pass
    
    print("Shutdown complete")
    print("=" * 50)


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="""
    SAP Support Ticket Dashboard API
    
    Features:
    - Azure AD SSO Authentication
    - Ticket Management (CRUD)
    - Email-to-Ticket Automation (IMAP + LLM)
    - SAP Module Classification (MM, SD, FICO, etc.)
    - Analytics & Reporting
    - Admin Management
    
    Built with FastAPI, SQLAlchemy, and OpenAI.
    """,
    version=settings.app_version,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan
)


# ===== MIDDLEWARE =====
setup_cors(app)
app.add_middleware(LoggingMiddleware)
register_exception_handlers(app)


# ===== ROUTES =====
register_routes(app)


# ===== HEALTH CHECK =====
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API information"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs" if settings.debug else "disabled"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.app_version,
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected",
        "scheduler": get_scheduler_status()
    }


@app.get("/api/v1/health", tags=["Health"])
async def api_health():
    """API health check"""
    return {
        "status": "ok",
        "api_version": "v1"
    }


# ===== RUN WITH UVICORN =====
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
