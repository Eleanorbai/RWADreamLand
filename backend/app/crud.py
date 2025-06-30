from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
from datetime import datetime
from . import models
from .utils import get_password_hash, verify_password

# 用户相关 CRUD 操作
def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.get(models.User, user_id)

def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    statement = select(models.User).where(models.User.username == username)
    return db.exec(statement).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    statement = select(models.User).where(models.User.email == email)
    return db.exec(statement).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    statement = select(models.User).offset(skip).limit(limit)
    return db.exec(statement).all()

def create_user(db: Session, user: models.UserCreate) -> models.User:
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: models.UserUpdate) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if db_user:
        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        db_user.updated_at = datetime.utcnow()
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    return db_user

def update_user_points(db: Session, user_id: int, points: int) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if db_user:
        db_user.points = points
        db_user.updated_at = datetime.utcnow()
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    return db_user

def add_user_points(db: Session, user_id: int, points: int) -> Optional[models.User]:
    db_user = get_user(db, user_id)
    if db_user:
        db_user.points += points
        db_user.updated_at = datetime.utcnow()
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    return db_user

# 笔记相关 CRUD 操作
def get_note(db: Session, note_id: int) -> Optional[models.Note]:
    return db.get(models.Note, note_id)

def get_notes_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[models.Note]:
    statement = select(models.Note).where(models.Note.author_id == user_id).offset(skip).limit(limit)
    return db.exec(statement).all()

def get_notes(db: Session, skip: int = 0, limit: int = 100) -> List[models.Note]:
    statement = select(models.Note).offset(skip).limit(limit)
    return db.exec(statement).all()

def create_note(db: Session, note: models.NoteCreate, author_id: int) -> models.Note:
    db_note = models.Note(
        title=note.title,
        content=note.content,
        author_id=author_id
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def update_note(db: Session, note_id: int, note_update: models.NoteUpdate, user_id: int) -> Optional[models.Note]:
    statement = select(models.Note).where(
        models.Note.id == note_id, 
        models.Note.author_id == user_id
    )
    db_note = db.exec(statement).first()
    if db_note:
        update_data = note_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_note, field, value)
        db_note.updated_at = datetime.utcnow()
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
    return db_note

def delete_note(db: Session, note_id: int, user_id: int) -> bool:
    statement = select(models.Note).where(
        models.Note.id == note_id, 
        models.Note.author_id == user_id
    )
    db_note = db.exec(statement).first()
    if db_note:
        db.delete(db_note)
        db.commit()
        return True
    return False

def submit_note_for_review(db: Session, note_id: int, user_id: int) -> Optional[models.Note]:
    statement = select(models.Note).where(
        models.Note.id == note_id, 
        models.Note.author_id == user_id
    )
    db_note = db.exec(statement).first()
    if db_note:
        db_note.is_submitted = True
        db_note.updated_at = datetime.utcnow()
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
    return db_note

# 审核请求相关 CRUD 操作
def create_review_request(db: Session, note_id: int, author_id: int) -> models.ReviewRequest:
    db_review_request = models.ReviewRequest(
        note_id=note_id,
        author_id=author_id
    )
    db.add(db_review_request)
    db.commit()
    db.refresh(db_review_request)
    return db_review_request

def get_review_request(db: Session, request_id: int) -> Optional[models.ReviewRequest]:
    return db.get(models.ReviewRequest, request_id)

def get_review_requests_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[models.ReviewRequest]:
    statement = select(models.ReviewRequest).where(
        models.ReviewRequest.author_id == user_id
    ).offset(skip).limit(limit)
    return db.exec(statement).all()

def get_pending_review_requests(db: Session, skip: int = 0, limit: int = 100) -> List[models.ReviewRequest]:
    statement = select(models.ReviewRequest).where(
        models.ReviewRequest.status == models.ReviewStatus.PENDING
    ).offset(skip).limit(limit)
    return db.exec(statement).all()

def get_review_requests_for_reviewer(db: Session, skip: int = 0, limit: int = 100) -> List[models.ReviewRequest]:
    statement = select(models.ReviewRequest).where(
        (models.ReviewRequest.status == models.ReviewStatus.PENDING) |
        (models.ReviewRequest.status == models.ReviewStatus.REVISION_REQUIRED)
    ).offset(skip).limit(limit)
    return db.exec(statement).all()

# 审核相关 CRUD 操作
def create_review(db: Session, review: models.ReviewCreate, reviewer_id: int) -> models.Review:
    db_review = models.Review(
        review_request_id=review.review_request_id,
        reviewer_id=reviewer_id,
        status=review.status,
        comment=review.comment
    )
    db.add(db_review)
    
    # 同时更新审核请求状态
    db_review_request = get_review_request(db, review.review_request_id)
    if db_review_request:
        db_review_request.status = review.status
        db_review_request.reviewed_at = datetime.utcnow()
        db_review_request.reviewer_id = reviewer_id
        db_review_request.review_comment = review.comment
        db.add(db_review_request)
    
    db.commit()
    db.refresh(db_review)
    return db_review

def get_reviews_by_reviewer(db: Session, reviewer_id: int, skip: int = 0, limit: int = 100) -> List[models.Review]:
    statement = select(models.Review).where(
        models.Review.reviewer_id == reviewer_id
    ).offset(skip).limit(limit)
    return db.exec(statement).all()

def get_reviews_for_request(db: Session, request_id: int) -> List[models.Review]:
    statement = select(models.Review).where(
        models.Review.review_request_id == request_id
    )
    return db.exec(statement).all()

# 标签相关 CRUD 操作
def get_tag(db: Session, tag_id: int) -> Optional[models.Tag]:
    return db.get(models.Tag, tag_id)

def get_tag_by_name(db: Session, name: str) -> Optional[models.Tag]:
    statement = select(models.Tag).where(models.Tag.name == name)
    return db.exec(statement).first()

def get_tags(db: Session, skip: int = 0, limit: int = 100) -> List[models.Tag]:
    statement = select(models.Tag).offset(skip).limit(limit)
    return db.exec(statement).all()

def create_tag(db: Session, tag: models.TagCreate) -> models.Tag:
    db_tag = models.Tag(**tag.model_dump())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def increment_tag_usage(db: Session, tag_id: int) -> Optional[models.Tag]:
    db_tag = get_tag(db, tag_id)
    if db_tag:
        db_tag.usage_count += 1
        db.add(db_tag)
        db.commit()
        db.refresh(db_tag)
    return db_tag

# 小组相关 CRUD 操作
def get_group(db: Session, group_id: int) -> Optional[models.Group]:
    return db.get(models.Group, group_id)

def get_groups(db: Session, skip: int = 0, limit: int = 100) -> List[models.Group]:
    statement = select(models.Group).where(models.Group.is_public == True).offset(skip).limit(limit)
    return db.exec(statement).all()

def get_groups_by_user(db: Session, user_id: int) -> List[models.Group]:
    statement = select(models.Group).join(models.GroupMember).where(
        models.GroupMember.user_id == user_id
    )
    return db.exec(statement).all()

def create_group(db: Session, group: models.GroupCreate, owner_id: int) -> models.Group:
    db_group = models.Group(
        **group.model_dump(),
        owner_id=owner_id
    )
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    
    # 自动将创建者加入小组
    add_group_member(db, db_group.id, owner_id, models.GroupRole.OWNER)
    
    return db_group

def update_group(db: Session, group_id: int, group_update: models.GroupUpdate, user_id: int) -> Optional[models.Group]:
    db_group = get_group(db, group_id)
    if db_group and (db_group.owner_id == user_id or is_group_admin(db, group_id, user_id)):
        update_data = group_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_group, field, value)
        db_group.updated_at = datetime.utcnow()
        db.add(db_group)
        db.commit()
        db.refresh(db_group)
    return db_group

def delete_group(db: Session, group_id: int, user_id: int) -> bool:
    db_group = get_group(db, group_id)
    if db_group and db_group.owner_id == user_id:
        db.delete(db_group)
        db.commit()
        return True
    return False

# 小组成员相关 CRUD 操作
def get_group_member(db: Session, group_id: int, user_id: int) -> Optional[models.GroupMember]:
    statement = select(models.GroupMember).where(
        models.GroupMember.group_id == group_id,
        models.GroupMember.user_id == user_id
    )
    return db.exec(statement).first()

def get_group_members(db: Session, group_id: int) -> List[models.GroupMember]:
    statement = select(models.GroupMember).where(models.GroupMember.group_id == group_id)
    return db.exec(statement).all()

def add_group_member(db: Session, group_id: int, user_id: int, role: models.GroupRole = models.GroupRole.MEMBER) -> Optional[models.GroupMember]:
    # 检查是否已经是成员
    if get_group_member(db, group_id, user_id):
        return None
    
    db_member = models.GroupMember(
        group_id=group_id,
        user_id=user_id,
        role=role
    )
    db.add(db_member)
    
    # 更新小组成员数量
    db_group = get_group(db, group_id)
    if db_group:
        db_group.member_count += 1
        db.add(db_group)
    
    db.commit()
    db.refresh(db_member)
    return db_member

def remove_group_member(db: Session, group_id: int, user_id: int) -> bool:
    db_member = get_group_member(db, group_id, user_id)
    if db_member:
        db.delete(db_member)
        
        # 更新小组成员数量
        db_group = get_group(db, group_id)
        if db_group:
            db_group.member_count -= 1
            db.add(db_group)
        
        db.commit()
        return True
    return False

def is_group_member(db: Session, group_id: int, user_id: int) -> bool:
    return get_group_member(db, group_id, user_id) is not None

def is_group_admin(db: Session, group_id: int, user_id: int) -> bool:
    member = get_group_member(db, group_id, user_id)
    return member and member.role in [models.GroupRole.ADMIN, models.GroupRole.OWNER]

# 内容相关 CRUD 操作
def get_content(db: Session, content_id: int) -> Optional[models.Content]:
    return db.get(models.Content, content_id)

def get_contents(db: Session, skip: int = 0, limit: int = 100, content_type: Optional[models.ContentType] = None) -> List[models.Content]:
    statement = select(models.Content).where(models.Content.status == models.ContentStatus.PUBLISHED)
    if content_type:
        statement = statement.where(models.Content.content_type == content_type)
    statement = statement.offset(skip).limit(limit).order_by(models.Content.published_at.desc())
    return db.exec(statement).all()

def get_contents_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[models.Content]:
    statement = select(models.Content).where(models.Content.author_id == user_id).offset(skip).limit(limit)
    return db.exec(statement).all()

def create_content(db: Session, content: models.ContentCreate, author_id: int) -> models.Content:
    db_content = models.Content(
        **content.model_dump(),
        author_id=author_id
    )
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content

def publish_content(db: Session, content_id: int, user_id: int) -> Optional[models.Content]:
    statement = select(models.Content).where(
        models.Content.id == content_id,
        models.Content.author_id == user_id
    )
    db_content = db.exec(statement).first()
    if db_content:
        db_content.status = models.ContentStatus.PUBLISHED
        db_content.published_at = datetime.utcnow()
        db_content.updated_at = datetime.utcnow()
        db.add(db_content)
        db.commit()
        db.refresh(db_content)
    return db_content

def update_content(db: Session, content_id: int, content_update: models.ContentUpdate, user_id: int) -> Optional[models.Content]:
    statement = select(models.Content).where(
        models.Content.id == content_id,
        models.Content.author_id == user_id
    )
    db_content = db.exec(statement).first()
    if db_content:
        update_data = content_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_content, field, value)
        db_content.updated_at = datetime.utcnow()
        db.add(db_content)
        db.commit()
        db.refresh(db_content)
    return db_content

def delete_content(db: Session, content_id: int, user_id: int) -> bool:
    statement = select(models.Content).where(
        models.Content.id == content_id,
        models.Content.author_id == user_id
    )
    db_content = db.exec(statement).first()
    if db_content:
        db.delete(db_content)
        db.commit()
        return True
    return False

def increment_content_view(db: Session, content_id: int, user_id: Optional[int] = None, ip_address: Optional[str] = None) -> None:
    # 记录浏览记录
    db_view = models.ContentView(
        content_id=content_id,
        user_id=user_id,
        ip_address=ip_address
    )
    db.add(db_view)
    
    # 更新内容浏览次数
    db_content = get_content(db, content_id)
    if db_content:
        db_content.view_count += 1
        db.add(db_content)
    
    db.commit()

# 内容点赞相关 CRUD 操作
def toggle_content_like(db: Session, content_id: int, user_id: int) -> bool:
    """切换点赞状态，返回True表示点赞，False表示取消点赞"""
    statement = select(models.ContentLike).where(
        models.ContentLike.content_id == content_id,
        models.ContentLike.user_id == user_id
    )
    existing_like = db.exec(statement).first()
    
    if existing_like:
        # 取消点赞
        db.delete(existing_like)
        # 更新内容点赞数
        db_content = get_content(db, content_id)
        if db_content:
            db_content.like_count -= 1
            db.add(db_content)
        db.commit()
        return False
    else:
        # 添加点赞
        db_like = models.ContentLike(
            content_id=content_id,
            user_id=user_id
        )
        db.add(db_like)
        # 更新内容点赞数
        db_content = get_content(db, content_id)
        if db_content:
            db_content.like_count += 1
            db.add(db_content)
        db.commit()
        return True

def is_content_liked_by_user(db: Session, content_id: int, user_id: int) -> bool:
    statement = select(models.ContentLike).where(
        models.ContentLike.content_id == content_id,
        models.ContentLike.user_id == user_id
    )
    return db.exec(statement).first() is not None

# 内容标签相关 CRUD 操作
def add_content_tag(db: Session, content_id: int, tag_id: int) -> Optional[models.ContentTag]:
    # 检查是否已经存在
    statement = select(models.ContentTag).where(
        models.ContentTag.content_id == content_id,
        models.ContentTag.tag_id == tag_id
    )
    if db.exec(statement).first():
        return None
    
    db_content_tag = models.ContentTag(
        content_id=content_id,
        tag_id=tag_id
    )
    db.add(db_content_tag)
    
    # 增加标签使用次数
    increment_tag_usage(db, tag_id)
    
    db.commit()
    db.refresh(db_content_tag)
    return db_content_tag

def remove_content_tag(db: Session, content_id: int, tag_id: int) -> bool:
    statement = select(models.ContentTag).where(
        models.ContentTag.content_id == content_id,
        models.ContentTag.tag_id == tag_id
    )
    db_content_tag = db.exec(statement).first()
    if db_content_tag:
        db.delete(db_content_tag)
        db.commit()
        return True
    return False

def get_content_tags(db: Session, content_id: int) -> List[models.Tag]:
    statement = select(models.Tag).join(models.ContentTag).where(
        models.ContentTag.content_id == content_id
    )
    return db.exec(statement).all()

# 讨论相关 CRUD 操作
def get_discussion(db: Session, discussion_id: int) -> Optional[models.Discussion]:
    return db.get(models.Discussion, discussion_id)

def get_discussions(db: Session, content_id: Optional[int] = None, group_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[models.Discussion]:
    statement = select(models.Discussion)
    if content_id:
        statement = statement.where(models.Discussion.content_id == content_id)
    elif group_id:
        statement = statement.where(models.Discussion.group_id == group_id)
    else:
        statement = statement.where(models.Discussion.discussion_type == models.DiscussionType.SQUARE)
    
    statement = statement.offset(skip).limit(limit).order_by(models.Discussion.is_pinned.desc(), models.Discussion.created_at.desc())
    return db.exec(statement).all()

def create_discussion(db: Session, discussion: models.DiscussionCreate, author_id: int) -> models.Discussion:
    db_discussion = models.Discussion(
        **discussion.model_dump(),
        author_id=author_id
    )
    db.add(db_discussion)
    db.commit()
    db.refresh(db_discussion)
    return db_discussion

def update_discussion(db: Session, discussion_id: int, discussion_update: models.DiscussionUpdate, user_id: int) -> Optional[models.Discussion]:
    statement = select(models.Discussion).where(
        models.Discussion.id == discussion_id,
        models.Discussion.author_id == user_id
    )
    db_discussion = db.exec(statement).first()
    if db_discussion:
        update_data = discussion_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_discussion, field, value)
        db_discussion.updated_at = datetime.utcnow()
        db.add(db_discussion)
        db.commit()
        db.refresh(db_discussion)
    return db_discussion

def delete_discussion(db: Session, discussion_id: int, user_id: int) -> bool:
    statement = select(models.Discussion).where(
        models.Discussion.id == discussion_id,
        models.Discussion.author_id == user_id
    )
    db_discussion = db.exec(statement).first()
    if db_discussion:
        db.delete(db_discussion)
        db.commit()
        return True
    return False

# 评论相关 CRUD 操作
def get_comment(db: Session, comment_id: int) -> Optional[models.Comment]:
    return db.get(models.Comment, comment_id)

def get_comments(db: Session, discussion_id: int, skip: int = 0, limit: int = 100) -> List[models.Comment]:
    statement = select(models.Comment).where(
        models.Comment.discussion_id == discussion_id,
        models.Comment.parent_id == None  # 只获取顶级评论
    ).offset(skip).limit(limit).order_by(models.Comment.created_at.asc())
    return db.exec(statement).all()

def create_comment(db: Session, comment: models.CommentCreate, author_id: int) -> models.Comment:
    db_comment = models.Comment(
        **comment.model_dump(),
        author_id=author_id
    )
    db.add(db_comment)
    
    # 更新讨论回复数量
    db_discussion = get_discussion(db, comment.discussion_id)
    if db_discussion:
        db_discussion.reply_count += 1
        db.add(db_discussion)
    
    db.commit()
    db.refresh(db_comment)
    return db_comment

def update_comment(db: Session, comment_id: int, comment_update: models.CommentUpdate, user_id: int) -> Optional[models.Comment]:
    statement = select(models.Comment).where(
        models.Comment.id == comment_id,
        models.Comment.author_id == user_id
    )
    db_comment = db.exec(statement).first()
    if db_comment:
        update_data = comment_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_comment, field, value)
        db_comment.updated_at = datetime.utcnow()
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
    return db_comment

def delete_comment(db: Session, comment_id: int, user_id: int) -> bool:
    statement = select(models.Comment).where(
        models.Comment.id == comment_id,
        models.Comment.author_id == user_id
    )
    db_comment = db.exec(statement).first()
    if db_comment:
        db.delete(db_comment)
        
        # 更新讨论回复数量
        db_discussion = get_discussion(db, db_comment.discussion_id)
        if db_discussion:
            db_discussion.reply_count -= 1
            db.add(db_discussion)
        
        db.commit()
        return True
    return False

# 站内信相关 CRUD 操作
def get_message(db: Session, message_id: int) -> Optional[models.Message]:
    return db.get(models.Message, message_id)

def get_messages_for_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[models.Message]:
    statement = select(models.Message).where(
        models.Message.receiver_id == user_id
    ).offset(skip).limit(limit).order_by(models.Message.created_at.desc())
    return db.exec(statement).all()

def create_message(db: Session, message: models.MessageCreate, sender_id: Optional[int] = None) -> models.Message:
    db_message = models.Message(
        **message.model_dump(),
        sender_id=sender_id
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def mark_message_read(db: Session, message_id: int, user_id: int) -> Optional[models.Message]:
    statement = select(models.Message).where(
        models.Message.id == message_id,
        models.Message.receiver_id == user_id
    )
    db_message = db.exec(statement).first()
    if db_message:
        db_message.is_read = True
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
    return db_message

def get_unread_message_count(db: Session, user_id: int) -> int:
    statement = select(models.Message).where(
        models.Message.receiver_id == user_id,
        models.Message.is_read == False
    )
    return len(db.exec(statement).all())

# 区块链记录相关 CRUD 操作
def create_blockchain_record(db: Session, record: models.BlockchainRecordCreate, user_id: int) -> models.BlockchainRecord:
    db_record = models.BlockchainRecord(
        **record.model_dump(),
        user_id=user_id
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def get_blockchain_records_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[models.BlockchainRecord]:
    statement = select(models.BlockchainRecord).where(
        models.BlockchainRecord.user_id == user_id
    ).offset(skip).limit(limit).order_by(models.BlockchainRecord.created_at.desc())
    return db.exec(statement).all()

def update_blockchain_record_confirmation(db: Session, record_id: int, transaction_hash: str, block_number: int, gas_used: int) -> Optional[models.BlockchainRecord]:
    db_record = db.get(models.BlockchainRecord, record_id)
    if db_record:
        db_record.transaction_hash = transaction_hash
        db_record.block_number = block_number
        db_record.gas_used = gas_used
        db_record.is_confirmed = True
        db_record.confirmed_at = datetime.utcnow()
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
    return db_record

# RWA星球共创项目 CRUD 操作

# 开源项目相关操作
def create_open_project(db: Session, project: models.OpenProjectCreate) -> models.OpenProject:
    db_project = models.OpenProject(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

def get_open_project(db: Session, project_id: int) -> Optional[models.OpenProject]:
    return db.get(models.OpenProject, project_id)

def get_open_project_by_repo(db: Session, github_repo: str) -> Optional[models.OpenProject]:
    statement = select(models.OpenProject).where(models.OpenProject.github_repo == github_repo)
    return db.exec(statement).first()

def get_open_projects(db: Session, skip: int = 0, limit: int = 100, is_active: Optional[bool] = None) -> List[models.OpenProject]:
    statement = select(models.OpenProject)
    if is_active is not None:
        statement = statement.where(models.OpenProject.is_active == is_active)
    statement = statement.offset(skip).limit(limit).order_by(models.OpenProject.created_at.desc())
    return db.exec(statement).all()

def update_open_project(db: Session, project_id: int, project_update: models.OpenProjectUpdate) -> Optional[models.OpenProject]:
    db_project = db.get(models.OpenProject, project_id)
    if db_project:
        update_data = project_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_project, field, value)
        db_project.updated_at = datetime.utcnow()
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
    return db_project

def delete_open_project(db: Session, project_id: int) -> bool:
    db_project = db.get(models.OpenProject, project_id)
    if db_project:
        db.delete(db_project)
        db.commit()
        return True
    return False

# GitHub贡献记录相关操作
def create_github_contribution(db: Session, contribution: models.GitHubContributionCreate) -> models.GitHubContribution:
    db_contribution = models.GitHubContribution(**contribution.model_dump())
    db.add(db_contribution)
    db.commit()
    db.refresh(db_contribution)
    return db_contribution

def get_github_contribution(db: Session, contribution_id: int) -> Optional[models.GitHubContribution]:
    return db.get(models.GitHubContribution, contribution_id)

def get_github_contribution_by_issue(db: Session, project_id: int, issue_number: int) -> Optional[models.GitHubContribution]:
    statement = select(models.GitHubContribution).where(
        models.GitHubContribution.project_id == project_id,
        models.GitHubContribution.issue_number == issue_number
    )
    return db.exec(statement).first()

def get_github_contributions(db: Session, project_id: Optional[int] = None, user_id: Optional[int] = None, 
                           status: Optional[models.ContributionStatus] = None, skip: int = 0, limit: int = 100) -> List[models.GitHubContribution]:
    statement = select(models.GitHubContribution)
    if project_id:
        statement = statement.where(models.GitHubContribution.project_id == project_id)
    if user_id:
        statement = statement.where(models.GitHubContribution.user_id == user_id)
    if status:
        statement = statement.where(models.GitHubContribution.status == status)
    statement = statement.offset(skip).limit(limit).order_by(models.GitHubContribution.created_at.desc())
    return db.exec(statement).all()

def update_github_contribution(db: Session, contribution_id: int, contribution_update: models.GitHubContributionUpdate) -> Optional[models.GitHubContribution]:
    db_contribution = db.get(models.GitHubContribution, contribution_id)
    if db_contribution:
        update_data = contribution_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_contribution, field, value)
        db_contribution.updated_at = datetime.utcnow()
        db.add(db_contribution)
        db.commit()
        db.refresh(db_contribution)
    return db_contribution

def accept_github_contribution(db: Session, contribution_id: int, user_id: Optional[int] = None) -> Optional[models.GitHubContribution]:
    """接受GitHub贡献，更新状态并分配积分"""
    db_contribution = db.get(models.GitHubContribution, contribution_id)
    if db_contribution and db_contribution.status == models.ContributionStatus.PENDING:
        db_contribution.status = models.ContributionStatus.ACCEPTED
        db_contribution.accepted_at = datetime.utcnow()
        
        if user_id:
            db_contribution.user_id = user_id
            # 给用户加积分
            add_user_points(db, user_id, db_contribution.contribution_points)
            
            # 更新贡献者资料
            update_contributor_stats(db, user_id, db_contribution.contribution_points)
        
        db.add(db_contribution)
        db.commit()
        db.refresh(db_contribution)
    return db_contribution

def reject_github_contribution(db: Session, contribution_id: int, reason: Optional[str] = None) -> Optional[models.GitHubContribution]:
    """拒绝GitHub贡献"""
    db_contribution = db.get(models.GitHubContribution, contribution_id)
    if db_contribution and db_contribution.status == models.ContributionStatus.PENDING:
        db_contribution.status = models.ContributionStatus.REJECTED
        # 可以添加拒绝原因字段到模型中
        db.add(db_contribution)
        db.commit()
        db.refresh(db_contribution)
    return db_contribution

def get_github_contributions_list(
    db: Session,
    project_id: Optional[int] = None,
    status: Optional[models.ContributionStatus] = None,
    github_username: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.GitHubContribution]:
    """获取GitHub贡献列表"""
    query = db.query(models.GitHubContribution)
    
    if project_id:
        query = query.filter(models.GitHubContribution.project_id == project_id)
    if status:
        query = query.filter(models.GitHubContribution.status == status)
    if github_username:
        query = query.filter(models.GitHubContribution.github_username.ilike(f"%{github_username}%"))
    
    return query.order_by(models.GitHubContribution.created_at.desc()).offset(skip).limit(limit).all()

def get_github_contributions_stats(db: Session) -> Dict[str, Any]:
    """获取GitHub贡献统计"""
    total_contributions = db.query(models.GitHubContribution).count()
    pending_contributions = db.query(models.GitHubContribution).filter(
        models.GitHubContribution.status == models.ContributionStatus.PENDING
    ).count()
    accepted_contributions = db.query(models.GitHubContribution).filter(
        models.GitHubContribution.status == models.ContributionStatus.ACCEPTED
    ).count()
    rejected_contributions = db.query(models.GitHubContribution).filter(
        models.GitHubContribution.status == models.ContributionStatus.REJECTED
    ).count()
    
    total_points = db.query(
        db.func.sum(models.GitHubContribution.contribution_points)
    ).filter(
        models.GitHubContribution.status == models.ContributionStatus.ACCEPTED
    ).scalar() or 0
    
    on_chain_contributions = db.query(models.GitHubContribution).filter(
        models.GitHubContribution.blockchain_hash.isnot(None)
    ).count()
    
    return {
        "total_contributions": total_contributions,
        "pending_contributions": pending_contributions,
        "accepted_contributions": accepted_contributions,
        "rejected_contributions": rejected_contributions,
        "total_points": total_points,
        "on_chain_contributions": on_chain_contributions,
        "acceptance_rate": round(accepted_contributions / total_contributions * 100, 2) if total_contributions > 0 else 0,
        "on_chain_rate": round(on_chain_contributions / accepted_contributions * 100, 2) if accepted_contributions > 0 else 0
    }

# 贡献者资料相关操作
def create_contributor_profile(db: Session, user_id: int, profile: models.ContributorProfileCreate) -> models.ContributorProfile:
    db_profile = models.ContributorProfile(**profile.model_dump(), user_id=user_id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def get_contributor_profile(db: Session, user_id: int) -> Optional[models.ContributorProfile]:
    statement = select(models.ContributorProfile).where(models.ContributorProfile.user_id == user_id)
    return db.exec(statement).first()

def get_contributor_profile_by_github(db: Session, github_username: str) -> Optional[models.ContributorProfile]:
    statement = select(models.ContributorProfile).where(models.ContributorProfile.github_username == github_username)
    return db.exec(statement).first()

def update_contributor_profile(db: Session, user_id: int, profile_update: models.ContributorProfileUpdate) -> Optional[models.ContributorProfile]:
    db_profile = get_contributor_profile(db, user_id)
    if db_profile:
        update_data = profile_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_profile, field, value)
        db_profile.updated_at = datetime.utcnow()
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
    return db_profile

def update_contributor_stats(db: Session, user_id: int, points: int) -> Optional[models.ContributorProfile]:
    """更新贡献者统计信息"""
    db_profile = get_contributor_profile(db, user_id)
    if db_profile:
        db_profile.total_contributions += 1
        db_profile.total_points += points
        # 简单的声誉计算：总积分 * 0.6 + 贡献数量 * 0.4
        db_profile.reputation_score = db_profile.total_points * 0.6 + db_profile.total_contributions * 0.4
        db_profile.updated_at = datetime.utcnow()
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
    return db_profile

def get_contributor_rankings(db: Session, limit: int = 50) -> List[models.ContributorRanking]:
    """获取贡献者排行榜"""
    statement = select(models.ContributorProfile).order_by(
        models.ContributorProfile.reputation_score.desc(),
        models.ContributorProfile.total_points.desc()
    ).limit(limit)
    
    profiles = db.exec(statement).all()
    rankings = []
    for rank, profile in enumerate(profiles, 1):
        ranking = models.ContributorRanking(
            user_id=profile.user_id,
            github_username=profile.github_username,
            total_points=profile.total_points,
            total_contributions=profile.total_contributions,
            reputation_score=profile.reputation_score,
            rank=rank
        )
        rankings.append(ranking)
    
    return rankings

def get_project_stats(db: Session, project_id: int) -> Optional[models.ProjectStats]:
    """获取项目统计信息"""
    project = get_open_project(db, project_id)
    if not project:
        return None
    
    # 获取项目所有贡献
    contributions = get_github_contributions(db, project_id=project_id, limit=10000)
    
    total_contributions = len(contributions)
    total_points = sum(c.contribution_points for c in contributions)
    
    # 统计贡献者数量
    contributors = set(c.user_id for c in contributions if c.user_id)
    total_contributors = len(contributors)
    
    # 统计各类型贡献
    contribution_types = {}
    for contribution in contributions:
        contrib_type = contribution.contribution_type.value
        if contrib_type not in contribution_types:
            contribution_types[contrib_type] = 0
        contribution_types[contrib_type] += 1
    
    # 获取顶级贡献者
    top_contributors = []
    if contributors:
        contrib_stats = {}
        for contribution in contributions:
            if contribution.user_id:
                if contribution.user_id not in contrib_stats:
                    contrib_stats[contribution.user_id] = {"points": 0, "count": 0}
                contrib_stats[contribution.user_id]["points"] += contribution.contribution_points
                contrib_stats[contribution.user_id]["count"] += 1
        
        # 排序并取前10
        sorted_contributors = sorted(contrib_stats.items(), key=lambda x: x[1]["points"], reverse=True)[:10]
        for user_id, stats in sorted_contributors:
            profile = get_contributor_profile(db, user_id)
            top_contributors.append({
                "user_id": user_id,
                "github_username": profile.github_username if profile else "Unknown",
                "points": stats["points"],
                "contributions": stats["count"]
            })
    
    return models.ProjectStats(
        project_id=project_id,
        total_contributions=total_contributions,
        total_contributors=total_contributors,
        total_points=total_points,
        contribution_types=contribution_types,
        top_contributors=top_contributors
    )
