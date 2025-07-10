from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import User, GitHubContribution, ProjectMember
from app.permissions import is_platform_admin, is_project_admin, is_project_member
from app.dependencies import get_db, get_current_active_user

router = APIRouter()

# 5. 获取贡献列表
@router.get("/github-contributions")
def get_contributions(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    def get_avatar(contrib):
        if hasattr(contrib, 'user') and contrib.user and getattr(contrib.user, 'avatar_url', None):
            return contrib.user.avatar_url
        name = getattr(contrib, 'github_username', None) or getattr(contrib, 'user_id', None) or "U"
        return f"https://api.dicebear.com/6.x/initials/svg?seed={name}&backgroundType=gradientLinear"
    if is_platform_admin(current_user) or is_project_admin(db, current_user, project_id):
        contributions = db.query(GitHubContribution).filter_by(project_id=project_id).all()
    elif is_project_member(db, current_user, project_id):
        contributions = db.query(GitHubContribution).filter_by(project_id=project_id, user_id=current_user.id).all()
    else:
        raise HTTPException(403, "无权限访问贡献")
    return [
        {
            **c.__dict__,
            "avatar_url": get_avatar(c)
        }
        for c in contributions
    ]

# 注意：删除了与main.py冲突的审核贡献路由
# @router.put("/github-contributions/{contribution_id}/accept") - 已删除
# @router.put("/github-contributions/{contribution_id}/reject") - 已删除

@router.get("/contributors/rankings")
def get_contributor_rankings(
    db: Session = Depends(get_db),
    limit: int = 50
):
    from app.models import User
    from sqlalchemy.orm import joinedload
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
    result = []
    for r in rankings:
        # 查找用户头像
        user = db.query(User).filter_by(id=r.user_id).first()
        if user and user.avatar_url:
            avatar_url = user.avatar_url
        else:
            avatar_url = f"https://api.dicebear.com/6.x/initials/svg?seed={r.github_username or r.user_id}&backgroundType=gradientLinear"
        result.append({
            "user_id": r.user_id,
            "github_username": r.github_username,
            "total_contributions": r.total_contributions,
            "total_points": r.total_points,
            "avatar_url": avatar_url
        })
    return result
