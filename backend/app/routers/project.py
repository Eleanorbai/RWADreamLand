from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import User, OpenProject, ProjectMember, GitHubContribution
from app.permissions import is_platform_admin, is_project_admin, is_project_member
from app.dependencies import get_db, get_current_active_user
from typing import Optional, List

router = APIRouter()

# 1. 获取项目详情（公开）
@router.get("/open-projects/{project_id}")
def get_project_detail(project_id: int, db: Session = Depends(get_db)):
    project = db.query(OpenProject).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(404, "项目不存在")
    return project

# 2. 获取项目成员列表
@router.get("/open-projects/{project_id}/members")
def get_project_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if not (is_platform_admin(current_user) or is_project_admin(db, current_user, project_id) or is_project_member(db, current_user, project_id)):
        raise HTTPException(403, "无权限访问成员列表")
    return db.query(ProjectMember).filter_by(project_id=project_id).all()

# 3. 申请加入项目
@router.post("/open-projects/{project_id}/members")
def apply_join_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    exist = db.query(ProjectMember).filter_by(project_id=project_id, user_id=current_user.id).first()
    if exist:
        raise HTTPException(400, "已申请或已是成员")
    member = ProjectMember(
        project_id=project_id,
        user_id=current_user.id,
        role="MEMBER",
        status="PENDING"
    )
    db.add(member)
    db.commit()
    return {"message": "申请已提交"}

# 4. 审批成员申请
@router.post("/open-projects/{project_id}/members/{member_id}/approve")
def approve_member(
    project_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if not (is_platform_admin(current_user) or is_project_admin(db, current_user, project_id)):
        raise HTTPException(403, "无权限审批")
    member = db.query(ProjectMember).filter_by(id=member_id, project_id=project_id).first()
    if not member or member.status != "PENDING":
        raise HTTPException(404, "成员不存在或状态错误")
    member.status = "APPROVED"
    db.commit()
    return {"message": "审批通过"}

@router.post("/open-projects/{project_id}/members/{member_id}/reject")
def reject_member(
    project_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if not (is_platform_admin(current_user) or is_project_admin(db, current_user, project_id)):
        raise HTTPException(403, "无权限审批")
    member = db.query(ProjectMember).filter_by(id=member_id, project_id=project_id).first()
    if not member or member.status != "PENDING":
        raise HTTPException(404, "成员不存在或状态错误")
    member.status = "REJECTED"
    db.commit()
    return {"message": "已拒绝"}

@router.get("/open-projects/{project_id}/contributions/pending-count")
def get_pending_contribution_count(project_id: int, db: Session = Depends(get_db)):
    count = db.query(GitHubContribution).filter(
        GitHubContribution.project_id == project_id,
        GitHubContribution.status == "PENDING"
    ).count()
    return {"count": count}

@router.get("/open-projects/{project_id}/contributions")
def get_project_contributions(
    project_id: int,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(GitHubContribution).filter(GitHubContribution.project_id == project_id)
    if status:
        query = query.filter(GitHubContribution.status == status)
    # 权限校验（可根据需要补充）
    return query.all()
