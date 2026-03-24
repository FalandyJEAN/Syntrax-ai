from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app import models
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/webhooks",
    tags=["webhooks"]
)

class WebhookLogResponse(BaseModel):
    id: str
    document_id: str
    event: str
    status: str
    response_code: int | None
    sent_at: datetime
    
    class Config:
        from_attributes = True

@router.get("/history", response_model=List[WebhookLogResponse])
def get_webhook_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get webhook delivery history for the current user's documents.
    """
    # Get all webhook logs for documents uploaded by this user
    logs = db.query(models.WebhookLog).join(
        models.Document,
        models.WebhookLog.document_id == models.Document.id
    ).filter(
        models.Document.uploaded_by == current_user.id
    ).order_by(
        models.WebhookLog.sent_at.desc()
    ).limit(100).all()
    
    return logs
