# ============================================
# ADMIN SERVICE - Admin Management Operations
# ============================================

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.repositories import UserRepository
from app.models import User, AdminAuditLog
from app.schemas import (
    UserResponse,
    AdminUserResponse,
    AdminAuditLogResponse,
    CurrentUser
)
from app.core.database import Base


class AdminService:
    """Service for admin management operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
    
    async def get_all_admins(self) -> List[AdminUserResponse]:
        """Get all admin users"""
        admins = await self.user_repo.get_admins()
        return [
            AdminUserResponse(
                id=admin.id,
                email=admin.email,
                name=admin.name,
                department=admin.department,
                is_admin=True,
                added_at=admin.updated_at  # Using updated_at as proxy for when admin status was set
            )
            for admin in admins
        ]
    
    async def get_all_users(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[UserResponse]:
        """Get all users (admin function)"""
        users = await self.user_repo.get_active_users(skip=skip, limit=limit)
        return [UserResponse.model_validate(user) for user in users]
    
    async def add_admin(
        self,
        user_id: int,
        current_admin: CurrentUser,
        ip_address: Optional[str] = None
    ) -> Optional[UserResponse]:
        """Add a user as admin"""
        if not current_admin.is_admin:
            return None
        
        user = await self.user_repo.set_admin_status(user_id, True)
        if not user:
            return None
        
        # Create audit log
        await self._create_audit_log(
            admin_id=current_admin.id,
            action="add_admin",
            target_user_id=user_id,
            details={"action": "Added as admin"},
            ip_address=ip_address
        )
        
        return UserResponse.model_validate(user)
    
    async def remove_admin(
        self,
        user_id: int,
        current_admin: CurrentUser,
        ip_address: Optional[str] = None
    ) -> Optional[UserResponse]:
        """Remove admin status from a user"""
        if not current_admin.is_admin:
            return None
        
        # Prevent removing self as admin if they're the only admin
        if user_id == current_admin.id:
            admin_count = await self.user_repo.get_admin_count()
            if admin_count <= 1:
                return None  # Can't remove the last admin
        
        user = await self.user_repo.set_admin_status(user_id, False)
        if not user:
            return None
        
        # Create audit log
        await self._create_audit_log(
            admin_id=current_admin.id,
            action="remove_admin",
            target_user_id=user_id,
            details={"action": "Removed as admin"},
            ip_address=ip_address
        )
        
        return UserResponse.model_validate(user)
    
    async def get_admin_count(self) -> int:
        """Get count of admin users"""
        return await self.user_repo.get_admin_count()
    
    async def get_user_count(self) -> int:
        """Get count of all users"""
        return await self.user_repo.get_user_count()
    
    async def is_user_admin(self, user_id: int) -> bool:
        """Check if a user is an admin"""
        user = await self.user_repo.get_by_id(user_id)
        return user.is_admin if user else False
    
    async def get_audit_logs(
        self,
        skip: int = 0,
        limit: int = 50
    ) -> List[AdminAuditLogResponse]:
        """Get admin audit logs"""
        from sqlalchemy import select, desc
        from sqlalchemy.orm import selectinload
        
        result = await self.db.execute(
            select(AdminAuditLog)
            .options(
                selectinload(AdminAuditLog.admin),
                selectinload(AdminAuditLog.target_user)
            )
            .order_by(desc(AdminAuditLog.created_at))
            .offset(skip)
            .limit(limit)
        )
        logs = list(result.scalars().all())
        return [AdminAuditLogResponse.model_validate(log) for log in logs]
    
    async def _create_audit_log(
        self,
        admin_id: int,
        action: str,
        target_user_id: Optional[int] = None,
        details: Optional[dict] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> AdminAuditLog:
        """Create an admin audit log entry"""
        log = AdminAuditLog(
            admin_id=admin_id,
            action=action,
            target_user_id=target_user_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent
        )
        self.db.add(log)
        await self.db.flush()
        return log
    
    async def deactivate_user(
        self,
        user_id: int,
        current_admin: CurrentUser,
        ip_address: Optional[str] = None
    ) -> bool:
        """Deactivate a user (admin function)"""
        if not current_admin.is_admin:
            return False
        
        if user_id == current_admin.id:
            return False  # Can't deactivate self
        
        user = await self.user_repo.update(user_id, {"is_active": False})
        if not user:
            return False
        
        # Create audit log
        await self._create_audit_log(
            admin_id=current_admin.id,
            action="deactivate_user",
            target_user_id=user_id,
            details={"action": "User deactivated"},
            ip_address=ip_address
        )
        
        return True
    
    async def reactivate_user(
        self,
        user_id: int,
        current_admin: CurrentUser,
        ip_address: Optional[str] = None
    ) -> bool:
        """Reactivate a user (admin function)"""
        if not current_admin.is_admin:
            return False
        
        user = await self.user_repo.update(user_id, {"is_active": True})
        if not user:
            return False
        
        # Create audit log
        await self._create_audit_log(
            admin_id=current_admin.id,
            action="reactivate_user",
            target_user_id=user_id,
            details={"action": "User reactivated"},
            ip_address=ip_address
        )
        
        return True
