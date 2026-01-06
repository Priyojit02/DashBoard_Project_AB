# ============================================
# EMAIL ROUTES - Email Processing Endpoints
# ============================================
# Uses Microsoft Graph API with SSO token - no IMAP/password needed

from fastapi import APIRouter, Depends, Query, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.controllers import EmailController
from app.middleware import get_current_user, get_admin_user, get_token
from app.schemas import CurrentUser

router = APIRouter(prefix="/emails", tags=["Email Processing"])


@router.post("/fetch")
async def trigger_email_fetch(
    days_back: int = Query(1, ge=1, le=30),
    max_emails: int = Query(100, ge=1, le=500),
    folder: str = Query("inbox", description="Email folder: inbox, sentitems, etc."),
    token: str = Depends(get_token),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch emails from Microsoft Graph API using your SSO token.
    This will:
    1. Fetch emails from the last N days using your Azure AD token
    2. Analyze them with LLM
    3. Create tickets for SAP-related emails
    """
    controller = EmailController(db)
    return await controller.trigger_email_fetch(
        access_token=token,
        current_user=current_user, 
        days_back=days_back, 
        max_emails=max_emails,
        folder=folder
    )


@router.get("/stats")
async def get_email_stats(
    current_user: CurrentUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get email processing statistics (admin only).
    """
    controller = EmailController(db)
    return await controller.get_email_stats(current_user)


@router.get("/recent")
async def get_recent_emails(
    limit: int = Query(10, ge=1, le=100),
    current_user: CurrentUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get most recent emails (admin only).
    """
    controller = EmailController(db)
    return await controller.get_recent_emails(current_user, limit)


@router.get("/unprocessed")
async def get_unprocessed_emails(
    limit: int = Query(50, ge=1, le=200),
    current_user: CurrentUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get unprocessed emails (admin only).
    """
    controller = EmailController(db)
    return await controller.get_unprocessed_emails(current_user, limit)


@router.post("/{email_id}/reprocess")
async def reprocess_email(
    email_id: int,
    current_user: CurrentUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Reprocess a specific email (admin only).
    """
    controller = EmailController(db)
    return await controller.reprocess_email(current_user, email_id)


@router.get("/by-category/{category}")
async def get_emails_by_category(
    category: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: CurrentUser = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get emails by detected SAP category (admin only).
    """
    controller = EmailController(db)
    return await controller.get_emails_by_category(current_user, category, skip, limit)
