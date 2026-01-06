# ============================================
# SCHEMAS - Pydantic Models for Request/Response
# ============================================

from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from enum import Enum


# ============================================
# Enum Schemas
# ============================================

class TicketStatusEnum(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    AWAITING_INFO = "Awaiting Info"
    RESOLVED = "Resolved"
    CLOSED = "Closed"


class TicketPriorityEnum(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class TicketCategoryEnum(str, Enum):
    MM = "MM"
    SD = "SD"
    FICO = "FICO"
    PP = "PP"
    HCM = "HCM"
    PM = "PM"
    QM = "QM"
    WM = "WM"
    PS = "PS"
    BW = "BW"
    ABAP = "ABAP"
    BASIS = "BASIS"
    OTHER = "OTHER"


class LogTypeEnum(str, Enum):
    STATUS_CHANGE = "status_change"
    ASSIGNMENT = "assignment"
    PRIORITY_CHANGE = "priority_change"
    CREATED = "created"
    COMMENT = "comment"
    ATTACHMENT = "attachment"
    EMAIL_RECEIVED = "email_received"
    AUTO_CLASSIFIED = "auto_classified"


# ============================================
# User Schemas
# ============================================

class UserBase(BaseModel):
    email: EmailStr
    name: str
    department: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    azure_id: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    id: int
    azure_id: str
    is_active: bool
    is_admin: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserBrief(BaseModel):
    """Brief user info for nested responses"""
    id: int
    name: str
    email: str
    avatar_url: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# Ticket Log Schemas
# ============================================

class TicketLogBase(BaseModel):
    log_type: LogTypeEnum
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    log_metadata: Optional[dict] = None


class TicketLogCreate(TicketLogBase):
    ticket_id: int
    user_id: int


class TicketLogResponse(TicketLogBase):
    id: int
    ticket_id: int
    user_id: int
    created_at: datetime
    user: Optional[UserBrief] = None
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# Ticket Comment Schemas
# ============================================

class TicketCommentBase(BaseModel):
    content: str
    is_internal: bool = False


class TicketCommentCreate(TicketCommentBase):
    ticket_id: int


class TicketCommentUpdate(BaseModel):
    content: str


class TicketCommentResponse(TicketCommentBase):
    id: int
    ticket_id: int
    author_id: int
    is_edited: bool
    edited_at: Optional[datetime] = None
    created_at: datetime
    author: Optional[UserBrief] = None
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# Attachment Schemas
# ============================================

class AttachmentBase(BaseModel):
    filename: str
    original_filename: str
    file_type: str
    file_size: int


class AttachmentCreate(AttachmentBase):
    ticket_id: int
    storage_path: str
    storage_url: Optional[str] = None
    uploaded_by: int


class AttachmentResponse(AttachmentBase):
    id: int
    ticket_id: int
    storage_url: Optional[str] = None
    uploaded_by: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# Ticket Schemas
# ============================================

class TicketBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=1)
    priority: TicketPriorityEnum = TicketPriorityEnum.MEDIUM
    category: TicketCategoryEnum = TicketCategoryEnum.OTHER


class TicketCreate(TicketBase):
    assigned_to: Optional[int] = None


class TicketUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    status: Optional[TicketStatusEnum] = None
    priority: Optional[TicketPriorityEnum] = None
    category: Optional[TicketCategoryEnum] = None
    assigned_to: Optional[int] = None


class TicketResponse(TicketBase):
    id: int
    ticket_id: str
    status: TicketStatusEnum
    created_by: int
    assigned_to: Optional[int] = None
    source_email_id: Optional[str] = None
    source_email_from: Optional[str] = None
    source_email_subject: Optional[str] = None
    llm_confidence: Optional[float] = None
    sla_due_date: Optional[datetime] = None
    resolution_time: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    created_by_user: Optional[UserBrief] = None
    assigned_to_user: Optional[UserBrief] = None
    
    model_config = ConfigDict(from_attributes=True)


class TicketDetailResponse(TicketResponse):
    """Full ticket details including logs and comments"""
    logs: List[TicketLogResponse] = []
    comments: List[TicketCommentResponse] = []
    attachments: List[AttachmentResponse] = []
    
    model_config = ConfigDict(from_attributes=True)


class TicketListResponse(BaseModel):
    """Paginated ticket list"""
    items: List[TicketResponse]
    total: int
    page: int
    size: int
    pages: int


# ============================================
# Email Source Schemas
# ============================================

class EmailSourceBase(BaseModel):
    message_id: str
    from_address: str
    to_address: str
    subject: str
    body_text: Optional[str] = None
    body_html: Optional[str] = None
    received_at: datetime


class EmailSourceCreate(EmailSourceBase):
    raw_headers: Optional[dict] = None


class EmailSourceResponse(EmailSourceBase):
    id: int
    processed_at: Optional[datetime] = None
    is_sap_related: Optional[bool] = None
    detected_category: Optional[str] = None
    ticket_created_id: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# Auth Schemas
# ============================================

class AzureAuthRequest(BaseModel):
    """Request from frontend with Azure AD token"""
    access_token: str


class CurrentUser(BaseModel):
    """Current authenticated user context from Azure AD token"""
    id: int
    azure_id: str
    email: str
    name: str
    is_admin: bool
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# Admin Schemas
# ============================================

class AdminUserResponse(BaseModel):
    id: int
    email: str
    name: str
    department: Optional[str] = None
    is_admin: bool
    added_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class AdminActionRequest(BaseModel):
    user_id: int


class AdminAuditLogResponse(BaseModel):
    id: int
    admin_id: int
    action: str
    target_user_id: Optional[int] = None
    details: Optional[dict] = None
    ip_address: Optional[str] = None
    created_at: datetime
    admin: Optional[UserBrief] = None
    target_user: Optional[UserBrief] = None
    
    model_config = ConfigDict(from_attributes=True)


# ============================================
# Analytics Schemas
# ============================================

class TicketStats(BaseModel):
    total: int
    open: int
    in_progress: int
    resolved: int
    closed: int
    awaiting_info: int


class CategoryStats(BaseModel):
    category: str
    count: int
    percentage: float


class PriorityStats(BaseModel):
    priority: str
    count: int
    percentage: float


class TrendDataPoint(BaseModel):
    date: str
    count: int


class AnalyticsResponse(BaseModel):
    ticket_stats: TicketStats
    category_breakdown: List[CategoryStats]
    priority_breakdown: List[PriorityStats]
    daily_trends: List[TrendDataPoint]
    avg_resolution_time: Optional[float] = None  # in hours
    sla_compliance_rate: Optional[float] = None


class DashboardStats(BaseModel):
    total_tickets: int
    open_tickets: int
    resolved_today: int
    avg_response_time: Optional[float] = None  # in hours
    tickets_by_status: dict
    tickets_by_priority: dict
    recent_tickets: List[TicketResponse]


# ============================================
# LLM Parsing Schemas
# ============================================

class EmailAnalysisResult(BaseModel):
    is_sap_related: bool
    confidence: float = Field(..., ge=0.0, le=1.0)
    detected_category: Optional[TicketCategoryEnum] = None
    suggested_title: Optional[str] = None
    suggested_priority: Optional[TicketPriorityEnum] = None
    key_points: List[str] = []
    raw_response: Optional[dict] = None


# ============================================
# Common Response Schemas
# ============================================

class MessageResponse(BaseModel):
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None


class HealthCheckResponse(BaseModel):
    status: str
    version: str
    database: str
    timestamp: datetime
