from fastapi import Header, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.routers.admin import mock_integration_store
from app.database import get_db
from app import security, models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != mock_integration_store["api_key"]:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return x_api_key

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = security.decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
        
    return user
