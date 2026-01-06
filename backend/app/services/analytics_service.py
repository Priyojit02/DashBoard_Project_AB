# ============================================
# ANALYTICS SERVICE - Dashboard & Analytics
# ============================================

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

from app.repositories import TicketRepository, UserRepository
from app.schemas import (
    TicketStats,
    CategoryStats,
    PriorityStats,
    TrendDataPoint,
    AnalyticsResponse,
    DashboardStats,
    TicketResponse
)


class AnalyticsService:
    """Service for analytics and dashboard operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ticket_repo = TicketRepository(db)
        self.user_repo = UserRepository(db)
    
    async def get_dashboard_stats(self) -> DashboardStats:
        """Get dashboard statistics"""
        # Get ticket counts by status
        status_counts = await self.ticket_repo.get_status_counts()
        priority_counts = await self.ticket_repo.get_priority_counts()
        
        # Calculate totals
        total_tickets = sum(status_counts.values())
        open_tickets = status_counts.get("Open", 0) + status_counts.get("In Progress", 0)
        
        # Get recent tickets
        recent_tickets = await self.ticket_repo.get_recent_tickets(limit=5)
        
        # Get average resolution time
        avg_resolution_time = await self.ticket_repo.get_average_resolution_time()
        
        # Calculate resolved today
        # This is a simplified version - in production, you'd filter by date
        resolved_today = status_counts.get("Resolved", 0) // 30  # Approximation
        
        return DashboardStats(
            total_tickets=total_tickets,
            open_tickets=open_tickets,
            resolved_today=resolved_today,
            avg_response_time=avg_resolution_time,
            tickets_by_status=status_counts,
            tickets_by_priority=priority_counts,
            recent_tickets=[TicketResponse.model_validate(t) for t in recent_tickets]
        )
    
    async def get_full_analytics(self, days: int = 30) -> AnalyticsResponse:
        """Get comprehensive analytics data"""
        # Get counts
        status_counts = await self.ticket_repo.get_status_counts()
        priority_counts = await self.ticket_repo.get_priority_counts()
        category_counts = await self.ticket_repo.get_category_counts()
        
        # Calculate totals
        total_tickets = sum(status_counts.values())
        
        # Build ticket stats
        ticket_stats = TicketStats(
            total=total_tickets,
            open=status_counts.get("Open", 0),
            in_progress=status_counts.get("In Progress", 0),
            resolved=status_counts.get("Resolved", 0),
            closed=status_counts.get("Closed", 0),
            awaiting_info=status_counts.get("Awaiting Info", 0)
        )
        
        # Build category breakdown
        category_breakdown = []
        for category, count in category_counts.items():
            percentage = (count / total_tickets * 100) if total_tickets > 0 else 0
            category_breakdown.append(CategoryStats(
                category=category,
                count=count,
                percentage=round(percentage, 2)
            ))
        
        # Build priority breakdown
        priority_breakdown = []
        for priority, count in priority_counts.items():
            percentage = (count / total_tickets * 100) if total_tickets > 0 else 0
            priority_breakdown.append(PriorityStats(
                priority=priority,
                count=count,
                percentage=round(percentage, 2)
            ))
        
        # Get daily trends
        daily_data = await self.ticket_repo.get_daily_ticket_counts(days)
        daily_trends = [TrendDataPoint(date=d["date"], count=d["count"]) for d in daily_data]
        
        # Get average resolution time
        avg_resolution_time = await self.ticket_repo.get_average_resolution_time()
        
        # Calculate SLA compliance (simplified - tickets resolved within 24 hours)
        # In production, you'd have actual SLA rules
        sla_compliance_rate = 85.0  # Placeholder
        
        return AnalyticsResponse(
            ticket_stats=ticket_stats,
            category_breakdown=category_breakdown,
            priority_breakdown=priority_breakdown,
            daily_trends=daily_trends,
            avg_resolution_time=avg_resolution_time,
            sla_compliance_rate=sla_compliance_rate
        )
    
    async def get_user_analytics(self, user_id: int) -> dict:
        """Get analytics for a specific user"""
        tickets, total = await self.ticket_repo.get_user_tickets(user_id, skip=0, limit=1000)
        
        status_counts = {}
        priority_counts = {}
        category_counts = {}
        
        for ticket in tickets:
            status = ticket.status.value
            priority = ticket.priority.value
            category = ticket.category.value
            
            status_counts[status] = status_counts.get(status, 0) + 1
            priority_counts[priority] = priority_counts.get(priority, 0) + 1
            category_counts[category] = category_counts.get(category, 0) + 1
        
        return {
            "total_tickets": total,
            "tickets_by_status": status_counts,
            "tickets_by_priority": priority_counts,
            "tickets_by_category": category_counts
        }
    
    async def get_category_summary(self) -> List[dict]:
        """Get summary by category with detailed stats"""
        category_counts = await self.ticket_repo.get_category_counts()
        
        results = []
        for category, count in category_counts.items():
            results.append({
                "category": category,
                "count": count,
                "description": self._get_category_description(category)
            })
        
        return sorted(results, key=lambda x: x["count"], reverse=True)
    
    def _get_category_description(self, category: str) -> str:
        """Get description for SAP category"""
        descriptions = {
            "MM": "Material Management",
            "SD": "Sales & Distribution",
            "FICO": "Finance & Controlling",
            "PP": "Production Planning",
            "HCM": "Human Capital Management",
            "PM": "Plant Maintenance",
            "QM": "Quality Management",
            "WM": "Warehouse Management",
            "PS": "Project System",
            "BW": "Business Warehouse",
            "ABAP": "ABAP Development",
            "BASIS": "Basis/Admin",
            "OTHER": "Other/Unknown"
        }
        return descriptions.get(category, category)
