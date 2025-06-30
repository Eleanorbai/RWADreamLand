#!/usr/bin/env python3
"""
数据库初始化脚本
用于创建数据库表和初始数据
"""

import sys
import os
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.database import create_tables, engine
from app.models import User, Tag, UserRole, OpenProject
from app.utils import get_password_hash
from sqlmodel import Session, select

def create_initial_data():
    """创建初始数据"""
    print("创建初始数据...")
    
    # 获取数据库会话
    with Session(engine) as db:
        try:
            # 创建管理员用户
            statement = select(User).where(User.username == "admin")
            admin_user = db.exec(statement).first()
            if not admin_user:
                admin_user = User(
                    username="admin",
                    full_name="系统管理员",
                    email="admin@rwadreamland.com",
                    hashed_password=get_password_hash("admin123"),
                    role=UserRole.ADMIN,
                    points=1000
                )
                db.add(admin_user)
                print("✅ 创建管理员用户: admin / admin123")
            
            # 创建审核员用户
            statement = select(User).where(User.username == "reviewer")
            reviewer_user = db.exec(statement).first()
            if not reviewer_user:
                reviewer_user = User(
                    username="reviewer",
                    full_name="内容审核员",
                    email="reviewer@rwadreamland.com",
                    hashed_password=get_password_hash("reviewer123"),
                    role=UserRole.REVIEWER,
                    points=500
                )
                db.add(reviewer_user)
                print("✅ 创建审核员用户: reviewer / reviewer123")
            
            # 创建社区管理员用户
            statement = select(User).where(User.username == "community")
            community_manager = db.exec(statement).first()
            if not community_manager:
                community_manager = User(
                    username="community",
                    full_name="社区管理员",
                    email="community@rwadreamland.com",
                    hashed_password=get_password_hash("community123"),
                    role=UserRole.COMMUNITY_MANAGER,
                    points=800
                )
                db.add(community_manager)
                print("✅ 创建社区管理员用户: community / community123")
            
            # 创建初始标签
            initial_tags = [
                {"name": "RWA", "description": "Real World Assets 真实世界资产", "color": "#3B82F6"},
                {"name": "区块链", "description": "区块链技术相关", "color": "#10B981"},
                {"name": "金融科技", "description": "金融科技创新", "color": "#F59E0B"},
                {"name": "案例研究", "description": "项目案例分析", "color": "#EF4444"},
                {"name": "技术架构", "description": "技术实现方案", "color": "#8B5CF6"},
                {"name": "法律合规", "description": "法律法规相关", "color": "#06B6D4"},
                {"name": "商业模式", "description": "商业模式设计", "color": "#F97316"},
                {"name": "风险管理", "description": "风险识别和管控", "color": "#84CC16"},
            ]
            
            for tag_data in initial_tags:
                statement = select(Tag).where(Tag.name == tag_data["name"])
                existing_tag = db.exec(statement).first()
                if not existing_tag:
                    tag = Tag(**tag_data)
                    db.add(tag)
                    print(f"✅ 创建标签: {tag_data['name']}")
            
            # 创建RWA星球共创项目
            statement = select(OpenProject).where(OpenProject.name == "RWA星球共创项目")
            rwa_project = db.exec(statement).first()
            if not rwa_project:
                rwa_project = OpenProject(
                    name="RWA星球共创项目",
                    github_repo="https://github.com/Eleanorbai/RWADreamLand.git",
                    description="基于GitHub开源协作的RWA平台功能完善项目。通过提交Issue、改进建议获得链上积分奖励，成为平台核心贡献者。",
                    is_active=True
                )
                db.add(rwa_project)
                print("✅ 创建RWA星球共创项目")
            
            # 提交所有更改
            db.commit()
            print("✅ 初始数据创建完成")
            
            print("UserRole.COMMUNITY_MANAGER =", UserRole.COMMUNITY_MANAGER)
            
        except Exception as e:
            db.rollback()
            print(f"❌ 创建初始数据失败: {e}")
            raise

def main():
    """主函数"""
    print("开始初始化数据库...")
    
    try:
        # 创建数据库表
        print("创建数据库表...")
        create_tables()
        print("✅ 数据库表创建完成")
        
        # 创建初始数据
        create_initial_data()
        
        print("\n🎉 数据库初始化完成!")
        print("\n默认用户账号:")
        print("管理员: admin / admin123")
        print("审核员: reviewer / reviewer123")
        print("社区管理员: community / community123")
        
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
