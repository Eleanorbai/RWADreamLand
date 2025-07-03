from fastapi import HTTPException
from .models import ProjectMember

def is_platform_admin(user):
    return getattr(user, "role", None) == "admin" or getattr(user, "is_superuser", False)

def is_project_admin(db, user, project_id):
    member = db.query(ProjectMember).filter_by(
        project_id=project_id, user_id=user.id, role="ADMIN", status="APPROVED"
    ).first()
    return bool(member)

def is_project_member(db, user, project_id):
    member = db.query(ProjectMember).filter_by(
        project_id=project_id, user_id=user.id, status="APPROVED"
    ).first()
    return bool(member)
