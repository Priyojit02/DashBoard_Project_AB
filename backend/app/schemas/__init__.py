# Schemas Package
from app.schemas.schemas import (
    # Enums
    TicketStatusEnum,
    TicketPriorityEnum,
    TicketCategoryEnum,
    LogTypeEnum,
    
    # User
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    UserBrief,
    
    # Ticket
    TicketBase,
    TicketCreate,
    TicketUpdate,
    TicketResponse,
    TicketDetailResponse,
    TicketListResponse,
    
    # Ticket Log
    TicketLogBase,
    TicketLogCreate,
    TicketLogResponse,
    
    # Ticket Comment
    TicketCommentBase,
    TicketCommentCreate,
    TicketCommentUpdate,
    TicketCommentResponse,
    
    # Attachment
    AttachmentBase,
    AttachmentCreate,
    AttachmentResponse,
    
    # Email
    EmailSourceBase,
    EmailSourceCreate,
    EmailSourceResponse,
    
    # Auth (No JWT - uses Azure SSO directly)
    AzureAuthRequest,
    CurrentUser,
    
    # Admin
    AdminUserResponse,
    AdminActionRequest,
    AdminAuditLogResponse,
    
    # Analytics
    TicketStats,
    CategoryStats,
    PriorityStats,
    TrendDataPoint,
    AnalyticsResponse,
    DashboardStats,
    
    # LLM
    EmailAnalysisResult,
    
    # Common
    MessageResponse,
    ErrorResponse,
    HealthCheckResponse,
)

__all__ = [
    "TicketStatusEnum",
    "TicketPriorityEnum",
    "TicketCategoryEnum",
    "LogTypeEnum",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserBrief",
    "TicketBase",
    "TicketCreate",
    "TicketUpdate",
    "TicketResponse",
    "TicketDetailResponse",
    "TicketListResponse",
    "TicketLogBase",
    "TicketLogCreate",
    "TicketLogResponse",
    "TicketCommentBase",
    "TicketCommentCreate",
    "TicketCommentUpdate",
    "TicketCommentResponse",
    "AttachmentBase",
    "AttachmentCreate",
    "AttachmentResponse",
    "EmailSourceBase",
    "EmailSourceCreate",
    "EmailSourceResponse",
    "AzureAuthRequest",
    "CurrentUser",
    "AdminUserResponse",
    "AdminActionRequest",
    "AdminAuditLogResponse",
    "TicketStats",
    "CategoryStats",
    "PriorityStats",
    "TrendDataPoint",
    "AnalyticsResponse",
    "DashboardStats",
    "EmailAnalysisResult",
    "MessageResponse",
    "ErrorResponse",
    "HealthCheckResponse",
]
