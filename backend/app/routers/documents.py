from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks, Header
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
import shutil
import os
import uuid
from app.database import get_db, SessionLocal
from app import models
from app.services.openrouter_service import openrouter_service
from app.repositories.document import DocumentRepository
from app.dependencies import verify_api_key, get_current_user

import logging
import traceback
import requests
import json
from app.routers.admin import mock_integration_store

# Configure Logging
logging.basicConfig(
    filename='backend_debug.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

router = APIRouter(
    prefix="/documents",
    tags=["documents"]
)

class DocumentResponse(BaseModel):
    id: str
    file_name: str
    status: str
    file_url: str
    confidence_score: Optional[float] = 0.0
    failure_reason: Optional[str] = None
    created_at: Optional[datetime] = None  # Upload date
    
    class Config:
        from_attributes = True
        
    def model_dump(self, **kwargs):
        data = super().model_dump(**kwargs)
        if data.get('created_at'):
            data['created_at'] = data['created_at'].isoformat()
        return data

def process_document_core(doc_id: str, db: Session) -> Dict[str, Any]:
    """
    Core processing logic. 
    Updates DB status, runs AI extraction, saves result.
    Does NOT raise HTTPExceptions, returns dict or raises generic Exception.
    """
    logging.info(f"Core Processing document: {doc_id}")
    repo = DocumentRepository(db)
    doc = repo.get_by_id(doc_id)
    
    if not doc:
        raise Exception(f"Document {doc_id} not found")
    
    # Update status to processing
    repo.update_status(doc_id, models.DocStatus.processing)
    
    try:
        # Read file
        with open(doc.file_url, "rb") as f:
            file_content = f.read()
        
        # Call AI extraction
        result = openrouter_service.extract_from_file(
            file_content=file_content,
            filename=doc.file_name
        )
        
        # Check for errors
        if result.get("error_message"):
            error_msg = result["error_message"]
            repo.update_status(doc_id, models.DocStatus.failed, failure_reason=error_msg)
            return {"status": "failed", "error": error_msg}
        
        # Save extraction
        extraction = models.Extraction(
            id=str(uuid.uuid4()),
            document_id=doc_id,
            data=result
        )
        db.add(extraction)
        
        # Update document
        confidence = result.get("confidence_score", 0.0)
        repo.update_status(doc_id, models.DocStatus.completed, confidence_score=confidence)
        
        # Deduct credit if user exists
        if doc.uploaded_by:
            user = db.query(models.User).filter(models.User.id == doc.uploaded_by).first()
            if user and user.credits > 0:
                user.credits -= 1
        
        db.commit()
        
        return {"status": "completed", "data": result}
        
    except Exception as e:
        logging.error(f"Processing error for {doc_id}: {str(e)}")
        repo.update_status(doc_id, models.DocStatus.failed, failure_reason=str(e))
        return {"status": "failed", "error": str(e)}
    finally:
        # Webhook Dispatch with Logging
        try:
            webhook_url = mock_integration_store.get("webhook")
            if webhook_url:
                logging.info(f"Dispatching webhook to {webhook_url}")
                
                payload = {
                    "event": "document.processed",
                    "document_id": doc_id,
                    "status": "completed" if 'result' in locals() and not result.get("error_message") else "failed",
                    "data": result if 'result' in locals() else None,
                    "error": str(e) if 'e' in locals() else None
                }
                
                # Create webhook log entry
                webhook_log = models.WebhookLog(
                    document_id=doc_id,
                    event="document.processed",
                    status="pending",
                    payload=payload
                )
                db.add(webhook_log)
                db.commit()
                
                # Send webhook
                try:
                    response = requests.post(webhook_url, json=payload, timeout=5)
                    webhook_log.status = "success"
                    webhook_log.response_code = response.status_code
                except Exception as req_err:
                    webhook_log.status = "failed"
                    webhook_log.response_code = None
                    logging.error(f"Webhook request failed: {req_err}")
                
                db.commit()
        except Exception as wh_err:
             logging.error(f"Webhook failed: {wh_err}")

def process_document_background(doc_id: str):
    """Background task wrapper"""
    db = SessionLocal()
    try:
        process_document_core(doc_id, db)
    finally:
        db.close()

PLAN_LIMITS = {
    "starter": 50,
    "growth": 500,
    "scale": 2000,
    "enterprise": 10000
}

@router.get("/stats")
def get_document_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get aggregated statistics for the dashboard.
    """
    repo = DocumentRepository(db)
    docs = repo.get_all_by_user(current_user.id)
    
    total_docs = len(docs)
    completed_docs = len([d for d in docs if d.status == models.DocStatus.completed])
    
    # Calculate success rate
    success_rate = (completed_docs / total_docs * 100) if total_docs > 0 else 100.0
    
    # Calculate credits (User's actual credits)
    credits_remaining = current_user.credits
    
    # Determine Total Plan Limit
    # Default to 50 if plan unknown
    base_limit = PLAN_LIMITS.get(current_user.plan, 50) 
    total_credits = base_limit

    # Handle custom admin override or Top-Ups (if user has > plan limit)
    # We snap to the next logical tier to keep the progress bar meaningful
    # e.g. 999 credits -> Show / 1000
    if credits_remaining > base_limit:
        milestones = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000]
        # Find smallest milestone >= credits_remaining
        for m in milestones:
            if m >= credits_remaining:
                total_credits = m
                break
        else:
            # If bigger than all milestones, just use the exact amount
            total_credits = credits_remaining

    return {
        "processed_count": total_docs,
        "success_rate": round(success_rate, 1),
        "credits_remaining": credits_remaining,
        "total_credits": total_credits
    }

@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get all documents for current user.
    """
    repo = DocumentRepository(db)
    docs = repo.get_all_by_user(current_user.id)
    for d in docs:
        d.id = str(d.id)
    return docs

@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.id = str(doc.id)
    return doc

@router.get("/{doc_id}/extraction")
def get_extraction(doc_id: str, db: Session = Depends(get_db)):
    extraction = db.query(models.Extraction).filter(models.Extraction.document_id == doc_id).first()
    if not extraction:
        return {"data": None}
    return {"data": extraction.data}

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    # Allow either API Key (External) or Session Token (Internal Dashboard)
    api_key: Optional[str] = Header(None, alias="X-API-Key"),
    token: Optional[str] = Header(None, alias="Authorization")
):
    """
    Saves file to disk, creates DB record, and triggers background processing.
    """
    user_id = None
    
    # Validate Auth manually since we accept either
    if api_key:
        if api_key != "sk_live_51M...": # Mock check from dependencies
             from app.routers.admin import mock_integration_store
             if api_key != mock_integration_store["api_key"]:
                 raise HTTPException(status_code=401, detail="Invalid API Key")
    elif token:
        # Extract Bearer token
        if token.startswith("Bearer "):
            token = token.split(" ")[1]
        
        # Verify user
        from app.dependencies import get_current_user
        # We need to call the dependency logic manually or use it as a sub-dependency if structure allowed.
        # For simplicity, let's reuse the security module directly
        from app import security
        payload = security.decode_access_token(token)
        if not payload:
             raise HTTPException(status_code=401, detail="Invalid token")
        user_id = payload.get("user_id")
    else:
        raise HTTPException(status_code=401, detail="Missing Authentication")
        
    if user_id:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user and user.credits <= 0:
             raise HTTPException(status_code=402, detail="Insufficient credits")

    file_uuid = str(uuid.uuid4())
    extension = os.path.splitext(file.filename)[1]
    saved_filename = f"{file_uuid}{extension}"
    
    # Save file
    os.makedirs("uploads", exist_ok=True)
    file_path = os.path.join("uploads", saved_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    mock_org_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, "mock-org")
    mock_org_id = str(mock_org_uuid)
    
    # Store web-accessible path (forward slashes)
    web_path = f"uploads/{saved_filename}"
    
    repo = DocumentRepository(db)
    
    new_doc = repo.create(
        file_name=file.filename,
        file_url=web_path,
        file_uuid=file_uuid,
        org_id=mock_org_id,
        user_id=user_id
    )
    
    background_tasks.add_task(process_document_background, new_doc.id)
    
    return new_doc

@router.post("/upload-batch")
async def upload_batch(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    # Same hybrid auth approach
    api_key: Optional[str] = Header(None, alias="X-API-Key"),
    token: Optional[str] = Header(None, alias="Authorization")
):
    """
    Upload multiple documents for batch processing.
    Accepts up to 100 files at once.
    """
    user_id = None
    if api_key:
         from app.routers.admin import mock_integration_store
         if api_key != mock_integration_store["api_key"]:
             raise HTTPException(status_code=401, detail="Invalid API Key")
    elif token:
        if token.startswith("Bearer "):
            token = token.split(" ")[1]
        from app import security
        payload = security.decode_access_token(token)
        if not payload:
             raise HTTPException(status_code=401, detail="Invalid token")
        user_id = payload.get("user_id")
    else:
        raise HTTPException(status_code=401, detail="Missing Authentication")
    if user_id:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user and user.credits <= 0:
             raise HTTPException(status_code=402, detail="Insufficient credits")

    if len(files) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 files per batch")
    
    repo = DocumentRepository(db)
    uploaded_docs = []
    errors = []
    
    for file in files:
        try:
            file_uuid = str(uuid.uuid4())
            extension = os.path.splitext(file.filename)[1]
            saved_filename = f"{file_uuid}{extension}"
            
            # Save to disk
            os.makedirs("uploads", exist_ok=True)
            file_path = os.path.join("uploads", saved_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            mock_org_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, "mock-org")
            mock_org_id = str(mock_org_uuid)
            
            # Web accessible path
            web_path = f"uploads/{saved_filename}"
            
            new_doc = repo.create(
                file_name=file.filename,
                file_url=web_path,
                file_uuid=file_uuid,
                org_id=mock_org_id,
                user_id=user_id
            )
            
            background_tasks.add_task(process_document_background, new_doc.id)
            
            uploaded_docs.append({
                "id": str(new_doc.id),
                "filename": file.filename,
                "status": "queued"
            })
            
        except Exception as e:
            logging.error(f"Error uploading {file.filename}: {str(e)}")
            errors.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    return {
        "total": len(files),
        "uploaded": len(uploaded_docs),
        "failed": len(errors),
        "documents": uploaded_docs,
        "errors": errors
    }

@router.post("/{doc_id}/process")
async def process_document(doc_id: str, db: Session = Depends(get_db)):
    """
    Triggers the extraction for a specific document ID (Manual Retry).
    Runs synchronously to return result to user.
    """
    try:
        return process_document_core(doc_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
