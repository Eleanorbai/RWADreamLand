from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from sqlmodel import Session
import os
from . import crud, models
from .database import get_db
from .config import settings
from .utils import get_password_hash, verify_password

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

router = APIRouter()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def authenticate_user(db: Session, username: str, password: str):
    user = crud.get_user_by_username(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, username)
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="用户账户已被禁用")
    return current_user

def require_role(required_roles: list[models.UserRole]):
    def role_checker(current_user: models.User = Depends(get_current_active_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="权限不足"
            )
        return current_user
    return role_checker

# 认证路由
@router.post("/register", response_model=models.UserPublic)
def register(user: models.UserCreate, db: Session = Depends(get_db)):
    # 检查用户名是否已存在
    db_user = crud.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 检查邮箱是否已存在
    if user.email:
        db_user = crud.get_user_by_email(db, user.email)
        if db_user:
            raise HTTPException(status_code=400, detail="邮箱已存在")
    
    # 创建用户
    return crud.create_user(db=db, user=user)

@router.post("/login", response_model=models.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=models.UserPublic)
def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    print("访问了 /users/me")
    return current_user

@router.put("/me", response_model=models.UserPublic)
def update_user_profile(
    user_update: models.UserUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 检查邮箱是否已存在
    if user_update.email:
        existing_user = crud.get_user_by_email(db, user_update.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(status_code=400, detail="邮箱已存在")
    
    updated_user = crud.update_user(db, current_user.id, user_update)
    return updated_user

# 头像上传
@router.post("/upload-avatar", response_model=models.UploadResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 检查文件类型
    if file.content_type not in settings.allowed_image_types:
        raise HTTPException(status_code=400, detail="不支持的文件类型")
    
    # 检查文件大小
    file_content = await file.read()
    if len(file_content) > settings.max_file_size:
        raise HTTPException(status_code=400, detail="文件大小超出限制")
    
    # 创建上传目录
    upload_dir = settings.upload_dir
    os.makedirs(upload_dir, exist_ok=True)
    
    # 生成文件名
    file_extension = file.filename.split('.')[-1]
    filename = f"avatar_{current_user.id}_{int(datetime.now().timestamp())}.{file_extension}"
    file_path = os.path.join(upload_dir, filename)
    
    # 保存文件
    with open(file_path, "wb") as buffer:
        buffer.write(file_content)
    
    # 更新用户头像URL
    avatar_url = f"/uploads/{filename}"
    crud.update_user(db, current_user.id, models.UserUpdate(avatar_url=avatar_url))
    
    return {"filename": filename, "url": avatar_url}
