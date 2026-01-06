# ============================================
# ANALYTICS CONTROLLER - Analytics Business Logic
# ============================================

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.services import AnalyticsService
from app.schemas import (
    AnalyticsResponse,
    DashboardStats,
    CurrentUser
)


class AnalyticsController:
    """Controller for analytics operations"""
    
    def __init__(self, db: AsyncSession):
        self.analytics_service = AnalyticsService(db)
    
    async def get_dashboard_stats(self) -> DashboardStats:
        """Get dashboard statistics"""
        return await self.analytics_service.get_dashboard_stats()
    
    async def get_full_analytics(
        self,
        days: int = 30
    ) -> AnalyticsResponse:
        """Get comprehensive analytics"""
        if days < 1 or days > 365:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Days must be between 1 and 365"
            )
        
        return await self.analytics_service.get_full_analytics(days)
    
    async def get_user_analytics(
        self,
        current_user: CurrentUser
    ) -> dict:
        """Get analytics for current user"""
        return await self.analytics_service.get_user_analytics(current_user.id)
    
    async def get_category_summary(self) -> list:
        """Get summary by SAP category"""
        return await self.analytics_service.get_category_summary()
