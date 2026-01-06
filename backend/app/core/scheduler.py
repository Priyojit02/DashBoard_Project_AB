# ============================================
# SCHEDULER - Background Task Scheduling
# ============================================

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.services import EmailProcessor


# Global scheduler instance
scheduler = AsyncIOScheduler()


async def process_daily_emails():
    """
    Scheduled task to fetch and process daily emails.
    Runs every day at configured time.
    """
    print(f"[Scheduler] Starting daily email processing at {datetime.utcnow()}")
    
    async with AsyncSessionLocal() as db:
        try:
            # Use mock services based on settings
            use_mock = settings.debug
            processor = EmailProcessor(db, use_mock=use_mock)
            
            result = await processor.process_daily_emails(
                days_back=1,
                max_emails=100,
                auto_create_tickets=True
            )
            
            await db.commit()
            
            print(f"[Scheduler] Email processing completed: {result}")
            
        except Exception as e:
            await db.rollback()
            print(f"[Scheduler] Email processing error: {e}")


async def health_check():
    """
    Periodic health check task.
    """
    print(f"[Scheduler] Health check at {datetime.utcnow()}")


def start_scheduler():
    """
    Initialize and start the background scheduler.
    """
    if not settings.scheduler_enabled:
        print("[Scheduler] Scheduler is disabled")
        return
    
    # Add daily email processing job
    # Default: Run at 8:00 AM UTC every day
    scheduler.add_job(
        process_daily_emails,
        trigger=CronTrigger(
            hour=settings.scheduler_email_hour,
            minute=settings.scheduler_email_minute
        ),
        id="daily_email_processing",
        name="Daily Email Processing",
        replace_existing=True
    )
    
    # Add health check job (every 5 minutes)
    scheduler.add_job(
        health_check,
        trigger=IntervalTrigger(minutes=5),
        id="health_check",
        name="Health Check",
        replace_existing=True
    )
    
    # Start the scheduler
    scheduler.start()
    print(f"[Scheduler] Started with email processing at {settings.scheduler_email_hour}:{settings.scheduler_email_minute:02d} UTC")


def stop_scheduler():
    """
    Stop the background scheduler.
    """
    if scheduler.running:
        scheduler.shutdown()
        print("[Scheduler] Stopped")


def get_scheduler_status():
    """
    Get current scheduler status and jobs.
    """
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run": str(job.next_run_time) if job.next_run_time else None
        })
    
    return {
        "running": scheduler.running,
        "jobs": jobs
    }


async def trigger_email_processing_now():
    """
    Manually trigger email processing outside of schedule.
    """
    await process_daily_emails()
