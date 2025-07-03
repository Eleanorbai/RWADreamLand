from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import User, GitHubContribution, ProjectMember
from app.permissions import is_platform_admin, is_project_admin, is_project_member
from app.dependencies import get_db, get_current_active_user

router = APIRouter()

# 5. 获取贡献列表
@router.get("/api/github-contributions")
def get_contributions(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if is_platform_admin(current_user) or is_project_admin(db, current_user, project_id):
        return db.query(GitHubContribution).filter_by(project_id=project_id).all()
    elif is_project_member(db, current_user, project_id):
        return db.query(GitHubContribution).filter_by(project_id=project_id, user_id=current_user.id).all()
    else:
        raise HTTPException(403, "无权限访问贡献")

# 6. 审核贡献
@router.put("/api/github-contributions/{contribution_id}/accept")
def accept_contribution(
    contribution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    contribution = db.query(GitHubContribution).filter_by(id=contribution_id).first()
    if not contribution:
        raise HTTPException(404, "贡献不存在")
    if not (is_platform_admin(current_user) or is_project_admin(db, current_user, contribution.project_id)):
        raise HTTPException(403, "无权限审核")
    contribution.status = "ACCEPTED"
    db.commit()
    return {"message": "审核通过"}

@router.put("/api/github-contributions/{contribution_id}/reject")
def reject_contribution(
    contribution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    contribution = db.query(GitHubContribution).filter_by(id=contribution_id).first()
    if not contribution:
        raise HTTPException(404, "贡献不存在")
    if not (is_platform_admin(current_user) or is_project_admin(db, current_user, contribution.project_id)):
        raise HTTPException(403, "无权限审核")
    contribution.status = "REJECTED"
    db.commit()
    return {"message": "已拒绝"}

@router.get("/api/contributors/rankings")
def get_contributor_rankings(
    db: Session = Depends(get_db),
    limit: int = 50
):
    try:
        rankings = (
            db.query(
                GitHubContribution.user_id,
                GitHubContribution.github_username,
                func.count(GitHubContribution.id).label("total_contributions"),
                func.sum(GitHubContribution.contribution_points).label("total_points")
            )
            .filter(
                GitHubContribution.status == "ACCEPTED",
                GitHubContribution.user_id.isnot(None)
            )
            .group_by(GitHubContribution.user_id, GitHubContribution.github_username)
            .order_by(func.sum(GitHubContribution.contribution_points).desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "user_id": r.user_id,
                "github_username": r.github_username,
                "total_contributions": r.total_contributions,
                "total_points": r.total_points
            }
            for r in rankings
        ]
    except Exception as e:
        import traceback
        print("排行榜接口异常：", e)
        traceback.print_exc()
        raise HTTPException(500, f"排行榜接口异常: {e}")
