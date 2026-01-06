# ============================================
# ADMIN CONTROLLER - Admin Business Logic
# ============================================

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.services import AdminService
from app.schemas import (
    UserResponse,
    AdminUserResponse,
    AdminActionRequest,
    AdminAuditLogResponse,
    CurrentUser,
    MessageResponse
)


class AdminController:
    """Controller for admin operations"""
    
    def __init__(self, db: AsyncSession):
        self.admin_service = AdminService(db)
    
    def _check_admin(self, current_user: CurrentUser):
        """Check if current user is admin"""
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
    
    async def get_all_admins(
        self,
        current_user: CurrentUser
    ) -> List[AdminUserResponse]:
        """Get all admin users"""
        self._check_admin(current_user)
        return await self.admin_service.get_all_admins()
    
    async def get_all_users(
        self,
        current_user: CurrentUser,
        skip: int = 0,
        limit: int = 100
    ) -> List[UserResponse]:
        """Get all users (admin view)"""
        self._check_admin(current_user)
        return await self.admin_service.get_all_users(skip, limit)
    
    async def add_admin(
        self,
        current_user: CurrentUser,
        action_request: AdminActionRequest,
        ip_address: Optional[str] = None
    ) -> UserResponse:
        """Add a user as admin"""
        self._check_admin(current_user)
        
        user = await self.admin_service.add_admin(
            user_id=action_request.user_id,
            current_admin=current_user,
            ip_address=ip_address
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user
    
    async def remove_admin(
        self,
        current_user: CurrentUser,
        action_request: AdminActionRequest,
        ip_address: Optional[str] = None
    ) -> UserResponse:
        """Remove admin status from a user"""
        self._check_admin(current_user)
        
        # Check if trying to remove self
        if action_request.user_id == current_user.id:
            admin_count = await self.admin_service.get_admin_count()
            if admin_count <= 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot remove the last admin"
                )
        
        user = await self.admin_service.remove_admin(
            user_id=action_request.user_id,
            current_admin=current_user,
            ip_address=ip_address
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user
    
    async def get_admin_stats(
        self,
        current_user: CurrentUser
    ) -> dict:
        """Get admin statistics"""
        self._check_admin(current_user)
        
        admin_count = await self.admin_service.get_admin_count()
        user_count = await self.admin_service.get_user_count()
        
        return {
            "total_users": user_count,
            "total_admins": admin_count
        }
    
    async def get_audit_logs(
        self,
        current_user: CurrentUser,
        skip: int = 0,
        limit: int = 50
    ) -> List[AdminAuditLogResponse]:
        """Get admin audit logs"""
        self._check_admin(current_user)
        return await self.admin_service.get_audit_logs(skip, limit)
    
    async def deactivate_user(
        self,
        current_user: CurrentUser,
        user_id: int,
        ip_address: Optional[str] = None
    ) -> MessageResponse:
        """Deactivate a user"""
        self._check_admin(current_user)
        
        if user_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate yourself"
            )
        
        success = await self.admin_service.deactivate_user(
            user_id=user_id,
            current_admin=current_user,
            ip_address=ip_address
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return MessageResponse(message="User deactivated successfully")
    
    async def reactivate_user(
        self,
        current_user: CurrentUser,
        user_id: int,
        ip_address: Optional[str] = None
    ) -> MessageResponse:
        """Reactivate a user"""
        self._check_admin(current_user)
        
        success = await self.admin_service.reactivate_user(
            user_id=user_id,
            current_admin=current_user,
            ip_address=ip_address
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return MessageResponse(message="User reactivated successfully")
