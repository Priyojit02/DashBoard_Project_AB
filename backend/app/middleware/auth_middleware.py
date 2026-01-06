# ============================================
# AUTH MIDDLEWARE - Azure AD SSO Authentication
# ============================================
# Uses Microsoft SSO token directly - no JWT needed

from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.schemas import CurrentUser
from app.repositories import UserRepository


# Security scheme
security = HTTPBearer(auto_error=False)


async def get_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[str]:
    """Extract token from Authorization header"""
    if credentials:
        return credentials.credentials
    return None


async def verify_azure_token(token: str) -> dict:
    """
    Verify Azure AD token by calling Microsoft Graph API
    Returns user info if valid
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://graph.microsoft.com/v1.0/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired Azure AD token",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return response.json()


async def get_current_user(
    token: Optional[str] = Depends(get_token),
    db: AsyncSession = Depends(get_db)
) -> CurrentUser:
    """
    Dependency to get current authenticated user from Azure AD token
    Verifies token with Microsoft Graph API and gets user from DB
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required - please login with Microsoft SSO",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Verify token with Microsoft Graph
    user_data = await verify_azure_token(token)
    azure_id = user_data.get("id", "")
    
    # Get user from database to get correct id and is_admin status
    user_repo = UserRepository(db)
    db_user = await user_repo.get_by_azure_id(azure_id)
    
    # Return user info - merge Azure data with DB data
    return CurrentUser(
        id=db_user.id if db_user else 0,
        azure_id=azure_id,
        email=user_data.get("mail") or user_data.get("userPrincipalName", ""),
        name=user_data.get("displayName", ""),
        is_admin=db_user.is_admin if db_user else False
    )


async def get_current_user_optional(
    token: Optional[str] = Depends(get_token),
    db: AsyncSession = Depends(get_db)
) -> Optional[CurrentUser]:
    """
    Optional user dependency - doesn't raise error if not authenticated
    """
    if not token:
        return None
    
    try:
        user_data = await verify_azure_token(token)
        azure_id = user_data.get("id", "")
        
        # Get user from database
        user_repo = UserRepository(db)
        db_user = await user_repo.get_by_azure_id(azure_id)
        
        return CurrentUser(
            id=db_user.id if db_user else 0,
            azure_id=azure_id,
            email=user_data.get("mail") or user_data.get("userPrincipalName", ""),
            name=user_data.get("displayName", ""),
            is_admin=db_user.is_admin if db_user else False
        )
    except HTTPException:
        return None


async def get_admin_user(
    current_user: CurrentUser = Depends(get_current_user)
) -> CurrentUser:
    """
    Dependency to verify user is an admin
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return current_user


class AuthMiddleware:
    """
    Middleware class for authentication (can be used for request-level auth)
    """
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            headers = dict(scope.get("headers", []))
            auth_header = headers.get(b"authorization", b"").decode()

            # This project authenticates via Azure AD access tokens verified against
            # Microsoft Graph in the dependency layer (get_current_user). Keep this
            # middleware as a safe no-op to avoid introducing a second auth mechanism.
            scope["user"] = None
            if auth_header.startswith("Bearer "):
                scope["auth_token"] = auth_header[7:]
            else:
                scope["auth_token"] = None
        
        await self.app(scope, receive, send)
