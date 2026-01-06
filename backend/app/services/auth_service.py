# ============================================
# AUTH SERVICE - Authentication & Azure AD SSO
# ============================================
# Uses Microsoft SSO directly - no JWT generation

from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.core.config import settings
from app.repositories import UserRepository
from app.models import User
from app.schemas import UserResponse, CurrentUser


class AuthService:
    """Service for authentication operations - Azure AD SSO"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
    
    async def verify_azure_token(self, access_token: str) -> Optional[dict]:
        """
        Verify Azure AD access token and get user info from Microsoft Graph API
        """
        try:
            async with httpx.AsyncClient() as client:
                # Get user info from Microsoft Graph
                response = await client.get(
                    "https://graph.microsoft.com/v1.0/me",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if response.status_code != 200:
                    return None
                
                user_data = response.json()
                return {
                    "azure_id": user_data.get("id"),
                    "email": user_data.get("mail") or user_data.get("userPrincipalName"),
                    "name": user_data.get("displayName"),
                    "department": user_data.get("department"),
                    "job_title": user_data.get("jobTitle"),
                }
        except Exception as e:
            print(f"Error verifying Azure token: {e}")
            return None
    
    async def authenticate_with_azure(self, azure_access_token: str) -> Optional[User]:
        """
        Authenticate user with Azure AD token
        Creates or updates user in database and returns user object
        Note: No JWT generated - frontend uses Azure token directly
        """
        # Verify Azure token and get user info
        azure_user = await self.verify_azure_token(azure_access_token)
        if not azure_user:
            return None
        
        # Create or update user in database
        user = await self.user_repo.create_or_update_from_azure(
            azure_id=azure_user["azure_id"],
            email=azure_user["email"],
            name=azure_user["name"],
            department=azure_user.get("department")
        )
        
        return user
    
    async def get_user_by_azure_id(self, azure_id: str) -> Optional[User]:
        """Get user from database by Azure ID"""
        return await self.user_repo.get_by_azure_id(azure_id)
    
    async def create_or_update_user(
        self,
        azure_id: str,
        email: str,
        name: str,
        department: Optional[str] = None
    ) -> Optional[User]:
        """Create or update user in database"""
        return await self.user_repo.create_or_update_from_azure(
            azure_id=azure_id,
            email=email,
            name=name,
            department=department
        )
    
    async def get_current_user(self, user_id: int) -> Optional[User]:
        """Get current user from database by ID"""
        return await self.user_repo.get_by_id(user_id)
