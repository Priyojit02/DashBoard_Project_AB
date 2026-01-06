# ============================================
# AUTH CONTROLLER - Authentication Business Logic
# ============================================
# Uses Microsoft SSO directly - no JWT generation

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.services import AuthService
from app.schemas import AzureAuthRequest, CurrentUser, UserResponse


class AuthController:
    """Controller for authentication operations"""
    
    def __init__(self, db: AsyncSession):
        self.auth_service = AuthService(db)
    
    async def login_with_azure(
        self,
        auth_request: AzureAuthRequest
    ) -> UserResponse:
        """
        Authenticate user with Azure AD token
        Creates/updates user in database and returns user info
        Note: No JWT generated - frontend uses Azure token directly
        """
        user = await self.auth_service.authenticate_with_azure(
            auth_request.access_token
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Azure AD token or authentication failed"
            )
        
        return UserResponse.model_validate(user)
    
    async def get_me(
        self,
        current_user: CurrentUser
    ) -> UserResponse:
        """Get current user's full profile from database"""
        # First try to get user by azure_id
        user = await self.auth_service.get_user_by_azure_id(current_user.azure_id)
        
        if not user:
            # If not found, create a new user record
            user = await self.auth_service.create_or_update_user(
                azure_id=current_user.azure_id,
                email=current_user.email,
                name=current_user.name
            )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse.model_validate(user)
