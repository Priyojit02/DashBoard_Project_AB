# ============================================
# USER ROUTES - User Endpoints
# ============================================

from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.controllers import UserController
from app.middleware import get_current_user
from app.schemas import (
    UserResponse,
    UserUpdate,
    UserBrief,
    CurrentUser
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserResponse])
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all users.
    """
    controller = UserController(db)
    return await controller.get_all_users(skip, limit)


@router.get("/search", response_model=List[UserBrief])
async def search_users(
    query: str = Query(..., min_length=2),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Search users by name or email.
    """
    controller = UserController(db)
    return await controller.search_users(query, skip, limit)


@router.get("/assignable", response_model=List[UserBrief])
async def get_assignable_users(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of users that can be assigned tickets.
    """
    controller = UserController(db)
    return await controller.get_assignable_users()


@router.get("/count")
async def get_user_count(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get total user count.
    """
    controller = UserController(db)
    return await controller.get_user_count()


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user by ID.
    """
    controller = UserController(db)
    return await controller.get_user(user_id)


@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user's profile.
    """
    controller = UserController(db)
    return await controller.update_profile(current_user, update_data)
