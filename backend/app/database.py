from sqlmodel import create_engine, SQLModel, Session
from .config import settings
import os

# 数据库URL配置
# 优先使用环境变量，否则使用配置文件的设置
DATABASE_URL = os.getenv("DATABASE_URL", settings.database_url)

# 如果是PostgreSQL URL且来自Heroku等平台，需要替换scheme
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 创建数据库引擎
# PostgreSQL配置
if DATABASE_URL.startswith("postgresql://"):
    engine = create_engine(
        DATABASE_URL,
        echo=settings.debug,  # 开发环境显示SQL日志
        pool_pre_ping=True,   # 检查连接是否有效
        pool_recycle=300      # 5分钟后回收连接
    )
# SQLite配置（用于开发/测试）
elif DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        echo=settings.debug,
        connect_args={"check_same_thread": False}
    )
else:
    raise ValueError(f"不支持的数据库URL: {DATABASE_URL}")

# 依赖项：获取数据库会话
def get_db():
    with Session(engine) as session:
        yield session

# 创建所有表
def create_tables():
    """创建数据库表"""
    SQLModel.metadata.create_all(engine)

# 初始化数据库
def init_db():
    """初始化数据库，创建表和初始数据"""
    create_tables()
    
    # 可以在这里添加初始数据创建逻辑
    # 比如创建默认管理员用户等
