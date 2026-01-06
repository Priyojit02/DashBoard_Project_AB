# ============================================
# CORS MIDDLEWARE - Cross-Origin Resource Sharing
# ============================================

from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings


def setup_cors(app):
    """
    Configure CORS middleware for the FastAPI app
    """
    # Parse allowed origins from settings
    origins = settings.allowed_origins
    
    # In development, allow all origins
    if settings.debug:
        origins = ["*"]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With",
            "X-Request-ID"
        ],
        expose_headers=[
            "X-Request-ID",
            "X-Response-Time",
            "Content-Disposition"
        ],
        max_age=600  # Cache preflight requests for 10 minutes
    )
