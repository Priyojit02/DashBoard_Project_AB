# ============================================
# ADMIN ROUTES - Admin Endpoints
# ============================================

from typing import List
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.controllers import AdminController
from app.middleware import get_current_user, get_admin_user
from app.schemas import (
    UserResponse,
    AdminUserResponse,
    AdminActionRequest,
    AdminAuditLogResponse,
    CurrentUser,
    MessageResponse
)

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: CurrentUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all users (admin only).
    """
    controller = AdminController(db)
    return await controller.get_all_users(current_user, skip, limit)


@router.get("/admins", response_model=List[AdminUserResponse])
async def get_all_admins(
    current_user: CurrentUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all admin users.
    """
    controller = AdminController(db)
    return await controller.get_all_admins(current_user)


@router.post("/admins/add", response_model=UserResponse)
async def add_admin(
    action_request: AdminActionRequest,
    request: Request,
    current_user: CurrentUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add a user as admin.
    """
    ip_address = request.client.host if request.client else None
    controller = AdminController(db)
    return await controller.add_admin(current_user, action_request, ip_address)


@router.post("/admins/remove", response_model=UserResponse)
async def remove_admin(
    action_request: AdminActionRequest,
    request: Request,
    current_user: CurrentUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove admin status from a user.
    """
    ip_address = request.client.host if request.client else None
    controller = AdminController(db)
    return await controller.remove_admin(current_user, action_request, ip_address)


@router.get("/stats")
async def get_admin_stats(
    current_user: CurrentUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get admin statistics.
    """
    controller = AdminController(db)
    return await controller.get_admin_stats(current_user)


@router.get("/audit-logs", response_model=List[AdminAuditLogResponse])
async def get_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: CurrentUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get admin audit logs.
    """
    controller = AdminController(db)
    return await controller.get_audit_logs(current_user, skip, limit)


@router.post("/users/{user_id}/deactivate", response_model=MessageResponse)
async def deactivate_user(
    user_id: int,
    request: Request,
    current_user: CurrentUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Deactivate a user.
    """
    ip_address = request.client.host if request.client else None
    controller = AdminController(db)
    return await controller.deactivate_user(current_user, user_id, ip_address)


@router.post("/users/{user_id}/reactivate", response_model=MessageResponse)
async def reactivate_user(
    user_id: int,
    request: Request,
    current_user: CurrentUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Reactivate a user.
    """
    ip_address = request.client.host if request.client else None
    controller = AdminController(db)
    return await controller.reactivate_user(current_user, user_id, ip_address)
