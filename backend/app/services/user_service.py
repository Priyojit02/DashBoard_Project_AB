# ============================================
# USER SERVICE - User Management Operations
# ============================================

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories import UserRepository
from app.models import User
from app.schemas import UserResponse, UserUpdate, UserBrief


class UserService:
    """Service for user management operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
    
    async def get_user(self, user_id: int) -> Optional[UserResponse]:
        """Get user by ID"""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            return None
        return UserResponse.model_validate(user)
    
    async def get_user_by_email(self, email: str) -> Optional[UserResponse]:
        """Get user by email"""
        user = await self.user_repo.get_by_email(email)
        if not user:
            return None
        return UserResponse.model_validate(user)
    
    async def get_all_users(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[UserResponse]:
        """Get all active users"""
        users = await self.user_repo.get_active_users(skip=skip, limit=limit)
        return [UserResponse.model_validate(user) for user in users]
    
    async def get_user_count(self) -> int:
        """Get total count of active users"""
        return await self.user_repo.get_user_count()
    
    async def update_user(
        self,
        user_id: int,
        update_data: UserUpdate
    ) -> Optional[UserResponse]:
        """Update user profile"""
        user = await self.user_repo.update(
            user_id,
            update_data.model_dump(exclude_unset=True)
        )
        if not user:
            return None
        return UserResponse.model_validate(user)
    
    async def search_users(
        self,
        query: str,
        skip: int = 0,
        limit: int = 20
    ) -> List[UserBrief]:
        """Search users by name or email"""
        users = await self.user_repo.search_users(query, skip, limit)
        return [UserBrief.model_validate(user) for user in users]
    
    async def get_assignable_users(self) -> List[UserBrief]:
        """Get list of users that can be assigned tickets"""
        users = await self.user_repo.get_active_users(limit=500)
        return [UserBrief.model_validate(user) for user in users]
    
    async def deactivate_user(self, user_id: int) -> bool:
        """Deactivate a user account"""
        user = await self.user_repo.update(user_id, {"is_active": False})
        return user is not None
    
    async def reactivate_user(self, user_id: int) -> bool:
        """Reactivate a user account"""
        user = await self.user_repo.update(user_id, {"is_active": True})
        return user is not None
