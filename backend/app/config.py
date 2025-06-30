from pydantic_settings import BaseSettings
from typing import Optional, List
import os

class Settings(BaseSettings):
    # 数据库配置
    database_url: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:123456@localhost:5432/postgres"
    )
    
    # JWT配置
    secret_key: str = os.getenv(
        "SECRET_KEY", 
        "your-super-secret-key-change-this-in-production-use-openssl-rand-hex-32"
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7天
    
    # 应用配置
    app_name: str = "RWA Dream Land"
    app_version: str = "2.0.0"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # 服务器配置
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))
    
    # 文件上传配置
    upload_dir: str = "uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_image_types: List[str] = [
        "image/jpeg", 
        "image/png", 
        "image/gif", 
        "image/webp"
    ]
    
    # CORS配置
    cors_origins: List[str] = [
        "http://localhost:3000",  # React开发服务器
        "http://localhost:5173",  # Vite开发服务器
        "https://rwa-dream-land.vercel.app",  # 生产前端
    ]
    
    # 分页配置
    default_page_size: int = 20
    max_page_size: int = 100
    
    # 积分系统配置
    points_for_note_submission: int = 10
    points_for_review_approval: int = 50
    points_for_daily_login: int = 5
    points_for_content_publish: int = 20
    points_for_content_like: int = 2
    points_for_discussion_create: int = 5
    points_for_comment_create: int = 3
    points_for_group_create: int = 15
    
    # 区块链配置（FISCO BCOS）
    blockchain_enabled: bool = os.getenv("BLOCKCHAIN_ENABLED", "False").lower() == "true"
    blockchain_node_url: str = os.getenv("BLOCKCHAIN_NODE_URL", "http://localhost:8545")
    blockchain_private_key: str = os.getenv("BLOCKCHAIN_PRIVATE_KEY", "")
    points_contract_address: str = os.getenv("POINTS_CONTRACT_ADDRESS", "")
    contribution_contract_address: str = os.getenv("CONTRIBUTION_CONTRACT_ADDRESS", "")
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
