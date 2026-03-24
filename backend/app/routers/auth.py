from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app import models
from app import security
import uuid

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# Pydantic Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    email: str
    full_name: str = None
    role: str
    credits: int

@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400, 
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = security.get_password_hash(user.password)
    
    # Auto-assign Admin Role for specific user
    role = "user"
    credits = 50
    if user.email == "falandyjean@gmail.com":
        role = "admin"
        credits = 1000 # Admin gets more credits for testing
    
    new_user = models.User(
        id=str(uuid.uuid4()),
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=role,
        credits=credits, 
        plan="starter"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate Token
    access_token_expires = security.timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": new_user.email, "user_id": new_user.id, "role": new_user.role},
        expires_delta=access_token_expires
    )

    # Send Welcome Email
    from app.services import email_service
    email_service.send_welcome_email(new_user.email, new_user.full_name or "Syntrax User")
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "role": new_user.role,
        "credits": new_user.credits
    }


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        # We return OK even if user not found to prevent email enumeration
        return {"message": "If email exists, reset instructions have been sent."}
    
    # Generate a reset token (using JWT for simplicity, valid 15 mins)
    reset_token = security.create_access_token(
        data={"sub": user.email, "type": "reset"},
        expires_delta=security.timedelta(minutes=15)
    )
    
    from app.services import email_service
    email_service.send_password_reset_email(user.email, reset_token)
    
    return {"message": "Reset instructions sent."}

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    # Decode Token
    payload = security.decode_access_token(request.token)
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    # Check if it's a reset token
    if payload.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Invalid token type")
        
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
        
    # Get User
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Update Password
    user.hashed_password = security.get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not security.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Identify Plan & Credits
    
    access_token_expires = security.timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": db_user.email, "user_id": db_user.id, "role": db_user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": db_user.id,
        "email": db_user.email,
        "full_name": db_user.full_name,
        "role": db_user.role,
        "credits": db_user.credits
    }
