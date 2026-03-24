from sqlalchemy.orm import Session
from app import models
import uuid

class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, file_name: str, file_url: str, file_uuid: str, org_id: str, user_id: str = None) -> models.Document:
        # Check if exists (idempotency)
        existing = self.get_by_id(file_uuid)
        if existing:
            return existing

        new_doc = models.Document(
            id=file_uuid,
            org_id=org_id,
            file_name=file_name,
            file_url=file_url,
            status=models.DocStatus.pending,
            uploaded_by=user_id
        )
        self.db.add(new_doc)
        self.db.commit()
        self.db.refresh(new_doc)
        return new_doc

    def get_by_id(self, doc_id: str) -> models.Document:
        return self.db.query(models.Document).filter(models.Document.id == doc_id).first()

    def get_all(self):
        return self.db.query(models.Document).order_by(models.Document.created_at.desc()).all()

    def get_all_by_user(self, user_id: str):
        return self.db.query(models.Document).filter(
            models.Document.uploaded_by == user_id
        ).order_by(models.Document.created_at.desc()).all()

    def update_status(self, doc_id: str, status: models.DocStatus, failure_reason: str = None, confidence_score: float = None):
        doc = self.get_by_id(doc_id)
        if doc:
            doc.status = status
            if failure_reason:
                doc.failure_reason = failure_reason
            if confidence_score is not None:
                doc.confidence_score = confidence_score
            self.db.commit()
            self.db.refresh(doc)
        return doc
