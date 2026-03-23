from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from services import auth_service
import db_models
import models

router = APIRouter()

@router.post("/register", response_model=models.User)
def register_user(user: models.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(db_models.DBUser).filter(db_models.DBUser.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = auth_service.get_password_hash(user.password)
    new_user = db_models.DBUser(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=models.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(db_models.DBUser).filter(db_models.DBUser.username == form_data.username).first()
    if not user or not auth_service.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth_service.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=models.User)
def read_users_me(current_user: db_models.DBUser = Depends(auth_service.get_current_user)):
    return current_user
