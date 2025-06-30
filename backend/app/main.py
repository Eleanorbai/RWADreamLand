from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session
from typing import List, Optional
import os

from .auth import router as auth_router, get_current_active_user, require_role
from .database import get_db, init_db
from .config import settings
from . import crud, models
from .utils import verify_password, get_password_hash
from pydantic import BaseModel

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
    allow_origins=settings.cors_origins if not settings.debug else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含认证路由
app.include_router(auth_router, tags=["认证"])

# 笔记相关路由
@app.post("/notes", response_model=models.NotePublic, tags=["笔记"])
def create_note(
    note: models.NoteCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.create_note(db=db, note=note, author_id=current_user.id)

@app.get("/notes", response_model=List[models.NotePublic], tags=["笔记"])
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

@app.get("/notes/my", response_model=List[models.NotePublic], tags=["笔记"])
def read_my_notes(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_notes_by_user(db, user_id=current_user.id, skip=skip, limit=limit)

@app.get("/notes/{note_id}", response_model=models.NotePublic, tags=["笔记"])
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

@app.put("/notes/{note_id}", response_model=models.NotePublic, tags=["笔记"])
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

@app.delete("/notes/{note_id}", tags=["笔记"])
def delete_note(
    note_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    success = crud.delete_note(db, note_id=note_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="笔记不存在或无权限删除")
    return {"message": "笔记已删除"}

@app.post("/notes/{note_id}/submit", response_model=models.ReviewRequestPublic, tags=["笔记", "审核"])
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
@app.get("/users", response_model=List[models.UserPublic], tags=["用户管理"])
def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    return crud.get_users(db, skip=skip, limit=limit)

@app.get("/users/{user_id}", response_model=models.UserPublic, tags=["用户管理"])
def read_user(
    user_id: int,
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="用户不存在")
    return db_user

@app.patch("/users/{user_id}/role", tags=["用户管理"])
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
@app.get("/tags", response_model=List[models.TagPublic], tags=["标签"])
def read_tags(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return crud.get_tags(db, skip=skip, limit=limit)

@app.post("/tags", response_model=models.TagPublic, tags=["标签"])
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
@app.get("/groups", response_model=List[models.GroupWithOwner], tags=["小组"])
def read_groups(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_groups(db, skip=skip, limit=limit)

@app.get("/groups/my", response_model=List[models.GroupWithOwner], tags=["小组"])
def read_my_groups(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_groups_by_user(db, user_id=current_user.id)

@app.post("/groups", response_model=models.GroupPublic, tags=["小组"])
def create_group(
    group: models.GroupCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.create_group(db=db, group=group, owner_id=current_user.id)

@app.get("/groups/{group_id}", response_model=models.GroupWithOwner, tags=["小组"])
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

@app.put("/groups/{group_id}", response_model=models.GroupPublic, tags=["小组"])
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

@app.delete("/groups/{group_id}", tags=["小组"])
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
@app.get("/groups/{group_id}/members", response_model=List[models.GroupMemberWithUser], tags=["小组成员"])
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

@app.post("/groups/{group_id}/join", response_model=models.GroupMemberPublic, tags=["小组成员"])
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

@app.delete("/groups/{group_id}/leave", tags=["小组成员"])
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
@app.get("/contents", response_model=List[models.ContentWithDetails], tags=["内容"])
def read_contents(
    skip: int = 0,
    limit: int = 100,
    content_type: Optional[models.ContentType] = None,
    db: Session = Depends(get_db)
):
    return crud.get_contents(db, skip=skip, limit=limit, content_type=content_type)

@app.get("/contents/my", response_model=List[models.ContentPublic], tags=["内容"])
def read_my_contents(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_contents_by_user(db, user_id=current_user.id, skip=skip, limit=limit)

@app.post("/contents", response_model=models.ContentPublic, tags=["内容"])
def create_content(
    content: models.ContentCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.create_content(db=db, content=content, author_id=current_user.id)

@app.get("/contents/{content_id}", response_model=models.ContentWithDetails, tags=["内容"])
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

@app.put("/contents/{content_id}", response_model=models.ContentPublic, tags=["内容"])
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

@app.post("/contents/{content_id}/publish", response_model=models.ContentPublic, tags=["内容"])
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

@app.delete("/contents/{content_id}", tags=["内容"])
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
@app.post("/contents/{content_id}/like", tags=["内容点赞"])
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

@app.get("/contents/{content_id}/like-status", tags=["内容点赞"])
def get_content_like_status(
    content_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    liked = crud.is_content_liked_by_user(db, content_id=content_id, user_id=current_user.id)
    return {"liked": liked}

# 内容标签相关路由
@app.post("/contents/{content_id}/tags/{tag_id}", tags=["内容标签"])
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

@app.delete("/contents/{content_id}/tags/{tag_id}", tags=["内容标签"])
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

@app.get("/contents/{content_id}/tags", response_model=List[models.TagPublic], tags=["内容标签"])
def get_content_tags(
    content_id: int,
    db: Session = Depends(get_db)
):
    return crud.get_content_tags(db, content_id=content_id)

# 讨论相关路由
@app.get("/discussions", response_model=List[models.DiscussionWithDetails], tags=["讨论"])
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

@app.post("/discussions", response_model=models.DiscussionPublic, tags=["讨论"])
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

@app.get("/discussions/{discussion_id}", response_model=models.DiscussionWithDetails, tags=["讨论"])
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

@app.put("/discussions/{discussion_id}", response_model=models.DiscussionPublic, tags=["讨论"])
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

@app.delete("/discussions/{discussion_id}", tags=["讨论"])
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
@app.get("/discussions/{discussion_id}/comments", response_model=List[models.CommentWithDetails], tags=["评论"])
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

@app.post("/comments", response_model=models.CommentPublic, tags=["评论"])
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

@app.put("/comments/{comment_id}", response_model=models.CommentPublic, tags=["评论"])
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

@app.delete("/comments/{comment_id}", tags=["评论"])
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
@app.get("/messages", response_model=List[models.MessageWithDetails], tags=["站内信"])
def read_messages(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_messages_for_user(db, user_id=current_user.id, skip=skip, limit=limit)

@app.post("/messages", response_model=models.MessagePublic, tags=["站内信"])
def create_message(
    message: models.MessageCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.create_message(db=db, message=message, sender_id=current_user.id)

@app.put("/messages/{message_id}/read", response_model=models.MessagePublic, tags=["站内信"])
def mark_message_read(
    message_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_message = crud.mark_message_read(db, message_id=message_id, user_id=current_user.id)
    if db_message is None:
        raise HTTPException(status_code=404, detail="消息不存在或无权限")
    return db_message

@app.get("/messages/unread-count", tags=["站内信"])
def get_unread_message_count(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    count = crud.get_unread_message_count(db, user_id=current_user.id)
    return {"unread_count": count}

# 区块链记录相关路由
@app.get("/blockchain-records", response_model=List[models.BlockchainRecordWithDetails], tags=["区块链记录"])
def read_blockchain_records(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_blockchain_records_by_user(db, user_id=current_user.id, skip=skip, limit=limit)

# 统计数据相关路由
@app.get("/stats", response_model=models.PlatformStats, tags=["统计"])
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

@app.put("/me/password", tags=["用户"])
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
