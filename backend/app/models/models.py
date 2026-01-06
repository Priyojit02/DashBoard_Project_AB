# ============================================
# MODELS - SQLAlchemy Database Models
# ============================================

from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    String, Integer, Text, Boolean, DateTime, 
    ForeignKey, Enum as SQLEnum, JSON, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


# ============================================
# Enums
# ============================================

class TicketStatus(str, enum.Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    AWAITING_INFO = "Awaiting Info"
    RESOLVED = "Resolved"
    CLOSED = "Closed"


class TicketPriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class TicketCategory(str, enum.Enum):
    MM = "MM"  # Material Management
    SD = "SD"  # Sales & Distribution
    FICO = "FICO"  # Finance & Controlling
    PP = "PP"  # Production Planning
    HCM = "HCM"  # Human Capital Management
    PM = "PM"  # Plant Maintenance
    QM = "QM"  # Quality Management
    WM = "WM"  # Warehouse Management
    PS = "PS"  # Project System
    BW = "BW"  # Business Warehouse
    ABAP = "ABAP"  # ABAP Development
    BASIS = "BASIS"  # Basis/Admin
    OTHER = "OTHER"  # Other/Unknown


class LogType(str, enum.Enum):
    STATUS_CHANGE = "status_change"
    ASSIGNMENT = "assignment"
    PRIORITY_CHANGE = "priority_change"
    CREATED = "created"
    COMMENT = "comment"
    ATTACHMENT = "attachment"
    EMAIL_RECEIVED = "email_received"
    AUTO_CLASSIFIED = "auto_classified"


# ============================================
# User Model
# ============================================

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    azure_id: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    
    # Relationships
    created_tickets: Mapped[List["Ticket"]] = relationship(
        "Ticket", back_populates="created_by_user", foreign_keys="Ticket.created_by"
    )
    assigned_tickets: Mapped[List["Ticket"]] = relationship(
        "Ticket", back_populates="assigned_to_user", foreign_keys="Ticket.assigned_to"
    )
    logs: Mapped[List["TicketLog"]] = relationship("TicketLog", back_populates="user")
    comments: Mapped[List["TicketComment"]] = relationship("TicketComment", back_populates="author")
    
    __table_args__ = (
        Index("idx_user_email", "email"),
        Index("idx_user_azure_id", "azure_id"),
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"


# ============================================
# Ticket Model
# ============================================

class Ticket(Base):
    __tablename__ = "tickets"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ticket_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # T-001 format
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[TicketStatus] = mapped_column(
        SQLEnum(TicketStatus), default=TicketStatus.OPEN, nullable=False
    )
    priority: Mapped[TicketPriority] = mapped_column(
        SQLEnum(TicketPriority), default=TicketPriority.MEDIUM, nullable=False
    )
    category: Mapped[TicketCategory] = mapped_column(
        SQLEnum(TicketCategory), default=TicketCategory.OTHER, nullable=False
    )
    
    # Foreign Keys
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Email Source Info
    source_email_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    source_email_from: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    source_email_subject: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    # LLM Classification Metadata
    llm_confidence: Mapped[Optional[float]] = mapped_column(nullable=True)
    llm_raw_response: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # SLA Fields
    sla_due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    resolution_time: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # in minutes
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    created_by_user: Mapped["User"] = relationship(
        "User", back_populates="created_tickets", foreign_keys=[created_by]
    )
    assigned_to_user: Mapped[Optional["User"]] = relationship(
        "User", back_populates="assigned_tickets", foreign_keys=[assigned_to]
    )
    logs: Mapped[List["TicketLog"]] = relationship(
        "TicketLog", back_populates="ticket", cascade="all, delete-orphan"
    )
    comments: Mapped[List["TicketComment"]] = relationship(
        "TicketComment", back_populates="ticket", cascade="all, delete-orphan"
    )
    attachments: Mapped[List["Attachment"]] = relationship(
        "Attachment", back_populates="ticket", cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        Index("idx_ticket_status", "status"),
        Index("idx_ticket_priority", "priority"),
        Index("idx_ticket_category", "category"),
        Index("idx_ticket_created_at", "created_at"),
        Index("idx_ticket_assigned_to", "assigned_to"),
    )
    
    def __repr__(self):
        return f"<Ticket(id={self.id}, ticket_id={self.ticket_id}, status={self.status})>"


# ============================================
# Ticket Log Model
# ============================================

class TicketLog(Base):
    __tablename__ = "ticket_logs"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ticket_id: Mapped[int] = mapped_column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    log_type: Mapped[LogType] = mapped_column(SQLEnum(LogType), nullable=False)
    action: Mapped[str] = mapped_column(String(500), nullable=False)
    old_value: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    new_value: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    log_metadata: Mapped[Optional[dict]] = mapped_column("metadata", JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="logs")
    user: Mapped["User"] = relationship("User", back_populates="logs")
    
    __table_args__ = (
        Index("idx_log_ticket_id", "ticket_id"),
        Index("idx_log_created_at", "created_at"),
    )
    
    def __repr__(self):
        return f"<TicketLog(id={self.id}, action={self.action})>"


# ============================================
# Ticket Comment Model
# ============================================

class TicketComment(Base):
    __tablename__ = "ticket_comments"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ticket_id: Mapped[int] = mapped_column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    author_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_internal: Mapped[bool] = mapped_column(Boolean, default=False)  # Internal notes vs public comments
    is_edited: Mapped[bool] = mapped_column(Boolean, default=False)
    edited_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="comments")
    author: Mapped["User"] = relationship("User", back_populates="comments")
    
    __table_args__ = (
        Index("idx_comment_ticket_id", "ticket_id"),
        Index("idx_comment_created_at", "created_at"),
    )
    
    def __repr__(self):
        return f"<TicketComment(id={self.id}, author_id={self.author_id})>"


# ============================================
# Attachment Model
# ============================================

class Attachment(Base):
    __tablename__ = "attachments"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    ticket_id: Mapped[int] = mapped_column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)  # in bytes
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    storage_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    uploaded_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    ticket: Mapped["Ticket"] = relationship("Ticket", back_populates="attachments")
    uploader: Mapped["User"] = relationship("User")
    
    __table_args__ = (
        Index("idx_attachment_ticket_id", "ticket_id"),
    )
    
    def __repr__(self):
        return f"<Attachment(id={self.id}, filename={self.filename})>"


# ============================================
# Email Source Model (for tracking processed emails)
# ============================================

class EmailSource(Base):
    __tablename__ = "email_sources"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    message_id: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    from_address: Mapped[str] = mapped_column(String(255), nullable=False)
    to_address: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(500), nullable=False)
    body_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    body_html: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_sap_related: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    detected_category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    llm_analysis: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ticket_created_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("tickets.id"), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    raw_headers: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    __table_args__ = (
        Index("idx_email_message_id", "message_id"),
        Index("idx_email_received_at", "received_at"),
        Index("idx_email_processed_at", "processed_at"),
    )
    
    def __repr__(self):
        return f"<EmailSource(id={self.id}, subject={self.subject[:50]})>"


# ============================================
# Admin Audit Log Model
# ============================================

class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    admin_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    target_user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    details: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    admin: Mapped["User"] = relationship("User", foreign_keys=[admin_id])
    target_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[target_user_id])
    
    __table_args__ = (
        Index("idx_audit_admin_id", "admin_id"),
        Index("idx_audit_created_at", "created_at"),
    )
    
    def __repr__(self):
        return f"<AdminAuditLog(id={self.id}, action={self.action})>"


# ============================================
# System Settings Model
# ============================================

class SystemSetting(Base):
    __tablename__ = "system_settings"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    key: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    value_type: Mapped[str] = mapped_column(String(50), default="string")  # string, int, bool, json
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    updated_by: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    
    def __repr__(self):
        return f"<SystemSetting(key={self.key}, value={self.value[:50]})>"
