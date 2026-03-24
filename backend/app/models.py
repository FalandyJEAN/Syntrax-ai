from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import uuid
from datetime import datetime
import enum

Base = declarative_base()

class PlanType(str, enum.Enum):
    starter = "starter"
    growth = "growth"
    scale = "scale"

class SubStatus(str, enum.Enum):
    active = "active"
    past_due = "past_due"
    canceled = "canceled"

class DocStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    stripe_customer_id = Column(String, unique=True)

    documents = relationship("Document", back_populates="organization")

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="user") # user, admin
    credits = Column(Integer, default=50) # Default 50 free credits
    plan = Column(String, default="starter") # starter, pro, enterprise
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to docs (replaces Profile for now)
    # documents = relationship("Document", back_populates="user")

class Profile(Base):
    # Deprecated in favor of User, keeping for backwards compatibility check if needed
    __tablename__ = "profiles"
    
    id = Column(String, primary_key=True) # Linked to Auth
    full_name = Column(String)
    email = Column(String, unique=True, nullable=False)
    org_id = Column(String, ForeignKey("organizations.id"))
    role = Column(String, default="member")
    created_at = Column(DateTime, default=datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    uploaded_by = Column(String, ForeignKey("users.id"))
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    status = Column(String, default=DocStatus.pending)
    confidence_score = Column(Float)
    failure_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="documents")
    extractions = relationship("Extraction", back_populates="document", cascade="all, delete-orphan")

class Extraction(Base):
    __tablename__ = "extractions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"))
    data = Column(JSON, nullable=False)
    extraction_date = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="extractions")

class WebhookLog(Base):
    __tablename__ = "webhook_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"))
    event = Column(String, nullable=False)  # e.g., "document.processed"
    status = Column(String, default="pending")  # pending, success, failed
    response_code = Column(Integer, nullable=True)
    sent_at = Column(DateTime, default=datetime.utcnow)
    payload = Column(JSON, nullable=True)
