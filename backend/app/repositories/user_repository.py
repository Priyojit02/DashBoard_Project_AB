# ============================================
# USER REPOSITORY - Database Operations for Users
# ============================================

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime

from app.repositories.base_repository import BaseRepository
from app.models import User


class UserRepository(BaseRepository[User]):
    """Repository for User model operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(User, db)
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email address"""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_by_azure_id(self, azure_id: str) -> Optional[User]:
        """Get user by Azure AD ID"""
        result = await self.db.execute(
            select(User).where(User.azure_id == azure_id)
        )
        return result.scalar_one_or_none()
    
    async def get_admins(self) -> List[User]:
        """Get all admin users"""
        result = await self.db.execute(
            select(User).where(User.is_admin == True).order_by(User.name)
        )
        return list(result.scalars().all())
    
    async def get_active_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all active users"""
        result = await self.db.execute(
            select(User)
            .where(User.is_active == True)
            .order_by(User.name)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_user_count(self) -> int:
        """Get total count of active users"""
        result = await self.db.execute(
            select(func.count()).select_from(User).where(User.is_active == True)
        )
        return result.scalar_one()
    
    async def get_admin_count(self) -> int:
        """Get count of admin users"""
        result = await self.db.execute(
            select(func.count()).select_from(User).where(User.is_admin == True)
        )
        return result.scalar_one()
    
    async def update_last_login(self, user_id: int) -> Optional[User]:
        """Update user's last login timestamp"""
        return await self.update(user_id, {"last_login": datetime.utcnow()})
    
    async def set_admin_status(self, user_id: int, is_admin: bool) -> Optional[User]:
        """Set user's admin status"""
        return await self.update(user_id, {"is_admin": is_admin})
    
    async def create_or_update_from_azure(
        self,
        azure_id: str,
        email: str,
        name: str,
        department: Optional[str] = None
    ) -> User:
        """Create or update user from Azure AD login"""
        existing_user = await self.get_by_azure_id(azure_id)
        
        if existing_user:
            # Update existing user
            return await self.update(existing_user.id, {
                "email": email,
                "name": name,
                "department": department,
                "last_login": datetime.utcnow()
            })
        
        # Check if this is the first user (make them admin)
        user_count = await self.get_user_count()
        is_first_user = user_count == 0
        
        # Create new user
        return await self.create({
            "azure_id": azure_id,
            "email": email,
            "name": name,
            "department": department,
            "is_admin": is_first_user,  # First user becomes admin
            "last_login": datetime.utcnow()
        })
    
    async def search_users(
        self,
        query: str,
        skip: int = 0,
        limit: int = 20
    ) -> List[User]:
        """Search users by name or email"""
        search_term = f"%{query.lower()}%"
        result = await self.db.execute(
            select(User)
            .where(
                (func.lower(User.name).like(search_term)) |
                (func.lower(User.email).like(search_term))
            )
            .where(User.is_active == True)
            .order_by(User.name)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
