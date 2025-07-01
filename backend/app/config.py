from pydantic_settings import BaseSettings
from typing import Optional, List
import os

class Settings(BaseSettings):
    # 数据库配置
    database_url: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./rwa_dream_land.db"  # 使用SQLite进行开发
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
    
    # GitHub集成配置
    github_enabled: bool = os.getenv("GITHUB_ENABLED", "False").lower() == "true"
    github_token: str = os.getenv("GITHUB_TOKEN", "")
    github_webhook_secret: str = os.getenv("GITHUB_WEBHOOK_SECRET", "rwa123456")  # 必须与GitHub Webhook配置一致
    github_default_repo: str = os.getenv("GITHUB_DEFAULT_REPO", "https://github.com/Eleanorbai/RWADreamLand.git")
    
    # GitHub贡献积分配置
    contribution_points: dict = {
        "bug_report": 10,
        "feature_request": 15,
        "documentation": 20,
        "code_contribution": 50,
        "critical_fix": 100,
        "ui_ux_improvement": 25,
        "testing": 15,
        "other": 5
    }
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
