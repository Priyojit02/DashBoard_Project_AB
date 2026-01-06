# ============================================
# ERROR HANDLER MIDDLEWARE - Global Exception Handling
# ============================================

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError
import traceback
from datetime import datetime

from app.core.config import settings


class ErrorHandlerMiddleware:
    """
    Middleware for global error handling
    """
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        try:
            await self.app(scope, receive, send)
        except Exception as e:
            # This catches errors not handled by FastAPI's exception handlers
            response = await self.handle_exception(e)
            await response(scope, receive, send)
    
    async def handle_exception(self, exc: Exception) -> JSONResponse:
        """Handle unexpected exceptions"""
        error_id = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        
        # Log the full traceback
        print(f"[Error {error_id}] Unhandled exception:")
        traceback.print_exc()
        
        # Return generic error in production
        if settings.debug:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "detail": str(exc),
                    "error_id": error_id,
                    "type": type(exc).__name__
                }
            )
        else:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "detail": "An internal server error occurred",
                    "error_id": error_id
                }
            )


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": errors
        }
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors"""
    error_id = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    
    # Log the error
    print(f"[Database Error {error_id}]:")
    traceback.print_exc()
    
    if settings.debug:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": f"Database error: {str(exc)}",
                "error_id": error_id
            }
        )
    else:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "A database error occurred",
                "error_id": error_id
            }
        )


def register_exception_handlers(app):
    """Register all exception handlers with the FastAPI app"""
    from fastapi import HTTPException
    
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
