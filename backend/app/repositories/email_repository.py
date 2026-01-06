# ============================================
# EMAIL REPOSITORY - Database Operations for Emails
# ============================================

from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime

from app.repositories.base_repository import BaseRepository
from app.models import EmailSource


class EmailRepository(BaseRepository[EmailSource]):
    """Repository for EmailSource model operations"""
    
    def __init__(self, db: AsyncSession):
        super().__init__(EmailSource, db)
    
    async def get_by_message_id(self, message_id: str) -> Optional[EmailSource]:
        """Get email by message ID"""
        result = await self.db.execute(
            select(EmailSource).where(EmailSource.message_id == message_id)
        )
        return result.scalar_one_or_none()
    
    async def message_exists(self, message_id: str) -> bool:
        """Check if an email with this message ID already exists"""
        result = await self.db.execute(
            select(func.count()).select_from(EmailSource)
            .where(EmailSource.message_id == message_id)
        )
        return result.scalar_one() > 0
    
    async def get_unprocessed(self, limit: int = 50) -> List[EmailSource]:
        """Get unprocessed emails"""
        result = await self.db.execute(
            select(EmailSource)
            .where(EmailSource.processed_at.is_(None))
            .order_by(EmailSource.received_at)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_processed(
        self,
        skip: int = 0,
        limit: int = 50,
        sap_only: bool = False
    ) -> List[EmailSource]:
        """Get processed emails"""
        query = select(EmailSource).where(EmailSource.processed_at.isnot(None))
        
        if sap_only:
            query = query.where(EmailSource.is_sap_related == True)
        
        query = query.order_by(desc(EmailSource.processed_at)).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def mark_processed(
        self,
        email_id: int,
        is_sap_related: bool,
        detected_category: Optional[str] = None,
        llm_analysis: Optional[dict] = None,
        ticket_created_id: Optional[int] = None,
        error_message: Optional[str] = None
    ) -> Optional[EmailSource]:
        """Mark an email as processed"""
        return await self.update(email_id, {
            "processed_at": datetime.utcnow(),
            "is_sap_related": is_sap_related,
            "detected_category": detected_category,
            "llm_analysis": llm_analysis,
            "ticket_created_id": ticket_created_id,
            "error_message": error_message
        })
    
    async def get_stats(self) -> dict:
        """Get email processing statistics"""
        total_result = await self.db.execute(
            select(func.count()).select_from(EmailSource)
        )
        total = total_result.scalar_one()
        
        processed_result = await self.db.execute(
            select(func.count()).select_from(EmailSource)
            .where(EmailSource.processed_at.isnot(None))
        )
        processed = processed_result.scalar_one()
        
        sap_related_result = await self.db.execute(
            select(func.count()).select_from(EmailSource)
            .where(EmailSource.is_sap_related == True)
        )
        sap_related = sap_related_result.scalar_one()
        
        tickets_created_result = await self.db.execute(
            select(func.count()).select_from(EmailSource)
            .where(EmailSource.ticket_created_id.isnot(None))
        )
        tickets_created = tickets_created_result.scalar_one()
        
        return {
            "total_emails": total,
            "processed": processed,
            "pending": total - processed,
            "sap_related": sap_related,
            "tickets_created": tickets_created
        }
    
    async def get_recent(self, limit: int = 10) -> List[EmailSource]:
        """Get most recent emails"""
        result = await self.db.execute(
            select(EmailSource)
            .order_by(desc(EmailSource.received_at))
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def get_by_category(
        self,
        category: str,
        skip: int = 0,
        limit: int = 50
    ) -> List[EmailSource]:
        """Get emails by detected category"""
        result = await self.db.execute(
            select(EmailSource)
            .where(EmailSource.detected_category == category)
            .order_by(desc(EmailSource.received_at))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
