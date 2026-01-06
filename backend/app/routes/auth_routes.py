# ============================================
# AUTH ROUTES - Authentication Endpoints
# ============================================
# Uses Microsoft SSO directly - no JWT generation

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.controllers import AuthController
from app.middleware import get_current_user, get_current_user_optional
from app.schemas import (
    AzureAuthRequest,
    UserResponse,
    CurrentUser
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=UserResponse)
async def login(
    auth_request: AzureAuthRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Login with Azure AD access token.
    Creates/updates user in database and returns user info.
    Note: No JWT generated - frontend uses Azure token directly.
    """
    controller = AuthController(db)
    return await controller.login_with_azure(auth_request)


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user's profile from Azure AD token.
    """
    controller = AuthController(db)
    return await controller.get_me(current_user)


@router.get("/verify")
async def verify_token(
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Verify if Azure AD token is valid.
    Returns user info if valid.
    """
    return {
        "valid": True,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "is_admin": current_user.is_admin
        }
    }
