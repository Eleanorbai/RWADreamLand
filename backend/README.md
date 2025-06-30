# RWA学习平台后端

基于 FastAPI + SQLModel + PostgreSQL 构建的现代化后端API服务。

## 🚀 技术栈

- **FastAPI** - 现代化、高性能的Python Web框架
- **SQLModel** - 类型安全的ORM，结合SQLAlchemy和Pydantic
- **PostgreSQL** - 企业级关系型数据库
- **JWT** - 安全的用户认证
- **Pydantic** - 数据验证和设置管理
- **Uvicorn** - ASGI服务器

## 📋 功能特性

### 用户系统
- ✅ 用户注册/登录
- ✅ JWT令牌认证
- ✅ 角色权限管理（普通用户/审核员/管理员）
- ✅ 用户资料管理
- ✅ 头像上传
- ✅ 积分系统

### 笔记系统
- ✅ Markdown笔记创建/编辑
- ✅ 笔记列表和详情查看
- ✅ 笔记提交审核
- ✅ 审核状态跟踪

### 审核系统
- ✅ 审核员管理界面
- ✅ 审核流程管理
- ✅ 审核历史记录
- ✅ 积分奖励机制

## 🛠 开发环境设置

### 1. 环境要求
- Python 3.9+
- PostgreSQL 12+
- pip或poetry

### 2. 数据库设置

#### 使用Docker Compose（推荐）
```bash
# 在项目根目录启动PostgreSQL
docker-compose up -d postgres

# 等待数据库启动
docker-compose logs postgres
```

#### 手动安装PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# 创建数据库
sudo -u postgres psql
CREATE DATABASE rwadreamland;
CREATE USER rwadreamland_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rwadreamland TO rwadreamland_user;
\q
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
# 修改数据库连接URL和其他配置
```

### 4. 安装依赖
```bash
cd backend
pip install -r requirements.txt
```

### 5. 运行应用
```bash
# 方式1：使用启动脚本
python start.py

# 方式2：直接使用uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📡 API文档

启动服务后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🗄 数据库模型

### 用户模型 (User)
```python
class User(UserBase, table=True):
    id: Optional[int] = Field(primary_key=True)
    username: str = Field(unique=True, index=True)
    full_name: Optional[str] = None
    email: Optional[str] = Field(unique=True, index=True)
    hashed_password: str
    avatar_url: Optional[str] = None
    points: int = Field(default=0)
    role: UserRole = Field(default=UserRole.USER)
    is_active: bool = Field(default=True)
```

### 笔记模型 (Note)
```python
class Note(NoteBase, table=True):
    id: Optional[int] = Field(primary_key=True)
    title: str
    content: str  # Markdown内容
    author_id: int = Field(foreign_key="users.id")
    is_submitted: bool = Field(default=False)
```

### 审核请求模型 (ReviewRequest)
```python
class ReviewRequest(ReviewRequestBase, table=True):
    id: Optional[int] = Field(primary_key=True)
    note_id: int = Field(foreign_key="notes.id")
    author_id: int = Field(foreign_key="users.id")
    status: ReviewStatus = Field(default=ReviewStatus.PENDING)
    reviewer_id: Optional[int] = Field(foreign_key="users.id")
```

## 🔐 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL连接URL | `postgresql://postgres:password@localhost:5432/rwadreamland` |
| `SECRET_KEY` | JWT密钥 | 需要设置 |
| `DEBUG` | 调试模式 | `False` |
| `HOST` | 服务器地址 | `0.0.0.0` |
| `PORT` | 服务器端口 | `8000` |

## 📁 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI应用入口
│   ├── config.py        # 配置管理
│   ├── database.py      # 数据库连接
│   ├── models.py        # SQLModel数据模型
│   ├── auth.py          # 认证相关
│   └── crud.py          # 数据库操作
├── uploads/             # 文件上传目录
├── requirements.txt     # Python依赖
├── start.py            # 启动脚本
├── .env.example        # 环境变量模板
└── README.md           # 说明文档
```

## 🚦 API端点

### 认证相关
- `POST /register` - 用户注册
- `POST /login` - 用户登录
- `GET /me` - 获取当前用户信息
- `PUT /me` - 更新用户资料
- `POST /upload-avatar` - 上传头像

### 笔记相关
- `POST /notes` - 创建笔记
- `GET /notes` - 获取笔记列表
- `GET /notes/my` - 获取我的笔记
- `GET /notes/{id}` - 获取笔记详情
- `PUT /notes/{id}` - 更新笔记
- `DELETE /notes/{id}` - 删除笔记
- `POST /notes/{id}/submit` - 提交笔记审核

### 审核相关
- `GET /review-requests` - 获取待审核列表（审核员）
- `GET /review-requests/my` - 获取我的审核请求
- `POST /reviews` - 创建审核记录

### 用户管理（管理员）
- `GET /users` - 获取用户列表
- `GET /users/{id}` - 获取用户详情

## 🔧 部署

### 生产环境配置
```bash
# 设置生产环境变量
export DEBUG=false
export SECRET_KEY=$(openssl rand -hex 32)
export DATABASE_URL=postgresql://user:pass@prod-db:5432/rwadreamland

# 使用gunicorn部署
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Docker部署
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "start.py"]
```

## 🧪 测试

```bash
# 安装测试依赖
pip install pytest pytest-asyncio httpx

# 运行测试
pytest
```

## 📝 开发说明

### 数据库迁移
使用Alembic进行数据库版本管理：
```bash
# 安装alembic
pip install alembic

# 初始化迁移
alembic init migrations

# 创建迁移文件
alembic revision --autogenerate -m "描述"

# 执行迁移
alembic upgrade head
```

### 代码规范
- 使用Black进行代码格式化
- 使用isort整理导入
- 使用mypy进行类型检查
- 遵循PEP 8编码规范

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件
