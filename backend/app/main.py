from fastapi import FastAPI, Depends, HTTPException, status, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session
from typing import List, Optional
import os
import json
import logging

from .auth import router as auth_router, get_current_active_user, require_role
from .database import get_db, init_db
from .config import settings
from . import crud, models
from .utils import verify_password, get_password_hash
from pydantic import BaseModel
from .notification import create_site_notification, notify_project_invite, notify_project_invite_approved, notify_project_invite_rejected

logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug
)

# 初始化数据库
init_db()

# 创建上传目录
os.makedirs(settings.upload_dir, exist_ok=True)

# 静态文件服务（用于头像等文件）
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # 或指定你的前端地址如 ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含认证路由
app.include_router(auth_router, prefix="/api", tags=["认证"])

# 笔记相关路由
@app.post("/api/notes", response_model=models.NotePublic, tags=["笔记"])
def create_note(
    note: models.NoteCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.create_note(db=db, note=note, author_id=current_user.id)

@app.get("/api/notes", response_model=List[models.NotePublic], tags=["笔记"])
def read_notes(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 普通用户只能看到自己的笔记
    if current_user.role == models.UserRole.USER:
        return crud.get_notes_by_user(db, user_id=current_user.id, skip=skip, limit=limit)
    # 管理员和审核员可以看到所有笔记
    else:
        return crud.get_notes(db, skip=skip, limit=limit)

@app.get("/api/notes/my", response_model=List[models.NotePublic], tags=["笔记"])
def read_my_notes(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_notes_by_user(db, user_id=current_user.id, skip=skip, limit=limit)

@app.get("/api/notes/{note_id}", response_model=models.NotePublic, tags=["笔记"])
def read_note(
    note_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_note = crud.get_note(db, note_id=note_id)
    if db_note is None:
        raise HTTPException(status_code=404, detail="笔记不存在")
    
    # 检查权限：只有作者、管理员和审核员可以查看
    if (db_note.author_id != current_user.id and 
        current_user.role not in [models.UserRole.ADMIN, models.UserRole.REVIEWER]):
        raise HTTPException(status_code=403, detail="权限不足")
    
    return db_note

@app.put("/api/notes/{note_id}", response_model=models.NotePublic, tags=["笔记"])
def update_note(
    note_id: int,
    note_update: models.NoteUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_note = crud.update_note(db, note_id=note_id, note_update=note_update, user_id=current_user.id)
    if db_note is None:
        raise HTTPException(status_code=404, detail="笔记不存在或无权限修改")
    return db_note

@app.delete("/api/notes/{note_id}", tags=["笔记"])
def delete_note(
    note_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    success = crud.delete_note(db, note_id=note_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="笔记不存在或无权限删除")
    return {"message": "笔记已删除"}

@app.post("/api/notes/{note_id}/submit", response_model=models.ReviewRequestPublic, tags=["笔记", "审核"])
def submit_note_for_review(
    note_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 检查笔记是否存在且属于当前用户
    db_note = crud.get_note(db, note_id=note_id)
    if not db_note or db_note.author_id != current_user.id:
        raise HTTPException(status_code=404, detail="笔记不存在或无权限")
    
    # 检查是否已经提交过审核
    if db_note.is_submitted:
        raise HTTPException(status_code=400, detail="笔记已提交审核")
    
    # 标记笔记为已提交
    crud.submit_note_for_review(db, note_id=note_id, user_id=current_user.id)
    
    # 创建审核请求
    review_request = crud.create_review_request(db, note_id=note_id, author_id=current_user.id)
    
    # 给用户加积分
    crud.add_user_points(db, current_user.id, settings.points_for_note_submission)
    
    return review_request

# 审核相关路由
@app.get("/review-requests", response_model=List[models.ReviewRequestWithDetails], tags=["审核"])
def read_review_requests(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(require_role([models.UserRole.REVIEWER, models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    return crud.get_review_requests_for_reviewer(db, skip=skip, limit=limit)

@app.get("/review-requests/my", response_model=List[models.ReviewRequestWithDetails], tags=["审核"])
def read_my_review_requests(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_review_requests_by_user(db, user_id=current_user.id, skip=skip, limit=limit)

@app.post("/reviews", response_model=models.ReviewPublic, tags=["审核"])
def create_review(
    review: models.ReviewCreate,
    current_user: models.User = Depends(require_role([models.UserRole.REVIEWER, models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    # 检查审核请求是否存在
    review_request = crud.get_review_request(db, review.review_request_id)
    if not review_request:
        raise HTTPException(status_code=404, detail="审核请求不存在")
    
    # 检查是否已经审核过
    if review_request.status != models.ReviewStatus.PENDING:
        raise HTTPException(status_code=400, detail="该审核请求已处理")
    
    # 创建审核记录
    db_review = crud.create_review(db=db, review=review, reviewer_id=current_user.id)
    
    # 根据审核结果给作者加积分
    if review.status == models.ReviewStatus.APPROVED:
        crud.add_user_points(db, review_request.author_id, settings.points_for_review_approval)
        
        # 记录区块链积分记录
        try:
            from .blockchain import record_user_points
            blockchain_record = record_user_points(
                user_id=review_request.author_id,
                points=settings.points_for_review_approval,
                action=models.BlockchainAction.POINTS_REWARD,
                description=f"内容审核通过奖励: {settings.points_for_review_approval} 积分"
            )
            if blockchain_record:
                crud.create_blockchain_record(db, blockchain_record, review_request.author_id)
        except Exception as e:
            print(f"区块链记录失败: {e}")

    return db_review

# 用户管理相关路由（仅管理员）
@app.get("/api/users", response_model=List[models.UserPublic], tags=["用户管理"])
def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    return crud.get_users(db, skip=skip, limit=limit)

@app.get("/api/users/{user_id}", response_model=models.UserPublic, tags=["用户管理"])
def read_user(
    user_id: int,
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    return db_user

@app.patch("/api/users/{user_id}/role", tags=["用户管理"])
def update_user_role(
    user_id: int,
    new_role: models.UserRole = Body(..., embed=True),
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    user.role = new_role
    db.add(user)
    db.commit()
    db.refresh(user)
    # 记录操作日志（预留）
    return {"msg": "角色已更新", "user": user}

@app.get("/", tags=["系统"])
def read_root():
    return {"message": "RWA 学习平台后端已启动", "version": "2.0"}

# 标签相关路由
@app.get("/api/tags", response_model=List[models.TagPublic], tags=["标签"])
def read_tags(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_tags(db, skip=skip, limit=limit)

@app.post("/api/tags", response_model=models.TagPublic, tags=["标签"])
def create_tag(
    tag: models.TagCreate,
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN, models.UserRole.COMMUNITY_MANAGER])),
    db: Session = Depends(get_db)
):
    # 检查标签是否已存在
    existing_tag = crud.get_tag_by_name(db, tag.name)
    if existing_tag:
        raise HTTPException(status_code=400, detail="标签已存在")
    
    return crud.create_tag(db=db, tag=tag)

# 小组相关路由
@app.get("/api/groups", response_model=List[models.GroupWithOwner], tags=["小组"])
def read_groups(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_groups(db, skip=skip, limit=limit)

@app.get("/api/groups/my", response_model=List[models.GroupWithOwner], tags=["小组"])
def read_my_groups(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_groups_by_user(db, user_id=current_user.id)

@app.post("/api/groups", response_model=models.GroupPublic, tags=["小组"])
def create_group(
    group: models.GroupCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.create_group(db=db, group=group, owner_id=current_user.id)

@app.get("/api/groups/{group_id}", response_model=models.GroupWithOwner, tags=["小组"])
def read_group(
    group_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_group = crud.get_group(db, group_id=group_id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="小组不存在")
    
    # 检查权限：公开小组或者是成员才能查看
    if not db_group.is_public and not crud.is_group_member(db, group_id, current_user.id):
        raise HTTPException(status_code=403, detail="权限不足")
    
    return db_group

@app.put("/api/groups/{group_id}", response_model=models.GroupPublic, tags=["小组"])
def update_group(
    group_id: int,
    group_update: models.GroupUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_group = crud.update_group(db, group_id=group_id, group_update=group_update, user_id=current_user.id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="小组不存在或无权限修改")
    return db_group

@app.delete("/api/groups/{group_id}", tags=["小组"])
def delete_group(
    group_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    success = crud.delete_group(db, group_id=group_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="小组不存在或无权限删除")
    return {"message": "小组已删除"}

# 小组成员相关路由
@app.get("/api/groups/{group_id}/members", response_model=List[models.GroupMemberWithUser], tags=["小组成员"])
def read_group_members(
    group_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 检查小组是否存在和权限
    db_group = crud.get_group(db, group_id=group_id)
    if not db_group:
        raise HTTPException(status_code=404, detail="小组不存在")
    
    if not db_group.is_public and not crud.is_group_member(db, group_id, current_user.id):
        raise HTTPException(status_code=403, detail="权限不足")
    
    return crud.get_group_members(db, group_id=group_id)

@app.post("/api/groups/{group_id}/join", response_model=models.GroupMemberPublic, tags=["小组成员"])
def join_group(
    group_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 检查小组是否存在
    db_group = crud.get_group(db, group_id=group_id)
    if not db_group:
        raise HTTPException(status_code=404, detail="小组不存在")
    
    # 检查是否已经是成员
    if crud.is_group_member(db, group_id, current_user.id):
        raise HTTPException(status_code=400, detail="已经是小组成员")
    
    # 检查成员数量限制
    if db_group.max_members and db_group.member_count >= db_group.max_members:
        raise HTTPException(status_code=400, detail="小组成员已满")
    
    member = crud.add_group_member(db, group_id=group_id, user_id=current_user.id)
    if not member:
        raise HTTPException(status_code=400, detail="加入小组失败")
    
    return member

@app.delete("/api/groups/{group_id}/leave", tags=["小组成员"])
def leave_group(
    group_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 检查是否是小组创建者
    db_group = crud.get_group(db, group_id=group_id)
    if db_group and db_group.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="小组创建者不能离开小组")
    
    success = crud.remove_group_member(db, group_id=group_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="不是小组成员")
    
    return {"message": "已离开小组"}

# 内容相关路由
@app.get("/api/contents", response_model=List[models.ContentWithDetails], tags=["内容"])
def read_contents(
    skip: int = 0,
    limit: int = 100,
    content_type: Optional[models.ContentType] = None,
    db: Session = Depends(get_db)
):
    return crud.get_contents(db, skip=skip, limit=limit, content_type=content_type)

@app.get("/api/contents/my", response_model=List[models.ContentPublic], tags=["内容"])
def read_my_contents(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_contents_by_user(db, user_id=current_user.id, skip=skip, limit=limit)

@app.post("/api/contents", response_model=models.ContentPublic, tags=["内容"])
def create_content(
    content: models.ContentCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.create_content(db=db, content=content, author_id=current_user.id)

@app.get("/api/contents/{content_id}", response_model=models.ContentWithDetails, tags=["内容"])
def read_content(
    content_id: int,
    current_user: Optional[models.User] = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_content = crud.get_content(db, content_id=content_id)
    if db_content is None:
        raise HTTPException(status_code=404, detail="内容不存在")
    
    # 记录浏览
    user_id = current_user.id if current_user else None
    crud.increment_content_view(db, content_id=content_id, user_id=user_id)
    
    return db_content

@app.put("/api/contents/{content_id}", response_model=models.ContentPublic, tags=["内容"])
def update_content(
    content_id: int,
    content_update: models.ContentUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_content = crud.update_content(db, content_id=content_id, content_update=content_update, user_id=current_user.id)
    if db_content is None:
        raise HTTPException(status_code=404, detail="内容不存在或无权限修改")
    return db_content

@app.post("/api/contents/{content_id}/publish", response_model=models.ContentPublic, tags=["内容"])
def publish_content(
    content_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_content = crud.publish_content(db, content_id=content_id, user_id=current_user.id)
    if db_content is None:
        raise HTTPException(status_code=404, detail="内容不存在或无权限发布")
    
    # 发布内容时给用户加积分
    crud.add_user_points(db, current_user.id, settings.points_for_content_publish)
    
    # 记录区块链记录
    blockchain_record = models.BlockchainRecordCreate(
        action=models.BlockchainAction.CONTENT_PUBLISH,
        description=f"发布内容: {db_content.title}",
        content_id=content_id
    )
    crud.create_blockchain_record(db, record=blockchain_record, user_id=current_user.id)
    
    return db_content

@app.delete("/api/contents/{content_id}", tags=["内容"])
def delete_content(
    content_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    success = crud.delete_content(db, content_id=content_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="内容不存在或无权限删除")
    return {"message": "内容已删除"}

# 内容点赞相关路由
@app.post("/api/contents/{content_id}/like", tags=["内容点赞"])
def toggle_content_like(
    content_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 检查内容是否存在
    db_content = crud.get_content(db, content_id=content_id)
    if not db_content:
        raise HTTPException(status_code=404, detail="内容不存在")
    
    liked = crud.toggle_content_like(db, content_id=content_id, user_id=current_user.id)
    return {"liked": liked, "message": "点赞成功" if liked else "取消点赞成功"}

@app.get("/api/contents/{content_id}/like-status", tags=["内容点赞"])
def get_content_like_status(
    content_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    liked = crud.is_content_liked_by_user(db, content_id=content_id, user_id=current_user.id)
    return {"liked": liked}

# 内容标签相关路由
@app.post("/api/contents/{content_id}/tags/{tag_id}", tags=["内容标签"])
def add_content_tag(
    content_id: int,
    tag_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 检查内容是否属于当前用户
    db_content = crud.get_content(db, content_id=content_id)
    if not db_content or db_content.author_id != current_user.id:
        raise HTTPException(status_code=404, detail="内容不存在或无权限")
    
    # 检查标签是否存在
    db_tag = crud.get_tag(db, tag_id=tag_id)
    if not db_tag:
        raise HTTPException(status_code=404, detail="标签不存在")
    
    content_tag = crud.add_content_tag(db, content_id=content_id, tag_id=tag_id)
    if not content_tag:
        raise HTTPException(status_code=400, detail="标签已存在")
    
    return {"message": "标签添加成功"}

@app.delete("/api/contents/{content_id}/tags/{tag_id}", tags=["内容标签"])
def remove_content_tag(
    content_id: int,
    tag_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 检查内容是否属于当前用户
    db_content = crud.get_content(db, content_id=content_id)
    if not db_content or db_content.author_id != current_user.id:
        raise HTTPException(status_code=404, detail="内容不存在或无权限")
    
    success = crud.remove_content_tag(db, content_id=content_id, tag_id=tag_id)
    if not success:
        raise HTTPException(status_code=404, detail="标签不存在")
    
    return {"message": "标签移除成功"}

@app.get("/api/contents/{content_id}/tags", response_model=List[models.TagPublic], tags=["内容标签"])
def get_content_tags(
    content_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_content_tags(db, content_id=content_id)

# 讨论相关路由
@app.get("/api/discussions", response_model=List[models.DiscussionWithDetails], tags=["讨论"])
def read_discussions(
    content_id: Optional[int] = None,
    group_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 如果是小组讨论，检查权限
    if group_id:
        db_group = crud.get_group(db, group_id=group_id)
        if not db_group:
            raise HTTPException(status_code=404, detail="小组不存在")
        
        if not db_group.is_public and not crud.is_group_member(db, group_id, current_user.id):
            raise HTTPException(status_code=403, detail="权限不足")
    
    return crud.get_discussions(db, content_id=content_id, group_id=group_id, skip=skip, limit=limit)

@app.post("/api/discussions", response_model=models.DiscussionPublic, tags=["讨论"])
def create_discussion(
    discussion: models.DiscussionCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 如果是小组讨论，检查权限
    if discussion.group_id:
        if not crud.is_group_member(db, discussion.group_id, current_user.id):
            raise HTTPException(status_code=403, detail="只有小组成员才能创建讨论")
    
    return crud.create_discussion(db=db, discussion=discussion, author_id=current_user.id)

@app.get("/api/discussions/{discussion_id}", response_model=models.DiscussionWithDetails, tags=["讨论"])
def read_discussion(
    discussion_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_discussion = crud.get_discussion(db, discussion_id=discussion_id)
    if db_discussion is None:
        raise HTTPException(status_code=404, detail="讨论不存在")
    
    # 如果是小组讨论，检查权限
    if db_discussion.group_id:
        db_group = crud.get_group(db, db_discussion.group_id)
        if not db_group.is_public and not crud.is_group_member(db, db_discussion.group_id, current_user.id):
            raise HTTPException(status_code=403, detail="权限不足")
    
    return db_discussion

@app.put("/api/discussions/{discussion_id}", response_model=models.DiscussionPublic, tags=["讨论"])
def update_discussion(
    discussion_id: int,
    discussion_update: models.DiscussionUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_discussion = crud.update_discussion(db, discussion_id=discussion_id, discussion_update=discussion_update, user_id=current_user.id)
    if db_discussion is None:
        raise HTTPException(status_code=404, detail="讨论不存在或无权限修改")
    return db_discussion

@app.delete("/api/discussions/{discussion_id}", tags=["讨论"])
def delete_discussion(
    discussion_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    success = crud.delete_discussion(db, discussion_id=discussion_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="讨论不存在或无权限删除")
    return {"message": "讨论已删除"}

# 评论相关路由
@app.get("/api/discussions/{discussion_id}/comments", response_model=List[models.CommentWithDetails], tags=["评论"])
def read_comments(
    discussion_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 检查讨论是否存在和权限
    db_discussion = crud.get_discussion(db, discussion_id=discussion_id)
    if not db_discussion:
        raise HTTPException(status_code=404, detail="讨论不存在")
    
    if db_discussion.group_id:
        db_group = crud.get_group(db, db_discussion.group_id)
        if not db_group.is_public and not crud.is_group_member(db, db_discussion.group_id, current_user.id):
            raise HTTPException(status_code=403, detail="权限不足")
    
    return crud.get_comments(db, discussion_id=discussion_id, skip=skip, limit=limit)

@app.post("/api/comments", response_model=models.CommentPublic, tags=["评论"])
def create_comment(
    comment: models.CommentCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 检查讨论是否存在和权限
    db_discussion = crud.get_discussion(db, comment.discussion_id)
    if not db_discussion:
        raise HTTPException(status_code=404, detail="讨论不存在")
    
    if db_discussion.group_id:
        if not crud.is_group_member(db, db_discussion.group_id, current_user.id):
            raise HTTPException(status_code=403, detail="只有小组成员才能评论")
    
    return crud.create_comment(db=db, comment=comment, author_id=current_user.id)

@app.put("/api/comments/{comment_id}", response_model=models.CommentPublic, tags=["评论"])
def update_comment(
    comment_id: int,
    comment_update: models.CommentUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_comment = crud.update_comment(db, comment_id=comment_id, comment_update=comment_update, user_id=current_user.id)
    if db_comment is None:
        raise HTTPException(status_code=404, detail="评论不存在或无权限修改")
    return db_comment

@app.delete("/api/comments/{comment_id}", tags=["评论"])
def delete_comment(
    comment_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    success = crud.delete_comment(db, comment_id=comment_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="评论不存在或无权限删除")
    return {"message": "评论已删除"}

# 站内信相关路由
@app.get("/api/messages", response_model=List[models.MessageWithDetails], tags=["站内信"])
def read_messages(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_messages_for_user(db, user_id=current_user.id, skip=skip, limit=limit)

@app.post("/api/messages", response_model=models.MessagePublic, tags=["站内信"])
def create_message(
    message: models.MessageCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.create_message(db=db, message=message, sender_id=current_user.id)

@app.put("/api/messages/{message_id}/read", response_model=models.MessagePublic, tags=["站内信"])
def mark_message_read(
    message_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_message = crud.mark_message_read(db, message_id=message_id, user_id=current_user.id)
    if db_message is None:
        raise HTTPException(status_code=404, detail="消息不存在或无权限")
    return db_message

@app.get("/api/messages/unread-count", tags=["站内信"])
def get_unread_message_count(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    count = crud.get_unread_message_count(db, user_id=current_user.id)
    return {"unread_count": count}

# 区块链记录相关路由
@app.get("/api/blockchain-records", response_model=List[models.BlockchainRecordWithDetails], tags=["区块链记录"])
def read_blockchain_records(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_blockchain_records_by_user(db, user_id=current_user.id, skip=skip, limit=limit)

# 统计数据相关路由
@app.get("/api/stats", response_model=models.PlatformStats, tags=["统计"])
def get_platform_stats(
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN, models.UserRole.COMMUNITY_MANAGER])),
    db: Session = Depends(get_db)
):
    # 这里实现统计数据的获取逻辑
    # 为了示例，返回一些模拟数据
    return models.PlatformStats(
        total_users=100,
        total_contents=50,
        total_groups=10,
        total_discussions=30,
        total_points_distributed=5000,
        active_users_today=20,
        active_users_week=50,
        popular_tags=[
            {"tag_name": "RWA", "usage_count": 25},
            {"tag_name": "区块链", "usage_count": 20},
            {"tag_name": "金融科技", "usage_count": 15}
        ]
    )

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

@app.put("/api/me/password", tags=["用户"])
def change_password(
    data: PasswordChangeRequest,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="当前密码错误")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="新密码长度不能少于6位")
    current_user.hashed_password = get_password_hash(data.new_password)
    db.add(current_user)
    db.commit()
    return {"msg": "密码修改成功"}

# RWA星球共创项目相关路由

# 开源项目管理路由
@app.post("/api/open-projects", response_model=models.OpenProject, tags=["开源项目"])
def create_open_project(
    project: models.OpenProjectCreate,
    db: Session = Depends(get_db)
):
    return crud.create_open_project(db=db, project=project)

@app.get("/api/open-projects", response_model=List[models.OpenProjectPublic], tags=["开源项目"])
def read_open_projects(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    return crud.get_open_projects(db, skip=skip, limit=limit, is_active=is_active)

@app.get("/api/open-projects/{project_id}", response_model=models.OpenProjectPublic, tags=["开源项目"])
def read_open_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    project = crud.get_open_project(db, project_id=project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project

@app.put("/api/open-projects/{project_id}", response_model=models.OpenProjectPublic, tags=["开源项目"])
def update_open_project(
    project_id: int,
    project_update: models.OpenProjectUpdate,
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN, models.UserRole.COMMUNITY_MANAGER])),
    db: Session = Depends(get_db)
):
    project = crud.update_open_project(db, project_id=project_id, project_update=project_update)
    if project is None:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project

@app.delete("/api/open-projects/{project_id}", tags=["开源项目"])
def delete_open_project(
    project_id: int,
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    success = crud.delete_open_project(db, project_id=project_id)
    if not success:
        raise HTTPException(status_code=404, detail="项目不存在")
    return {"msg": "项目删除成功"}

# GitHub贡献相关路由
@app.get("/api/github-contributions", response_model=List[models.GitHubContributionWithDetails], tags=["GitHub贡献"])
def read_github_contributions(
    project_id: Optional[int] = None,
    user_id: Optional[int] = None,
    status: Optional[models.ContributionStatus] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_github_contributions(
        db, project_id=project_id, user_id=user_id, status=status, skip=skip, limit=limit
    )

@app.get("/api/github-contributions/{contribution_id}", response_model=models.GitHubContributionWithDetails, tags=["GitHub贡献"])
def read_github_contribution(
    contribution_id: int,
    db: Session = Depends(get_db)
):
    contribution = crud.get_github_contribution(db, contribution_id=contribution_id)
    if contribution is None:
        raise HTTPException(status_code=404, detail="贡献记录不存在")
    return contribution

@app.put("/api/github-contributions/{contribution_id}/accept", response_model=models.GitHubContributionPublic, tags=["GitHub贡献"])
def accept_github_contribution(
    contribution_id: int,
    user_id: Optional[int] = None,
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN, models.UserRole.COMMUNITY_MANAGER])),
    db: Session = Depends(get_db)
):
    contribution = crud.accept_github_contribution(db, contribution_id=contribution_id, user_id=user_id)
    if contribution is None:
        raise HTTPException(status_code=404, detail="贡献记录不存在或已处理")
    
    # 记录区块链
    try:
        from .blockchain import record_user_points
        if contribution.user_id:
            blockchain_record = record_user_points(
                user_id=contribution.user_id,
                points=contribution.contribution_points,
                action=models.BlockchainAction.CONTRIBUTION_RECORD,
                description=f"GitHub贡献确认: {contribution.issue_title}"
            )
            if blockchain_record:
                crud.create_blockchain_record(db, blockchain_record, contribution.user_id)
                # 更新贡献记录的区块链哈希
                update_data = models.GitHubContributionUpdate(
                    blockchain_hash=blockchain_record.transaction_hash
                )
                crud.update_github_contribution(db, contribution_id, update_data)
    except Exception as e:
        logger.error(f"区块链记录失败: {e}")
    
    return contribution

@app.put("/api/github-contributions/{contribution_id}/reject", response_model=models.GitHubContributionPublic, tags=["GitHub贡献"])
def reject_github_contribution(
    contribution_id: int,
    reason: Optional[str] = None,
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN, models.UserRole.COMMUNITY_MANAGER])),
    db: Session = Depends(get_db)
):
    """拒绝GitHub贡献"""
    contribution = crud.reject_github_contribution(db, contribution_id=contribution_id, reason=reason)
    if contribution is None:
        raise HTTPException(status_code=404, detail="贡献记录不存在或已处理")
    return contribution

@app.get("/api/admin/github-contributions", response_model=List[models.GitHubContributionPublic], tags=["GitHub贡献"])
def list_github_contributions_admin(
    project_id: Optional[int] = None,
    status: Optional[models.ContributionStatus] = None,
    github_username: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN, models.UserRole.COMMUNITY_MANAGER])),
    db: Session = Depends(get_db)
):
    """获取GitHub贡献列表（管理员）"""
    return crud.get_github_contributions_list(
        db,
        project_id=project_id,
        status=status,
        github_username=github_username,
        skip=skip,
        limit=limit
    )

@app.get("/api/github-contributions/stats", tags=["GitHub贡献"])
def get_github_contributions_stats(
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN, models.UserRole.COMMUNITY_MANAGER])),
    db: Session = Depends(get_db)
):
    """获取GitHub贡献统计"""
    return crud.get_github_contributions_stats(db)

# GitHub Webhook端点
@app.post("/api/github/webhook", tags=["GitHub集成"])
async def github_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    print("收到 GitHub webhook 请求")
    from .github_service import github_service
    
    # 获取请求体
    payload_body = await request.body()
    
    # 验证签名
    signature = request.headers.get("X-Hub-Signature-256", "")
    if not github_service.verify_webhook_signature(payload_body, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    
    # 获取事件类型
    event_type = request.headers.get("X-GitHub-Event", "")
    
    # 解析JSON载荷
    try:
        payload = json.loads(payload_body.decode('utf-8'))
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    
    # 处理事件
    result = github_service.process_webhook_event(event_type, payload, db)
    
    return {"status": "processed", "contribution_id": result.id if result else None}

@app.post("/api/github/sync/{project_id}", tags=["GitHub集成"])
def sync_github_contributions(
    project_id: int,
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN, models.UserRole.COMMUNITY_MANAGER])),
    db: Session = Depends(get_db)
):
    from .github_service import github_service
    
    synced_count = github_service.sync_project_contributions(project_id, db)
    return {"msg": f"同步完成，新增 {synced_count} 条贡献记录"}

# 贡献者管理路由
@app.post("/api/contributor-profile", response_model=models.ContributorProfilePublic, tags=["贡献者"])
def create_contributor_profile(
    profile: models.ContributorProfileCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 检查是否已存在
    existing_profile = crud.get_contributor_profile(db, current_user.id)
    if existing_profile:
        raise HTTPException(status_code=400, detail="贡献者资料已存在")
    
    return crud.create_contributor_profile(db=db, user_id=current_user.id, profile=profile)

@app.get("/api/contributor-profile", response_model=models.ContributorProfileWithDetails, tags=["贡献者"])
def read_my_contributor_profile(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = crud.get_contributor_profile(db, current_user.id)
    if profile is None:
        raise HTTPException(status_code=404, detail="贡献者资料不存在")
    return profile

@app.put("/api/contributor-profile", response_model=models.ContributorProfilePublic, tags=["贡献者"])
def update_my_contributor_profile(
    profile_update: models.ContributorProfileUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = crud.update_contributor_profile(db, user_id=current_user.id, profile_update=profile_update)
    if profile is None:
        raise HTTPException(status_code=404, detail="贡献者资料不存在")
    return profile

@app.get("/api/contributors/rankings", response_model=List[models.ContributorRanking], tags=["贡献者"])
def read_contributor_rankings(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    return crud.get_contributor_rankings(db, limit=limit)

@app.get("/api/contributors/{user_id}/contributions", response_model=List[models.GitHubContributionPublic], tags=["贡献者"])
def read_user_contributions(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_github_contributions(db, user_id=user_id, skip=skip, limit=limit)

# 项目统计路由
@app.get("/api/open-projects/{project_id}/stats", response_model=models.ProjectStats, tags=["开源项目"])
def read_project_stats(
    project_id: int,
    db: Session = Depends(get_db)
):
    stats = crud.get_project_stats(db, project_id)
    if stats is None:
        raise HTTPException(status_code=404, detail="项目不存在")
    return stats

# 实时贡献动态API
@app.get("/api/open-projects/{project_id}/recent-activities", tags=["开源项目"])
def read_recent_activities(
    project_id: int,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """获取项目最近活动动态"""
    contributions = crud.get_github_contributions(db, project_id=project_id, limit=limit)
    activities = []
    
    for contrib in contributions:
        activity = {
            "id": contrib.id,
            "type": "contribution",
            "user": {
                "github_username": contrib.github_username,
                "avatar": f"https://github.com/{contrib.github_username}.png"
            },
            "action": f"提交了{contribution_type_labels.get(str(contrib.contribution_type), '贡献')}",
            "title": contrib.issue_title,
            "points": contrib.contribution_points,
            "status": contrib.status,
            "blockchain_hash": contrib.blockchain_hash,
            "created_at": contrib.github_created_at.isoformat(),
            "accepted_at": contrib.accepted_at.isoformat() if contrib.accepted_at else None,
            "is_on_chain": bool(contrib.blockchain_hash)
        }
        activities.append(activity)
    
    return {"activities": activities}

# 区块链记录详情API
@app.get("/api/blockchain-records/{record_id}", response_model=models.BlockchainRecordWithDetails, tags=["区块链记录"])
def read_blockchain_record_detail(
    record_id: int,
    db: Session = Depends(get_db)
):
    """获取区块链记录详情"""
    record = db.get(models.BlockchainRecord, record_id)
    if record is None:
        raise HTTPException(status_code=404, detail="区块链记录不存在")
    return record

# 用户贡献统计API
@app.get("/api/users/{user_id}/contribution-stats", tags=["用户"])
def read_user_contribution_stats(
    user_id: int,
    db: Session = Depends(get_db)
):
    """获取用户贡献统计信息"""
    profile = crud.get_contributor_profile(db, user_id)
    contributions = crud.get_github_contributions(db, user_id=user_id, limit=1000)
    blockchain_records = crud.get_blockchain_records_by_user(db, user_id=user_id, limit=1000)
    
    # 统计不同类型贡献
    contribution_types = {}
    for contrib in contributions:
        contrib_type = contrib.contribution_type.value
        if contrib_type not in contribution_types:
            contribution_types[contrib_type] = {"count": 0, "points": 0}
        contribution_types[contrib_type]["count"] += 1
        contribution_types[contrib_type]["points"] += contrib.contribution_points
    
    # 最近贡献活动
    recent_contributions = contributions[:10]
    
    # 区块链确权记录
    confirmed_records = [r for r in blockchain_records if r.is_confirmed]
    
    return {
        "profile": profile,
        "total_contributions": len(contributions),
        "total_points": sum(c.contribution_points for c in contributions),
        "total_blockchain_records": len(confirmed_records),
        "contribution_types": contribution_types,
        "recent_contributions": [
            {
                "id": c.id,
                "title": c.issue_title,
                "type": c.contribution_type.value,
                "points": c.contribution_points,
                "status": c.status.value,
                "created_at": c.github_created_at.isoformat(),
                "blockchain_hash": c.blockchain_hash,
                "is_on_chain": bool(c.blockchain_hash)
            } for c in recent_contributions
        ],
        "blockchain_records": [
            {
                "id": r.id,
                "transaction_hash": r.transaction_hash,
                "block_number": r.block_number,
                "points_amount": r.points_amount,
                "description": r.description,
                "confirmed_at": r.confirmed_at.isoformat() if r.confirmed_at else None
            } for r in confirmed_records
        ]
    }

# ========== 项目成员管理 ==========
from fastapi import Path

@app.get("/api/open-projects/{project_id}/members", tags=["项目成员"])
def list_project_members(
    project_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 公开项目所有人可查，私有项目仅成员可查
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(404, "项目不存在")
    if not project.is_public:
        member = crud.get_member(db, project_id, current_user.id)
        if not member:
            raise HTTPException(403, "无权查看私有项目成员")
    return crud.list_members(db, project_id)

@app.post("/api/open-projects/{project_id}/members", tags=["项目成员"])
def apply_project_member(
    project_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 检查是否已是成员
    member = crud.get_member(db, project_id, current_user.id)
    if member:
        raise HTTPException(400, "你已是该项目成员")
    # 创建申请，状态为PENDING，管理员审核
    new_member = crud.add_member(db, project_id, current_user.id, role="MEMBER", status="PENDING")
    return new_member

@app.delete("/api/open-projects/{project_id}/members/{member_id}", tags=["项目成员"])
def remove_project_member(
    project_id: int,
    member_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 仅管理员可删
    member = crud.get_member(db, project_id, current_user.id)
    if not member or member.role != "ADMIN":
        raise HTTPException(403, "仅项目管理员可移除成员")
    return {"success": crud.remove_member(db, member_id)}

# ========== 项目邀请管理 ==========

@app.post("/api/open-projects/{project_id}/invites", tags=["项目邀请"])
def create_project_invite(
    project_id: int,
    invitee_id: int = Body(...),
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 仅管理员可邀请
    member = crud.get_member(db, project_id, current_user.id)
    if not member or member.role != "ADMIN":
        raise HTTPException(403, "仅项目管理员可邀请成员")
    invite = crud.create_invite(db, project_id, current_user.id, invitee_id)
    # 通知被邀请人
    project = crud.get_project(db, project_id)
    notify_project_invite(db, invitee_id, project.name)
    return invite

@app.get("/api/open-projects/{project_id}/invites", tags=["项目邀请"])
def list_project_invites(
    project_id: int,
    status: Optional[str] = None,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 仅项目成员可查
    member = crud.get_member(db, project_id, current_user.id)
    if not member:
        raise HTTPException(403, "仅项目成员可查看邀请")
    return crud.list_invites(db, project_id, status)

@app.post("/api/open-projects/{project_id}/invites/{invite_id}/approve", tags=["项目邀请"])
def approve_project_invite(
    project_id: int,
    invite_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 仅被邀请人本人可操作
    invite = crud.get_invite(db, invite_id)
    if not invite or invite.project_id != project_id:
        raise HTTPException(404, "邀请不存在")
    if invite.invitee_id != current_user.id:
        raise HTTPException(403, "仅被邀请人可操作")
    if invite.status != "PENDING":
        raise HTTPException(400, "邀请已处理")
    # 更新邀请状态
    crud.update_invite(db, invite_id, "APPROVED")
    # 添加成员
    crud.add_member(db, project_id, current_user.id, role="MEMBER")
    # 通知邀请人
    project = crud.get_project(db, project_id)
    notify_project_invite_approved(db, invite.inviter_id, current_user.username, project.name)
    return {"success": True}

@app.post("/api/open-projects/{project_id}/invites/{invite_id}/reject", tags=["项目邀请"])
def reject_project_invite(
    project_id: int,
    invite_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 仅被邀请人本人可操作
    invite = crud.get_invite(db, invite_id)
    if not invite or invite.project_id != project_id:
        raise HTTPException(404, "邀请不存在")
    if invite.invitee_id != current_user.id:
        raise HTTPException(403, "仅被邀请人可操作")
    if invite.status != "PENDING":
        raise HTTPException(400, "邀请已处理")
    # 更新邀请状态
    crud.update_invite(db, invite_id, "REJECTED")
    # 通知邀请人
    project = crud.get_project(db, project_id)
    notify_project_invite_rejected(db, invite.inviter_id, current_user.username, project.name)
    return {"success": True}

# ========== 项目标签管理 ==========

@app.get("/api/project-tags", tags=["项目标签"])
def list_project_tags(
    db: Session = Depends(get_db)
):
    return crud.list_tags(db)

@app.post("/api/project-tags", tags=["项目标签"])
def create_project_tag(
    name: str = Body(...),
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN, models.UserRole.COMMUNITY_MANAGER])),
    db: Session = Depends(get_db)
):
    return crud.create_tag(db, name)

@app.delete("/api/project-tags/{tag_id}", tags=["项目标签"])
def delete_project_tag(
    tag_id: int,
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    # 仅管理员可删
    tag = db.get(models.ProjectTag, tag_id)
    if not tag:
        raise HTTPException(404, "标签不存在")
    db.delete(tag)
    db.commit()
    return {"success": True}

@app.post("/api/open-projects/{project_id}/tags/{tag_id}", tags=["项目标签"])
def add_tag_to_project(
    project_id: int,
    tag_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 仅管理员可操作
    member = crud.get_member(db, project_id, current_user.id)
    if not member or member.role != "ADMIN":
        raise HTTPException(403, "仅项目管理员可添加标签")
    crud.add_tag_to_project(db, project_id, tag_id)
    return {"success": True}

@app.delete("/api/open-projects/{project_id}/tags/{tag_id}", tags=["项目标签"])
def remove_tag_from_project(
    project_id: int,
    tag_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # 仅管理员可操作
    member = crud.get_member(db, project_id, current_user.id)
    if not member or member.role != "ADMIN":
        raise HTTPException(403, "仅项目管理员可移除标签")
    crud.remove_tag_from_project(db, project_id, tag_id)
    return {"success": True}

contribution_type_labels = {
    "bug_report": "Bug报告",
    "feature_request": "功能建议",
    "documentation": "文档完善",
    "code_contribution": "代码贡献",
    "critical_fix": "关键修复",
    "ui_ux_improvement": "UI/UX改进",
    "testing": "测试相关",
    "other": "其他"
}
