# ============================================
# ANALYTICS ROUTES - Analytics Endpoints
# ============================================

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.controllers import AnalyticsController
from app.middleware import get_current_user
from app.schemas import (
    AnalyticsResponse,
    DashboardStats,
    CurrentUser
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get dashboard statistics.
    """
    controller = AnalyticsController(db)
    return await controller.get_dashboard_stats()


@router.get("/full", response_model=AnalyticsResponse)
async def get_full_analytics(
    days: int = Query(30, ge=1, le=365),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get comprehensive analytics for the specified number of days.
    """
    controller = AnalyticsController(db)
    return await controller.get_full_analytics(days)


@router.get("/user")
async def get_user_analytics(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get analytics for current user.
    """
    controller = AnalyticsController(db)
    return await controller.get_user_analytics(current_user)


@router.get("/categories")
async def get_category_summary(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get summary by SAP category.
    """
    controller = AnalyticsController(db)
    return await controller.get_category_summary()
