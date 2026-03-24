from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

from app.database import get_db
from app import models

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

# --- Response Models ---

class KpiStats(BaseModel):
    total_organizations: int
    total_documents: int
    success_rate: float
    estimated_mrr: int
    avg_processing_time: float # Added metric

class OrganizationView(BaseModel):
    id: str
    name: str
    plan: str
    document_count: int
    status: str

class SystemLog(BaseModel):
    time: str
    level: str
    message: str
    color: Optional[str] = None

class AdminOverviewResponse(BaseModel):
    stats: KpiStats
    organizations: List[OrganizationView]
    recent_logs: List[SystemLog]

# --- Endpoints ---

@router.get("/dashboard", response_model=AdminOverviewResponse)
def get_admin_dashboard(db: Session = Depends(get_db)):
    """
    Aggregates all data for the admin dashboard in a single call.
    """
    
    # 1. KPI Stats
    total_orgs = db.query(models.Organization).count()
    total_docs = db.query(models.Document).count()
    
    # Success Rate (Completed / Total)
    completed_docs = db.query(models.Document).filter(models.Document.status == models.DocStatus.completed).count()
    success_rate = (completed_docs / total_docs * 100) if total_docs > 0 else 100.0
    
    # MRR Calculation (Mock logic based on plans if we had them, defaulting to static for now)
    # We can join with subscriptions table if we had real plans, but for now we'll mock based on org count
    estimated_mrr = total_orgs * 99 # Assuming avg revenue per org
    
    stats = KpiStats(
        total_organizations=total_orgs,
        total_documents=total_docs,
        success_rate=round(success_rate, 1),
        estimated_mrr=estimated_mrr,
        avg_processing_time=1.2 # Mocked avg time in seconds
    )
    
    # 2. Organizations List
    # We want to join Organizations with a count of their documents
    orgs_query = db.query(
        models.Organization,
        func.count(models.Document.id).label("doc_count")
    ).outerjoin(models.Document).group_by(models.Organization.id).all()
    
    org_views = []
    for org, doc_count in orgs_query:
        # Determine status based on recent activity or errors?
        # For now, simplistic active check.
        status = "active"
        
        # Mock Plan data since it's not strictly enforced in the seeding yet
        plan = "Growth" 
        
        org_views.append(OrganizationView(
            id=str(org.id),
            name=org.name,
            plan=plan,
            document_count=doc_count,
            status=status
        ))
        
    # 3. Recent System Logs (Mocked + Real Failures)
    recent_logs = []
    
    # Get recent failed documents as "ERROR" logs
    failed_docs = db.query(models.Document).filter(
        models.Document.status == models.DocStatus.failed
    ).order_by(models.Document.created_at.desc()).limit(5).all()
    
    for doc in failed_docs:
        recent_logs.append(SystemLog(
            time=doc.created_at.strftime("%H:%M:%S"),
            level="ERROR",
            message=f"Doc processing failed: {doc.file_name} - {doc.failure_reason or 'Unknown'}",
            color="text-red-400"
        ))
        
    # Get recent successful completions
    success_docs = db.query(models.Document).filter(
        models.Document.status == models.DocStatus.completed
    ).order_by(models.Document.created_at.desc()).limit(5).all()
    
    for doc in success_docs:
        recent_logs.append(SystemLog(
            time=doc.created_at.strftime("%H:%M:%S"),
            level="INFO",
            message=f"Document processed successfully: {doc.file_name}",
            color="text-emerald-400"
        ))
        
    # Sort logs by time (descending)
    recent_logs.sort(key=lambda x: x.time, reverse=True)
    
    return AdminOverviewResponse(
        stats=stats,
        organizations=org_views,
        recent_logs=recent_logs[:10] # Top 10
    )


# --- Integrations (Persistent) ---

class WebhookConfig(BaseModel):
    url: str
    active: bool

# Persistent File Storage
import json
import os

INTEGRATION_CONFIG_FILE = "integration_config.json"

def load_integration_store():
    """Load integration config from file, or return defaults."""
    if os.path.exists(INTEGRATION_CONFIG_FILE):
        try:
            with open(INTEGRATION_CONFIG_FILE, "r") as f:
                return json.load(f)
        except:
            pass
    return {
        "webhook": "",
        "api_key": "sk_live_51M..."
    }

def save_integration_store(store):
    """Save integration config to file."""
    with open(INTEGRATION_CONFIG_FILE, "w") as f:
        json.dump(store, f, indent=2)

# Load on startup
mock_integration_store = load_integration_store()

@router.get("/integrations/webhook", response_model=WebhookConfig)
def get_webhook_config():
    return WebhookConfig(
        url=mock_integration_store["webhook"],
        active=True
    )

@router.post("/integrations/webhook")
def update_webhook_config(config: WebhookConfig):
    mock_integration_store["webhook"] = config.url
    save_integration_store(mock_integration_store)
    return {"status": "success", "message": "Webhook updated"}

@router.get("/integrations/apikey")
def get_api_key():
    return {"key": mock_integration_store["api_key"]}

@router.post("/integrations/apikey/regenerate")
def regenerate_api_key():
    import uuid
    new_key = f"sk_live_{str(uuid.uuid4()).replace('-', '')[:24]}"
    mock_integration_store["api_key"] = new_key
    save_integration_store(mock_integration_store)
    return {"key": new_key}
