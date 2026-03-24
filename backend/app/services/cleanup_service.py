import os
import time
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import models
import threading

# Configuration
RETENTION_DAYS_DEFAULT = 7
RETENTION_DAYS_PRO = 14
CHECK_INTERVAL_SECONDS = 3600 * 24  # Run once every 24 hours

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def delete_expired_files(db: Session):
    """
    Deletes physical files for documents older than retention period.
    """
    now = datetime.utcnow()
    # For now, we use the default 7 days for everyone since we don't store Plan in DB yet.
    # Future improvement: Join with Organization table to get plan-specific retention.
    cutoff_date = now - timedelta(days=RETENTION_DAYS_DEFAULT)
    
    # Find candidates
    # We look for documents that satisfy:
    # 1. Created before cutoff
    # 2. file_url is NOT null (meaning file might exist)
    # 3. file_url does NOT contain "EXPIRED" (already processed)
    expired_docs = db.query(models.Document).filter(
        models.Document.created_at < cutoff_date,
        models.Document.file_url != None,
        ~models.Document.file_url.contains("EXPIRED")
    ).all()
    
    if not expired_docs:
        logger.info("Cleanup Service: No expired documents found.")
        return

    logger.info(f"Cleanup Service: Found {len(expired_docs)} expired documents (older than {RETENTION_DAYS_DEFAULT} days).")
    
    count = 0
    for doc in expired_docs:
        try:
            # doc.file_url is like "uploads/uuid.pdf"
            # We need absolute path relative to backend root
            relative_path = doc.file_url
            
            # Security check to ensure we don't delete outside uploads
            if ".." in relative_path or not relative_path.startswith("uploads/"):
                logger.warning(f"Skipping suspicious path: {relative_path}")
                continue

            # Check if file exists
            if os.path.exists(relative_path):
                os.remove(relative_path)
                logger.info(f"Deleted file: {relative_path}")
            else:
                logger.warning(f"File not found on disk (already deleted?): {relative_path}")
            
            # Update DB to reflect expiration
            doc.file_url = "EXPIRED (Retention Policy)"
            doc.failure_reason = "File deleted automatically after retention period." 
            # We don't change status 'completed' because the DATA extraction is still valid!
            
            count += 1
        except Exception as e:
            logger.error(f"Error deleting doc {doc.id}: {str(e)}")
    
    db.commit()
    logger.info(f"Cleanup Service: Successfully cleaned up {count} documents.")

def cleanup_loop():
    """
    Infinite loop to run cleanup periodically.
    """
    logger.info("Cleanup Service: Started background thread.")
    while True:
        try:
            db = SessionLocal()
            delete_expired_files(db)
            db.close()
        except Exception as e:
            logger.error(f"Cleanup Service Critical Error: {str(e)}")
        
        # Sleep for interval
        time.sleep(CHECK_INTERVAL_SECONDS)

def start_cleanup_service():
    """
    Starts the background thread. Called from main.py
    """
    thread = threading.Thread(target=cleanup_loop, daemon=True)
    thread.start()
