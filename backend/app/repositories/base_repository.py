# ============================================
# BASE REPOSITORY - Abstract Database Operations
# ============================================

from typing import TypeVar, Generic, Type, Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from sqlalchemy.orm import selectinload

from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository with common CRUD operations"""
    
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db
    
    async def get_by_id(self, id: int) -> Optional[ModelType]:
        """Get a single record by ID"""
        result = await self.db.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()
    
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        order_by: Any = None
    ) -> List[ModelType]:
        """Get all records with pagination"""
        query = select(self.model)
        if order_by is not None:
            query = query.order_by(order_by)
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_count(self) -> int:
        """Get total count of records"""
        result = await self.db.execute(
            select(func.count()).select_from(self.model)
        )
        return result.scalar_one()
    
    async def create(self, obj_in: dict) -> ModelType:
        """Create a new record"""
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        await self.db.flush()
        await self.db.refresh(db_obj)
        return db_obj
    
    async def update(self, id: int, obj_in: dict) -> Optional[ModelType]:
        """Update a record by ID"""
        # Remove None values to avoid overwriting with nulls
        update_data = {k: v for k, v in obj_in.items() if v is not None}
        if not update_data:
            return await self.get_by_id(id)
        
        await self.db.execute(
            update(self.model).where(self.model.id == id).values(**update_data)
        )
        await self.db.flush()
        return await self.get_by_id(id)
    
    async def delete(self, id: int) -> bool:
        """Delete a record by ID"""
        result = await self.db.execute(
            delete(self.model).where(self.model.id == id)
        )
        await self.db.flush()
        return result.rowcount > 0
    
    async def exists(self, id: int) -> bool:
        """Check if a record exists"""
        result = await self.db.execute(
            select(func.count()).select_from(self.model).where(self.model.id == id)
        )
        return result.scalar_one() > 0
