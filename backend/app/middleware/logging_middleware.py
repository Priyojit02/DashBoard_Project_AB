# ============================================
# LOGGING MIDDLEWARE - Request/Response Logging
# ============================================

import time
import uuid
from datetime import datetime
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import json

from app.core.config import settings


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging HTTP requests and responses
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate request ID
        request_id = str(uuid.uuid4())[:8]
        
        # Start timer
        start_time = time.time()
        
        # Get request details
        method = request.method
        url = str(request.url)
        client_ip = request.client.host if request.client else "unknown"
        
        # Log request
        if settings.debug:
            print(f"[{request_id}] --> {method} {url} from {client_ip}")
        
        # Process request
        try:
            response = await call_next(request)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Log response
            status_code = response.status_code
            if settings.debug:
                print(f"[{request_id}] <-- {status_code} ({duration:.3f}s)")
            
            # Add headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{duration:.3f}s"
            
            return response
            
        except Exception as e:
            duration = time.time() - start_time
            print(f"[{request_id}] !!! Error after {duration:.3f}s: {str(e)}")
            raise


class RequestContextMiddleware:
    """
    Middleware to add request context (request ID, timestamp)
    """
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            # Add request context
            scope["request_id"] = str(uuid.uuid4())[:8]
            scope["request_time"] = datetime.utcnow()
        
        await self.app(scope, receive, send)


def get_request_id(request: Request) -> str:
    """Get request ID from request scope"""
    return request.scope.get("request_id", "unknown")


def get_request_time(request: Request) -> datetime:
    """Get request timestamp from request scope"""
    return request.scope.get("request_time", datetime.utcnow())
