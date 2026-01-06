# ============================================
# TICKET SERVICE - Ticket Management Operations
# ============================================

from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.repositories import (
    TicketRepository,
    TicketLogRepository,
    TicketCommentRepository,
    AttachmentRepository,
    UserRepository
)
from app.models import (
    Ticket,
    TicketLog,
    TicketComment,
    TicketStatus,
    TicketPriority,
    TicketCategory,
    LogType
)
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
    CurrentUser
)


class TicketService:
    """Service for ticket management operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ticket_repo = TicketRepository(db)
        self.log_repo = TicketLogRepository(db)
        self.comment_repo = TicketCommentRepository(db)
        self.attachment_repo = AttachmentRepository(db)
        self.user_repo = UserRepository(db)
    
    async def create_ticket(
        self,
        ticket_data: TicketCreate,
        current_user: CurrentUser
    ) -> TicketResponse:
        """Create a new ticket"""
        # Generate ticket ID
        ticket_id = await self.ticket_repo.get_next_ticket_id()
        
        # Create ticket
        ticket = await self.ticket_repo.create({
            "ticket_id": ticket_id,
            "title": ticket_data.title,
            "description": ticket_data.description,
            "status": TicketStatus.OPEN,
            "priority": ticket_data.priority,
            "category": ticket_data.category,
            "created_by": current_user.id,
            "assigned_to": ticket_data.assigned_to
        })
        
        # Create log entry
        await self._create_log(
            ticket_id=ticket.id,
            user_id=current_user.id,
            log_type=LogType.CREATED,
            action=f"Ticket {ticket_id} created"
        )
        
        # Reload with relationships
        ticket = await self.ticket_repo.get_with_details(ticket.id)
        return TicketResponse.model_validate(ticket)
    
    async def get_ticket(self, ticket_id: int) -> Optional[TicketDetailResponse]:
        """Get ticket with all details"""
        ticket = await self.ticket_repo.get_with_details(ticket_id)
        if not ticket:
            return None
        return TicketDetailResponse.model_validate(ticket)
    
    async def get_ticket_by_ticket_id(self, ticket_id: str) -> Optional[TicketDetailResponse]:
        """Get ticket by ticket_id (T-001 format)"""
        ticket = await self.ticket_repo.get_by_ticket_id(ticket_id)
        if not ticket:
            return None
        ticket = await self.ticket_repo.get_with_details(ticket.id)
        return TicketDetailResponse.model_validate(ticket)
    
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
        """Get paginated list of tickets"""
        # Convert string filters to enums
        status_enum = TicketStatus(status) if status else None
        priority_enum = TicketPriority(priority) if priority else None
        category_enum = TicketCategory(category) if category else None
        
        tickets, total = await self.ticket_repo.get_paginated(
            skip=skip,
            limit=limit,
            status=status_enum,
            priority=priority_enum,
            category=category_enum,
            assigned_to=assigned_to,
            created_by=created_by,
            search=search,
            order_by=order_by,
            order_desc=order_desc
        )
        
        pages = (total + limit - 1) // limit
        
        return TicketListResponse(
            items=[TicketResponse.model_validate(t) for t in tickets],
            total=total,
            page=(skip // limit) + 1,
            size=limit,
            pages=pages
        )
    
    async def update_ticket(
        self,
        ticket_id: int,
        update_data: TicketUpdate,
        current_user: CurrentUser
    ) -> Optional[TicketResponse]:
        """Update a ticket"""
        ticket = await self.ticket_repo.get_by_id(ticket_id)
        if not ticket:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        
        # Track changes for logging
        for field, new_value in update_dict.items():
            old_value = getattr(ticket, field)
            
            if field == "status" and old_value != new_value:
                await self._create_log(
                    ticket_id=ticket_id,
                    user_id=current_user.id,
                    log_type=LogType.STATUS_CHANGE,
                    action=f"Status changed from {old_value.value if old_value else 'None'} to {new_value.value if hasattr(new_value, 'value') else new_value}",
                    old_value=old_value.value if old_value else None,
                    new_value=new_value.value if hasattr(new_value, 'value') else str(new_value)
                )
                
                # Set resolved_at if status is Resolved
                if new_value == TicketStatus.RESOLVED:
                    update_dict["resolved_at"] = datetime.utcnow()
                    # Calculate resolution time
                    if ticket.created_at:
                        resolution_minutes = int((datetime.utcnow() - ticket.created_at).total_seconds() / 60)
                        update_dict["resolution_time"] = resolution_minutes
            
            elif field == "priority" and old_value != new_value:
                await self._create_log(
                    ticket_id=ticket_id,
                    user_id=current_user.id,
                    log_type=LogType.PRIORITY_CHANGE,
                    action=f"Priority changed from {old_value.value if old_value else 'None'} to {new_value.value if hasattr(new_value, 'value') else new_value}",
                    old_value=old_value.value if old_value else None,
                    new_value=new_value.value if hasattr(new_value, 'value') else str(new_value)
                )
            
            elif field == "assigned_to" and old_value != new_value:
                old_user = await self.user_repo.get_by_id(old_value) if old_value else None
                new_user = await self.user_repo.get_by_id(new_value) if new_value else None
                await self._create_log(
                    ticket_id=ticket_id,
                    user_id=current_user.id,
                    log_type=LogType.ASSIGNMENT,
                    action=f"Assigned to {new_user.name if new_user else 'Unassigned'}",
                    old_value=old_user.name if old_user else None,
                    new_value=new_user.name if new_user else None
                )
        
        # Update the ticket
        updated_ticket = await self.ticket_repo.update(ticket_id, update_dict)
        if not updated_ticket:
            return None
        
        # Reload with relationships
        updated_ticket = await self.ticket_repo.get_with_details(ticket_id)
        return TicketResponse.model_validate(updated_ticket)
    
    async def delete_ticket(self, ticket_id: int) -> bool:
        """Delete a ticket"""
        return await self.ticket_repo.delete(ticket_id)
    
    async def add_comment(
        self,
        ticket_id: int,
        comment_data: TicketCommentCreate,
        current_user: CurrentUser
    ) -> Optional[TicketCommentResponse]:
        """Add a comment to a ticket"""
        ticket = await self.ticket_repo.get_by_id(ticket_id)
        if not ticket:
            return None
        
        comment = await self.comment_repo.create({
            "ticket_id": ticket_id,
            "author_id": current_user.id,
            "content": comment_data.content,
            "is_internal": comment_data.is_internal
        })
        
        # Create log entry
        await self._create_log(
            ticket_id=ticket_id,
            user_id=current_user.id,
            log_type=LogType.COMMENT,
            action=f"Comment added by {current_user.name}"
        )
        
        return TicketCommentResponse.model_validate(comment)
    
    async def update_comment(
        self,
        comment_id: int,
        update_data: TicketCommentUpdate,
        current_user: CurrentUser
    ) -> Optional[TicketCommentResponse]:
        """Update a comment"""
        comment = await self.comment_repo.get_by_id(comment_id)
        if not comment or comment.author_id != current_user.id:
            return None
        
        updated_comment = await self.comment_repo.update(comment_id, {
            "content": update_data.content,
            "is_edited": True,
            "edited_at": datetime.utcnow()
        })
        
        return TicketCommentResponse.model_validate(updated_comment)
    
    async def delete_comment(
        self,
        comment_id: int,
        current_user: CurrentUser
    ) -> bool:
        """Delete a comment"""
        comment = await self.comment_repo.get_by_id(comment_id)
        if not comment:
            return False
        
        # Only author or admin can delete
        if comment.author_id != current_user.id and not current_user.is_admin:
            return False
        
        return await self.comment_repo.delete(comment_id)
    
    async def get_ticket_logs(self, ticket_id: int) -> List[TicketLogResponse]:
        """Get all logs for a ticket"""
        logs = await self.log_repo.get_ticket_logs(ticket_id)
        return [TicketLogResponse.model_validate(log) for log in logs]
    
    async def get_user_tickets(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 20
    ) -> TicketListResponse:
        """Get tickets for a specific user"""
        tickets, total = await self.ticket_repo.get_user_tickets(
            user_id=user_id,
            skip=skip,
            limit=limit
        )
        
        pages = (total + limit - 1) // limit
        
        return TicketListResponse(
            items=[TicketResponse.model_validate(t) for t in tickets],
            total=total,
            page=(skip // limit) + 1,
            size=limit,
            pages=pages
        )
    
    async def get_recent_tickets(self, limit: int = 10) -> List[TicketResponse]:
        """Get most recent tickets"""
        tickets = await self.ticket_repo.get_recent_tickets(limit)
        return [TicketResponse.model_validate(t) for t in tickets]
    
    async def _create_log(
        self,
        ticket_id: int,
        user_id: int,
        log_type: LogType,
        action: str,
        old_value: Optional[str] = None,
        new_value: Optional[str] = None,
        log_metadata: Optional[dict] = None
    ) -> TicketLog:
        """Create a ticket log entry"""
        return await self.log_repo.create({
            "ticket_id": ticket_id,
            "user_id": user_id,
            "log_type": log_type,
            "action": action,
            "old_value": old_value,
            "new_value": new_value,
            "log_metadata": log_metadata
        })
    
    async def create_ticket_from_email(
        self,
        title: str,
        description: str,
        category: TicketCategory,
        priority: TicketPriority,
        source_email_id: str,
        source_email_from: str,
        source_email_subject: str,
        created_by: int,
        llm_confidence: Optional[float] = None,
        llm_raw_response: Optional[dict] = None
    ) -> Ticket:
        """Create a ticket from parsed email"""
        ticket_id = await self.ticket_repo.get_next_ticket_id()
        
        ticket = await self.ticket_repo.create({
            "ticket_id": ticket_id,
            "title": title,
            "description": description,
            "status": TicketStatus.OPEN,
            "priority": priority,
            "category": category,
            "created_by": created_by,
            "source_email_id": source_email_id,
            "source_email_from": source_email_from,
            "source_email_subject": source_email_subject,
            "llm_confidence": llm_confidence,
            "llm_raw_response": llm_raw_response
        })
        
        # Create log entry
        await self._create_log(
            ticket_id=ticket.id,
            user_id=created_by,
            log_type=LogType.EMAIL_RECEIVED,
            action=f"Ticket auto-created from email: {source_email_subject}",
            log_metadata={"source_email": source_email_from, "llm_confidence": llm_confidence}
        )
        
        return ticket
