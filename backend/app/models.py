from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    REVIEWER = "reviewer"
    COMMUNITY_MANAGER = "community_manager"
    ADMIN = "admin"

class ReviewStatus(str, Enum):
    PENDING = "pending"  # 待审核
    APPROVED = "approved"  # 已通过
    REJECTED = "rejected"  # 已拒绝
    REVISION_REQUIRED = "revision_required"  # 需要修改

class GroupRole(str, Enum):
    MEMBER = "group_member"
    LEADER = "group_leader"

class ContentType(str, Enum):
    CASE_STUDY = "case_study"  # 案例
    STUDY_NOTES = "study_notes"  # 学习笔记
    BUSINESS_MODEL = "business_model"  # 商业模型草图

class ContentStatus(str, Enum):
    DRAFT = "draft"  # 草稿
    PUBLISHED = "published"  # 已发布到广场
    ARCHIVED = "archived"  # 已归档

class DiscussionType(str, Enum):
    SQUARE = "square"  # 广场讨论
    GROUP = "group"  # 小组讨论

class BlockchainAction(str, Enum):
    POINTS_REWARD = "points_reward"
    CONTENT_PUBLISH = "content_publish"
    CONTRIBUTION_RECORD = "contribution_record"

# 用户模型
class UserBase(SQLModel):
    username: str = Field(index=True, unique=True, max_length=50)
    full_name: Optional[str] = Field(default=None, max_length=100)
    email: Optional[str] = Field(default=None, index=True, unique=True, max_length=100)
    avatar_url: Optional[str] = Field(default=None, max_length=255)
    points: int = Field(default=0)
    role: UserRole = Field(default=UserRole.USER)
    is_active: bool = Field(default=True)

class User(UserBase, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 关联关系
    notes: List["Note"] = Relationship(back_populates="author")
    review_requests: List["ReviewRequest"] = Relationship(
        back_populates="author", 
        sa_relationship_kwargs={"foreign_keys": "ReviewRequest.author_id"}
    )
    reviews: List["Review"] = Relationship(back_populates="reviewer")
    
    # 新增关联关系
    contents: List["Content"] = Relationship(back_populates="author")
    owned_groups: List["Group"] = Relationship()
    group_memberships: List["GroupMember"] = Relationship()
    discussions: List["Discussion"] = Relationship(back_populates="author")
    comments: List["Comment"] = Relationship(back_populates="author")
    likes: List["ContentLike"] = Relationship()
    views: List["ContentView"] = Relationship()
    sent_messages: List["Message"] = Relationship(
        back_populates="sender",
        sa_relationship_kwargs={"foreign_keys": "[Message.sender_id]"}
    )
    received_messages: List["Message"] = Relationship(
        back_populates="receiver",
        sa_relationship_kwargs={"foreign_keys": "[Message.receiver_id]"}
    )
    blockchain_records: List["BlockchainRecord"] = Relationship(back_populates="user")

# 用户创建模型
class UserCreate(UserBase):
    password: str

# 用户更新模型
class UserUpdate(SQLModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None

# 用户公开信息（不包含敏感信息）
class UserPublic(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

# 笔记模型
class NoteBase(SQLModel):
    title: str = Field(max_length=200)
    content: str

class Note(NoteBase, table=True):
    __tablename__ = "notes"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="users.id")
    is_submitted: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 关联关系
    author: Optional[User] = Relationship(back_populates="notes")
    review_requests: List["ReviewRequest"] = Relationship(back_populates="note")
    contents: List["Content"] = Relationship(back_populates="note")

# 笔记创建模型
class NoteCreate(NoteBase):
    pass

# 笔记更新模型
class NoteUpdate(SQLModel):
    title: Optional[str] = None
    content: Optional[str] = None

# 笔记公开信息（包含作者信息）
class NotePublic(NoteBase):
    id: int
    author_id: int
    is_submitted: bool
    created_at: datetime
    updated_at: datetime

class NoteWithAuthor(NotePublic):
    author: Optional[UserPublic] = None

# 审核请求模型
class ReviewRequestBase(SQLModel):
    note_id: int = Field(foreign_key="notes.id")
    status: ReviewStatus = Field(default=ReviewStatus.PENDING)

class ReviewRequest(ReviewRequestBase, table=True):
    __tablename__ = "review_requests"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="users.id")
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    reviewer_id: Optional[int] = Field(default=None, foreign_key="users.id")
    review_comment: Optional[str] = None
    
    # 关联关系
    note: Optional[Note] = Relationship(back_populates="review_requests")
    author: Optional[User] = Relationship(
        back_populates="review_requests",
        sa_relationship_kwargs={"foreign_keys": "ReviewRequest.author_id"}
    )
    reviews: List["Review"] = Relationship(back_populates="review_request")

# 审核请求创建模型
class ReviewRequestCreate(SQLModel):
    note_id: int

# 审核请求公开信息
class ReviewRequestPublic(ReviewRequestBase):
    id: int
    author_id: int
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewer_id: Optional[int] = None
    review_comment: Optional[str] = None

class ReviewRequestWithDetails(ReviewRequestPublic):
    note: Optional[NotePublic] = None
    author: Optional[UserPublic] = None
    reviewer: Optional[UserPublic] = None

# 审核模型
class ReviewBase(SQLModel):
    status: ReviewStatus
    comment: Optional[str] = None

class Review(ReviewBase, table=True):
    __tablename__ = "reviews"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    review_request_id: int = Field(foreign_key="review_requests.id")
    reviewer_id: int = Field(foreign_key="users.id")
    reviewed_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 关联关系
    review_request: Optional[ReviewRequest] = Relationship(back_populates="reviews")
    reviewer: Optional[User] = Relationship(back_populates="reviews")

# 审核创建模型
class ReviewCreate(ReviewBase):
    review_request_id: int

# 审核公开信息
class ReviewPublic(ReviewBase):
    id: int
    review_request_id: int
    reviewer_id: int
    reviewed_at: datetime

class ReviewWithDetails(ReviewPublic):
    reviewer: Optional[UserPublic] = None
    review_request: Optional[ReviewRequestPublic] = None

# 响应模型
class MessageResponse(SQLModel):
    message: str

class UploadResponse(SQLModel):
    filename: str
    url: str

# 小组模型
class GroupBase(SQLModel):
    name: str = Field(max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    is_public: bool = Field(default=True)  # 是否公开
    max_members: Optional[int] = Field(default=None)  # 最大成员数，None表示无限制

class Group(GroupBase, table=True):
    __tablename__ = "groups"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    member_count: int = Field(default=1)  # 成员数量
    
    # 关联关系
    owner: Optional[User] = Relationship()
    members: List["GroupMember"] = Relationship(back_populates="group")
    discussions: List["Discussion"] = Relationship(back_populates="group")

class GroupCreate(GroupBase):
    pass

class GroupUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    max_members: Optional[int] = None

class GroupPublic(GroupBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    member_count: int

class GroupWithOwner(GroupPublic):
    owner: Optional[UserPublic] = None

# 小组成员模型
class GroupMemberBase(SQLModel):
    role: GroupRole = Field(default=GroupRole.MEMBER)

class GroupMember(GroupMemberBase, table=True):
    __tablename__ = "group_members"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(foreign_key="groups.id")
    user_id: int = Field(foreign_key="users.id")
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 关联关系
    group: Optional[Group] = Relationship(back_populates="members")
    user: Optional[User] = Relationship()
    role: GroupRole = Field(default=GroupRole.MEMBER)

class GroupMemberCreate(SQLModel):
    group_id: int
    role: GroupRole = GroupRole.MEMBER

class GroupMemberPublic(GroupMemberBase):
    id: int
    group_id: int
    user_id: int
    joined_at: datetime

class GroupMemberWithUser(GroupMemberPublic):
    user: Optional[UserPublic] = None

# 认证相关模型
class Token(SQLModel):
    access_token: str
    token_type: str

class TagBase(SQLModel):
    name: str = Field(max_length=50, unique=True, index=True)
    description: Optional[str] = Field(default=None, max_length=200)
    color: Optional[str] = Field(default="#3B82F6", max_length=7)  # 默认蓝色

class Tag(TagBase, table=True):
    __tablename__ = "tags"
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    usage_count: int = Field(default=0)  # 使用次数
    content_tags: List["ContentTag"] = Relationship(back_populates="tag")

class TagCreate(TagBase):
    pass

class TagPublic(TagBase):
    id: int
    created_at: datetime
    usage_count: int

# 内容模型
class ContentBase(SQLModel):
    title: str = Field(max_length=200)
    content: str
    content_type: ContentType = Field(default=ContentType.STUDY_NOTES)
    description: Optional[str] = Field(default=None, max_length=300)
    note_id: Optional[int] = None

class Content(ContentBase, table=True):
    __tablename__ = "contents"
    id: Optional[int] = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="users.id")
    note_id: Optional[int] = Field(default=None, foreign_key="notes.id")
    status: ContentStatus = Field(default=ContentStatus.DRAFT)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None
    view_count: int = Field(default=0)
    like_count: int = Field(default=0)

    # 关联关系
    author: Optional[User] = Relationship(back_populates="contents")
    note: Optional[Note] = Relationship(back_populates="contents")
    tags: List["ContentTag"] = Relationship(back_populates="content")
    likes: List["ContentLike"] = Relationship(back_populates="content")
    views: List["ContentView"] = Relationship(back_populates="content")
    discussions: List["Discussion"] = Relationship(back_populates="content")

class ContentCreate(ContentBase):
    note_id: Optional[int] = None

class ContentUpdate(SQLModel):
    title: Optional[str] = None
    content: Optional[str] = None
    content_type: Optional[ContentType] = None
    description: Optional[str] = None
    note_id: Optional[int] = None

class ContentPublic(ContentBase):
    id: int
    author_id: int
    note_id: Optional[int] = None
    status: ContentStatus
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    view_count: int
    like_count: int

# 内容标签关联
class ContentTagBase(SQLModel):
    pass

class ContentTag(ContentTagBase, table=True):
    __tablename__ = "content_tags"
    id: Optional[int] = Field(default=None, primary_key=True)
    content_id: int = Field(foreign_key="contents.id")
    tag_id: int = Field(foreign_key="tags.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # 关联关系
    content: Optional[Content] = Relationship(back_populates="tags")
    tag: Optional[Tag] = Relationship(back_populates="content_tags")

class ContentTagCreate(SQLModel):
    content_id: int
    tag_id: int

class ContentTagPublic(ContentTagBase):
    id: int
    content_id: int
    tag_id: int
    created_at: datetime

# 内容点赞
class ContentLikeBase(SQLModel):
    pass

class ContentLike(ContentLikeBase, table=True):
    __tablename__ = "content_likes"
    id: Optional[int] = Field(default=None, primary_key=True)
    content_id: int = Field(foreign_key="contents.id")
    user_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # 关联关系
    content: Optional[Content] = Relationship(back_populates="likes")
    user: Optional[User] = Relationship()

class ContentLikeCreate(SQLModel):
    content_id: int

class ContentLikePublic(ContentLikeBase):
    id: int
    content_id: int
    user_id: int
    created_at: datetime

# 内容浏览
class ContentViewBase(SQLModel):
    pass

class ContentView(ContentViewBase, table=True):
    __tablename__ = "content_views"
    id: Optional[int] = Field(default=None, primary_key=True)
    content_id: int = Field(foreign_key="contents.id")
    user_id: Optional[int] = Field(default=None, foreign_key="users.id")
    ip_address: Optional[str] = Field(default=None, max_length=45)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # 关联关系
    content: Optional[Content] = Relationship(back_populates="views")
    user: Optional[User] = Relationship()

class ContentViewCreate(SQLModel):
    content_id: int
    ip_address: Optional[str] = None

class ContentViewPublic(ContentViewBase):
    id: int
    content_id: int
    user_id: Optional[int] = None
    ip_address: Optional[str] = None
    created_at: datetime

# 讨论模型
class DiscussionBase(SQLModel):
    title: str = Field(max_length=200)
    content: str
    discussion_type: DiscussionType
    content_id: Optional[int] = None

class Discussion(DiscussionBase, table=True):
    __tablename__ = "discussions"
    id: Optional[int] = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="users.id")
    content_id: Optional[int] = Field(default=None, foreign_key="contents.id")
    group_id: Optional[int] = Field(default=None, foreign_key="groups.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_pinned: bool = Field(default=False)
    reply_count: int = Field(default=0)
    # 关联关系
    author: Optional[User] = Relationship(back_populates="discussions")
    content: Optional[Content] = Relationship(back_populates="discussions")
    group: Optional["Group"] = Relationship(back_populates="discussions")

class DiscussionCreate(DiscussionBase):
    content_id: Optional[int] = None

class DiscussionUpdate(SQLModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_pinned: Optional[bool] = None

class DiscussionPublic(DiscussionBase):
    id: int
    author_id: int
    content_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    is_pinned: bool
    reply_count: int

class DiscussionWithDetails(DiscussionPublic):
    author: Optional[UserPublic] = None
    content: Optional[ContentPublic] = None
    group: Optional["Group"] = None

class CommentBase(SQLModel):
    content: str

class Comment(CommentBase, table=True):
    __tablename__ = "comments"
    id: Optional[int] = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="users.id")
    discussion_id: int = Field(foreign_key="discussions.id")
    parent_id: Optional[int] = Field(default=None, foreign_key="comments.id")  # 支持楼中楼
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    # 关联关系
    author: Optional["User"] = Relationship(back_populates="comments")
    discussion: Optional["Discussion"] = Relationship()
    parent: Optional["Comment"] = Relationship(
        back_populates="replies",
        sa_relationship_kwargs={"remote_side": "[Comment.id]"}
    )
    replies: List["Comment"] = Relationship(
        back_populates="parent"
    )

class CommentCreate(CommentBase):
    discussion_id: int
    parent_id: Optional[int] = None

class CommentUpdate(SQLModel):
    content: Optional[str] = None

class CommentPublic(CommentBase):
    id: int
    author_id: int
    discussion_id: int
    parent_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

class CommentWithDetails(CommentPublic):
    author: Optional["UserPublic"] = None
    replies: List["CommentWithDetails"] = []

class MessageBase(SQLModel):
    title: str = Field(max_length=200)
    content: str
    message_type: str = Field(default="normal")  # normal, system, notification

class Message(MessageBase, table=True):
    __tablename__ = "messages"
    id: Optional[int] = Field(default=None, primary_key=True)
    sender_id: Optional[int] = Field(default=None, foreign_key="users.id")  # 可为空，支持系统消息
    receiver_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = Field(default=False)
    # 关联关系
    sender: Optional["User"] = Relationship(
        back_populates="sent_messages",
        sa_relationship_kwargs={"foreign_keys": "[Message.sender_id]"}
    )
    receiver: Optional["User"] = Relationship(
        back_populates="received_messages",
        sa_relationship_kwargs={"foreign_keys": "[Message.receiver_id]"}
    )

class MessageCreate(MessageBase):
    receiver_id: int

class MessageUpdate(SQLModel):
    is_read: Optional[bool] = None

class MessagePublic(MessageBase):
    id: int
    sender_id: Optional[int] = None
    receiver_id: int
    created_at: datetime
    is_read: bool

class MessageWithDetails(MessagePublic):
    sender: Optional["UserPublic"] = None

class BlockchainRecordBase(SQLModel):
    action: BlockchainAction
    description: str = Field(max_length=200)
    points_amount: Optional[int] = Field(default=None)
    transaction_hash: Optional[str] = Field(default=None, max_length=66)  # 区块链交易哈希

class BlockchainRecord(BlockchainRecordBase, table=True):
    __tablename__ = "blockchain_records"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    content_id: Optional[int] = Field(default=None, foreign_key="contents.id")
    block_number: Optional[int] = None
    gas_used: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    confirmed_at: Optional[datetime] = None
    is_confirmed: bool = Field(default=False)
    # 关联关系
    user: Optional["User"] = Relationship(back_populates="blockchain_records")
    content: Optional["Content"] = Relationship()

class BlockchainRecordCreate(BlockchainRecordBase):
    content_id: Optional[int] = None

class BlockchainRecordPublic(BlockchainRecordBase):
    id: int
    user_id: int
    content_id: Optional[int] = None
    block_number: Optional[int] = None
    gas_used: Optional[int] = None
    created_at: datetime
    confirmed_at: Optional[datetime] = None
    is_confirmed: bool

class BlockchainRecordWithDetails(BlockchainRecordPublic):
    user: Optional["UserPublic"] = None
    content: Optional["ContentPublic"] = None

class ContentWithDetails(ContentPublic):
    author: Optional[UserPublic] = None
    tags: List[TagPublic] = []

class PlatformStats(SQLModel):
    total_users: int
    total_contents: int
    total_groups: int
    total_discussions: int
    total_points_distributed: int
    active_users_today: int
    active_users_week: int
    popular_tags: List[dict]  # {"tag_name": str, "usage_count": int}

# RWA星球共创项目相关模型

class ContributorType(str, Enum):
    INDIVIDUAL = "individual"  # 个人
    ORGANIZATION = "organization"  # 企业/组织

class ContributionType(str, Enum):
    BUG_REPORT = "bug_report"
    FEATURE_REQUEST = "feature_request"
    DOCUMENTATION = "documentation"
    CODE_CONTRIBUTION = "code_contribution"
    CRITICAL_FIX = "critical_fix"
    UI_UX_IMPROVEMENT = "ui_ux_improvement"
    TESTING = "testing"
    OTHER = "other"

class ContributionStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    IN_PROGRESS = "in_progress"

class VerificationStatus(str, Enum):
    UNVERIFIED = "unverified"
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

# 开源项目基础模型
class OpenProjectBase(SQLModel):
    name: str = Field(max_length=100)
    github_repo: str = Field(max_length=200)
    description: Optional[str] = Field(default=None)
    contract_address: Optional[str] = Field(default=None, max_length=66)
    is_active: bool = Field(default=True)

class OpenProject(OpenProjectBase, table=True):
    __tablename__ = "open_projects"
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    # 关联关系
    contributions: List["GitHubContribution"] = Relationship(back_populates="project")

class OpenProjectCreate(OpenProjectBase):
    pass

class OpenProjectUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    contract_address: Optional[str] = None
    is_active: Optional[bool] = None

class OpenProjectPublic(OpenProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

# GitHub贡献记录基础模型
class GitHubContributionBase(SQLModel):
    github_username: str = Field(max_length=100)
    issue_number: int
    issue_title: str = Field(max_length=200)
    issue_url: str = Field(max_length=500)
    contribution_type: ContributionType
    contribution_points: int = Field(default=0)
    status: ContributionStatus = Field(default=ContributionStatus.PENDING)
    github_created_at: datetime
    accepted_at: Optional[datetime] = None
    blockchain_hash: Optional[str] = Field(default=None, max_length=66)

class GitHubContribution(GitHubContributionBase, table=True):
    __tablename__ = "github_contributions"
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="open_projects.id")
    user_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    # 关联关系
    project: Optional[OpenProject] = Relationship(back_populates="contributions")
    user: Optional["User"] = Relationship()

class GitHubContributionCreate(GitHubContributionBase):
    project_id: int

class GitHubContributionUpdate(SQLModel):
    status: Optional[ContributionStatus] = None
    contribution_points: Optional[int] = None
    user_id: Optional[int] = None
    accepted_at: Optional[datetime] = None
    blockchain_hash: Optional[str] = None

class GitHubContributionPublic(GitHubContributionBase):
    id: int
    project_id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class GitHubContributionWithDetails(GitHubContributionPublic):
    project: Optional[OpenProjectPublic] = None
    user: Optional["UserPublic"] = None

# 贡献者身份基础模型
class ContributorProfileBase(SQLModel):
    github_username: str = Field(max_length=100, unique=True)
    contributor_type: ContributorType
    organization_name: Optional[str] = Field(default=None, max_length=200)
    verification_status: VerificationStatus = Field(default=VerificationStatus.UNVERIFIED)
    total_contributions: int = Field(default=0)
    total_points: int = Field(default=0)
    reputation_score: float = Field(default=0.0)

class ContributorProfile(ContributorProfileBase, table=True):
    __tablename__ = "contributor_profiles"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    # 关联关系
    user: Optional["User"] = Relationship()

class ContributorProfileCreate(ContributorProfileBase):
    pass

class ContributorProfileUpdate(SQLModel):
    contributor_type: Optional[ContributorType] = None
    organization_name: Optional[str] = None
    verification_status: Optional[VerificationStatus] = None

class ContributorProfilePublic(ContributorProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class ContributorProfileWithDetails(ContributorProfilePublic):
    user: Optional["UserPublic"] = None

# GitHub项目统计
class ProjectStats(SQLModel):
    project_id: int
    total_contributions: int
    total_contributors: int
    total_points: int
    contribution_types: dict  # 各类型贡献统计
    top_contributors: List[dict]  # 顶级贡献者

# 贡献排行榜
class ContributorRanking(SQLModel):
    user_id: int
    github_username: str
    total_points: int
    total_contributions: int
    reputation_score: float
    rank: int
    user: Optional["UserPublic"] = None

class Notification(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: int
    title: str
    content: str
    type: str = "contribution_review"
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# 先定义 ProjectTagLink
class ProjectTagLink(SQLModel, table=True):
    __tablename__ = "project_tag_links"
    project_id: int = Field(foreign_key="openproject.id", primary_key=True)
    tag_id: int = Field(foreign_key="project_tags.id", primary_key=True)

# 再定义 ProjectTag
class ProjectTag(SQLModel, table=True):
    __tablename__ = "project_tags"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=50, unique=True)
    projects: List["OpenProject"] = Relationship(back_populates="tags", link_model=ProjectTagLink)

# 再定义 OpenProject
class OpenProject(SQLModel, table=True):
    __tablename__ = "openproject"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    is_public: bool = Field(default=True)
    creator_id: int = Field(foreign_key="users.id")
    github_repo: Optional[str] = Field(default=None, max_length=300)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    # 关系
    members: List["ProjectMember"] = Relationship(back_populates="project")
    tags: List[ProjectTag] = Relationship(back_populates="projects", link_model=ProjectTagLink)

class ProjectMember(SQLModel, table=True):
    __tablename__ = "project_members"
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="openproject.id")
    user_id: int = Field(foreign_key="users.id")
    role: str = Field(default="MEMBER", max_length=30)  # ADMIN/MEMBER/其它标签
    status: str = Field(default="APPROVED", max_length=20)  # PENDING/APPROVED/REJECTED
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    # 关系
    project: Optional[OpenProject] = Relationship(back_populates="members")

class ProjectInvite(SQLModel, table=True):
    __tablename__ = "project_invites"
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="openproject.id")
    inviter_id: int = Field(foreign_key="users.id")
    invitee_id: int = Field(foreign_key="users.id")
    status: str = Field(default="PENDING", max_length=20)  # PENDING/APPROVED/REJECTED
    created_at: datetime = Field(default_factory=datetime.utcnow)
