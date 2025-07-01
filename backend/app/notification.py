from .models import Notification, User, UserRole
from .database import get_db
from sqlmodel import Session
from datetime import datetime
import asyncio

# 通知类型常量
NOTIFY_TYPE_CONTRIBUTION_REVIEW = "contribution_review"
NOTIFY_TYPE_PROJECT_INVITE = "project_invite"
NOTIFY_TYPE_PROJECT_INVITE_RESULT = "project_invite_result"

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
        print(f"===> 正在写入审核通知 user_id={reviewer.id} title={contribution_title}")
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

def notify_project_invite(db: Session, invitee_id: int, project_name: str):
    """通知被邀请人有新的项目邀请"""
    return create_site_notification(
        db,
        user_id=invitee_id,
        title=f"你被邀请加入项目{project_name}",
        content="请前往项目邀请页面处理。",
        type=NOTIFY_TYPE_PROJECT_INVITE
    )

def notify_project_invite_approved(db: Session, inviter_id: int, invitee_name: str, project_name: str):
    """通知邀请人：对方已接受邀请"""
    return create_site_notification(
        db,
        user_id=inviter_id,
        title=f"{invitee_name}已接受加入项目{project_name}",
        content="邀请已通过。",
        type=NOTIFY_TYPE_PROJECT_INVITE_RESULT
    )

def notify_project_invite_rejected(db: Session, inviter_id: int, invitee_name: str, project_name: str):
    """通知邀请人：对方拒绝邀请"""
    return create_site_notification(
        db,
        user_id=inviter_id,
        title=f"{invitee_name}拒绝加入项目{project_name}",
        content="邀请被拒绝。",
        type=NOTIFY_TYPE_PROJECT_INVITE_RESULT
    )
