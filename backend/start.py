#!/usr/bin/env python3
"""
RWA学习平台后端启动脚本
"""

import uvicorn
import os
import sys
from app.config import settings

def main():
    """启动FastAPI应用"""
    print(f"🚀 启动 {settings.app_name} v{settings.app_version}")
    print(f"📊 数据库: {settings.database_url.split('@')[-1] if '@' in settings.database_url else 'SQLite'}")
    print(f"🌐 服务地址: http://{settings.host}:{settings.port}")
    print(f"📚 API文档: http://{settings.host}:{settings.port}/docs")
    print(f"🔍 调试模式: {'开启' if settings.debug else '关闭'}")
    
    try:
        uvicorn.run(
            "app.main:app",
            host=settings.host,
            port=settings.port,
            reload=settings.debug,
            access_log=settings.debug,
            log_level="debug" if settings.debug else "info"
        )
    except KeyboardInterrupt:
        print("\n👋 服务已停止")
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
