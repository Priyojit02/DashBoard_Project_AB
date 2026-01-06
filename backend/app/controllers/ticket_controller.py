# ============================================
# TICKET CONTROLLER - Ticket Business Logic
# ============================================

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.services import TicketService
from app.schemas import (
    TicketCreate,
    TicketUpdate,
    TicketResponse,
    TicketDetailResponse,
    TicketListResponse,
    TicketLogResponse,
    TicketCommentCreate,
    TicketCommentUpdate,
    TicketCommentResponse,
    CurrentUser,
    MessageResponse
)


class TicketController:
    """Controller for ticket operations"""
    
    def __init__(self, db: AsyncSession):
        self.ticket_service = TicketService(db)
    
    async def create_ticket(
        self,
        ticket_data: TicketCreate,
        current_user: CurrentUser
    ) -> TicketResponse:
        """Create a new ticket"""
        return await self.ticket_service.create_ticket(ticket_data, current_user)
    
    async def get_ticket(
        self,
        ticket_id: int
    ) -> TicketDetailResponse:
        """Get ticket by ID with full details"""
        ticket = await self.ticket_service.get_ticket(ticket_id)
        
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket with ID {ticket_id} not found"
            )
        
        return ticket
    
    async def get_ticket_by_ticket_id(
        self,
        ticket_id: str
    ) -> TicketDetailResponse:
        """Get ticket by ticket_id (T-001 format)"""
        ticket = await self.ticket_service.get_ticket_by_ticket_id(ticket_id)
        
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket {ticket_id} not found"
            )
        
        return ticket
    
    async def get_tickets(
        self,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        assigned_to: Optional[int] = None,
        created_by: Optional[int] = None,
        search: Optional[str] = None,
        order_by: str = "created_at",
        order_desc: bool = True
    ) -> TicketListResponse:
        """Get paginated list of tickets with filters"""
        return await self.ticket_service.get_tickets(
            skip=skip,
            limit=limit,
            status=status,
            priority=priority,
            category=category,
            assigned_to=assigned_to,
            created_by=created_by,
            search=search,
            order_by=order_by,
            order_desc=order_desc
        )
    
    async def update_ticket(
        self,
        ticket_id: int,
        update_data: TicketUpdate,
        current_user: CurrentUser
    ) -> TicketResponse:
        """Update a ticket"""
        ticket = await self.ticket_service.update_ticket(
            ticket_id, update_data, current_user
        )
        
        if not ticket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket with ID {ticket_id} not found"
            )
        
        return ticket
    
    async def delete_ticket(
        self,
        ticket_id: int,
        current_user: CurrentUser
    ) -> MessageResponse:
        """Delete a ticket (admin only)"""
        if not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can delete tickets"
            )
        
        success = await self.ticket_service.delete_ticket(ticket_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket with ID {ticket_id} not found"
            )
        
        return MessageResponse(message="Ticket deleted successfully")
    
    async def add_comment(
        self,
        ticket_id: int,
        comment_data: TicketCommentCreate,
        current_user: CurrentUser
    ) -> TicketCommentResponse:
        """Add a comment to a ticket"""
        # Override ticket_id from URL
        comment_data.ticket_id = ticket_id
        
        comment = await self.ticket_service.add_comment(
            ticket_id, comment_data, current_user
        )
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticket with ID {ticket_id} not found"
            )
        
        return comment
    
    async def update_comment(
        self,
        comment_id: int,
        update_data: TicketCommentUpdate,
        current_user: CurrentUser
    ) -> TicketCommentResponse:
        """Update a comment"""
        comment = await self.ticket_service.update_comment(
            comment_id, update_data, current_user
        )
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found or you don't have permission to edit it"
            )
        
        return comment
    
    async def delete_comment(
        self,
        comment_id: int,
        current_user: CurrentUser
    ) -> MessageResponse:
        """Delete a comment"""
        success = await self.ticket_service.delete_comment(
            comment_id, current_user
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found or you don't have permission to delete it"
            )
        
        return MessageResponse(message="Comment deleted successfully")
    
    async def get_ticket_logs(
        self,
        ticket_id: int
    ) -> List[TicketLogResponse]:
        """Get logs for a ticket"""
        return await self.ticket_service.get_ticket_logs(ticket_id)
    
    async def get_my_tickets(
        self,
        current_user: CurrentUser,
        skip: int = 0,
        limit: int = 20
    ) -> TicketListResponse:
        """Get tickets for current user"""
        return await self.ticket_service.get_user_tickets(
            current_user.id, skip, limit
        )
    
    async def get_recent_tickets(
        self,
        limit: int = 10
    ) -> List[TicketResponse]:
        """Get most recent tickets"""
        return await self.ticket_service.get_recent_tickets(limit)
