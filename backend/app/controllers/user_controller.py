# ============================================
# USER CONTROLLER - User Business Logic
# ============================================

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.services import UserService
from app.schemas import (
    UserResponse,
    UserUpdate,
    UserBrief,
    CurrentUser,
    MessageResponse
)


class UserController:
    """Controller for user operations"""
    
    def __init__(self, db: AsyncSession):
        self.user_service = UserService(db)
    
    async def get_user(
        self,
        user_id: int
    ) -> UserResponse:
        """Get user by ID"""
        user = await self.user_service.get_user(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found"
            )
        
        return user
    
    async def get_all_users(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[UserResponse]:
        """Get all users"""
        return await self.user_service.get_all_users(skip, limit)
    
    async def update_profile(
        self,
        current_user: CurrentUser,
        update_data: UserUpdate
    ) -> UserResponse:
        """Update current user's profile"""
        user = await self.user_service.update_user(
            current_user.id, update_data
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user
    
    async def search_users(
        self,
        query: str,
        skip: int = 0,
        limit: int = 20
    ) -> List[UserBrief]:
        """Search users by name or email"""
        if len(query) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Search query must be at least 2 characters"
            )
        
        return await self.user_service.search_users(query, skip, limit)
    
    async def get_assignable_users(self) -> List[UserBrief]:
        """Get list of users that can be assigned tickets"""
        return await self.user_service.get_assignable_users()
    
    async def get_user_count(self) -> dict:
        """Get total user count"""
        count = await self.user_service.get_user_count()
        return {"count": count}
