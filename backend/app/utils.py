from passlib.context import CryptContext

# 创建密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """对密码进行哈希加密"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """校验明文密码和哈希密码是否一致"""
    return pwd_context.verify(plain_password, hashed_password)
