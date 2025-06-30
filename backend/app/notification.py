from .models import Notification, User, UserRole
from .database import get_db
from sqlmodel import Session
from datetime import datetime
import asyncio

def create_site_notification(db: Session, user_id: int, title: str, content: str, type: str = "contribution_review"):
    notification = Notification(
        user_id=user_id,
        title=title,
        content=content,
        type=type,
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

def notify_reviewers_new_contribution(db: Session, contribution_title: str, contribution_id: int):
    reviewers = db.query(User).filter(User.role.in_([UserRole.REVIEWER, UserRole.COMMUNITY_MANAGER, UserRole.ADMIN])).all()
    for reviewer in reviewers:
        create_site_notification(
            db,
            user_id=reviewer.id,
            title="有新的GitHub贡献待审核",
            content=f"贡献《{contribution_title}》已提交，点击前往审核。",
            type="contribution_review"
        )
    # WebSocket 实时推送，延迟导入
    try:
        from .main import manager
        asyncio.create_task(manager.broadcast("new_contribution"))
    except ImportError:
        pass  # 避免循环依赖导致的启动失败
