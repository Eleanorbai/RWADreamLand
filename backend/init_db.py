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
from datetime import datetime, timedelta

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
            
            # 创建模拟贡献者资料和贡献记录来展示多方参与
            from app.models import ContributorProfile, GitHubContribution, ContributorType, ContributionType, ContributionStatus
            import random
            from datetime import timedelta
            
            # 模拟贡献者数据
            mock_contributors = [
                {
                    "user_id": admin_user.id,
                    "github_username": "tech_innovator_2024",
                    "contributor_type": ContributorType.INDIVIDUAL,
                    "organization_name": None,
                    "total_contributions": 15,
                    "total_points": 750,
                    "reputation_score": 850.0
                },
                {
                    "user_id": reviewer_user.id,
                    "github_username": "blockchain_solutions_corp",
                    "contributor_type": ContributorType.ORGANIZATION,
                    "organization_name": "区块链解决方案有限公司",
                    "total_contributions": 28,
                    "total_points": 1200,
                    "reputation_score": 1160.0
                },
                {
                    "user_id": community_manager.id,
                    "github_username": "fintech_developer",
                    "contributor_type": ContributorType.INDIVIDUAL,
                    "organization_name": None,
                    "total_contributions": 22,
                    "total_points": 980,
                    "reputation_score": 992.0
                }
            ]
            
            # 创建贡献者资料
            for contributor_data in mock_contributors:
                existing_profile = db.exec(
                    select(ContributorProfile).where(ContributorProfile.user_id == contributor_data["user_id"])
                ).first()
                if not existing_profile:
                    profile = ContributorProfile(**contributor_data)
                    db.add(profile)
                    print(f"✅ 创建贡献者资料: {contributor_data['github_username']}")
            
            # 创建模拟GitHub贡献记录
            if rwa_project:
                mock_contributions = [
                    {
                        "project_id": rwa_project.id,
                        "user_id": admin_user.id,
                        "github_username": "tech_innovator_2024",
                        "issue_number": 1,
                        "issue_title": "优化用户界面响应速度",
                        "issue_url": "https://github.com/Eleanorbai/RWADreamLand/issues/1",
                        "contribution_type": ContributionType.UI_UX_IMPROVEMENT,
                        "contribution_points": 25,
                        "status": ContributionStatus.ACCEPTED,
                        "blockchain_hash": "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
                        "github_created_at": datetime.utcnow() - timedelta(days=5),
                        "accepted_at": datetime.utcnow() - timedelta(days=4)
                    },
                    {
                        "project_id": rwa_project.id,
                        "user_id": reviewer_user.id,
                        "github_username": "blockchain_solutions_corp",
                        "issue_number": 2,
                        "issue_title": "实现FISCO BCOS智能合约集成",
                        "issue_url": "https://github.com/Eleanorbai/RWADreamLand/issues/2",
                        "contribution_type": ContributionType.CODE_CONTRIBUTION,
                        "contribution_points": 50,
                        "status": ContributionStatus.ACCEPTED,
                        "blockchain_hash": "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
                        "github_created_at": datetime.utcnow() - timedelta(days=3),
                        "accepted_at": datetime.utcnow() - timedelta(days=2)
                    },
                    {
                        "project_id": rwa_project.id,
                        "user_id": community_manager.id,
                        "github_username": "fintech_developer",
                        "issue_number": 3,
                        "issue_title": "完善API文档和使用示例",
                        "issue_url": "https://github.com/Eleanorbai/RWADreamLand/issues/3",
                        "contribution_type": ContributionType.DOCUMENTATION,
                        "contribution_points": 20,
                        "status": ContributionStatus.ACCEPTED,
                        "blockchain_hash": "0x3c4d5e6f7890abcdef1234567890abcdef123456",
                        "github_created_at": datetime.utcnow() - timedelta(days=2),
                        "accepted_at": datetime.utcnow() - timedelta(days=1)
                    },
                    {
                        "project_id": rwa_project.id,
                        "user_id": admin_user.id,
                        "github_username": "tech_innovator_2024",
                        "issue_number": 4,
                        "issue_title": "修复移动端样式显示问题",
                        "issue_url": "https://github.com/Eleanorbai/RWADreamLand/issues/4",
                        "contribution_type": ContributionType.BUG_REPORT,
                        "contribution_points": 10,
                        "status": ContributionStatus.ACCEPTED,
                        "blockchain_hash": "0x4d5e6f7890abcdef1234567890abcdef12345678",
                        "github_created_at": datetime.utcnow() - timedelta(days=1),
                        "accepted_at": datetime.utcnow() - timedelta(hours=12)
                    },
                    {
                        "project_id": rwa_project.id,
                        "user_id": reviewer_user.id,
                        "github_username": "blockchain_solutions_corp",
                        "issue_number": 5,
                        "issue_title": "建议增加多语言支持功能",
                        "issue_url": "https://github.com/Eleanorbai/RWADreamLand/issues/5",
                        "contribution_type": ContributionType.FEATURE_REQUEST,
                        "contribution_points": 15,
                        "status": ContributionStatus.PENDING,
                        "blockchain_hash": None,
                        "github_created_at": datetime.utcnow() - timedelta(hours=6),
                        "accepted_at": None
                    }
                ]
                
                for contribution_data in mock_contributions:
                    existing_contribution = db.exec(
                        select(GitHubContribution).where(
                            GitHubContribution.project_id == contribution_data["project_id"],
                            GitHubContribution.issue_number == contribution_data["issue_number"]
                        )
                    ).first()
                    if not existing_contribution:
                        contribution = GitHubContribution(**contribution_data)
                        db.add(contribution)
                        print(f"✅ 创建模拟贡献记录: Issue #{contribution_data['issue_number']}")
                
                # 创建区块链记录
                from app.models import BlockchainRecord, BlockchainAction
                blockchain_records = [
                    {
                        "user_id": admin_user.id,
                        "action": BlockchainAction.CONTRIBUTION_RECORD,
                        "description": "GitHub贡献确认: 优化用户界面响应速度",
                        "points_amount": 25,
                        "transaction_hash": "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
                        "block_number": 12345678,
                        "gas_used": 21000,
                        "is_confirmed": True,
                        "confirmed_at": datetime.utcnow() - timedelta(days=4)
                    },
                    {
                        "user_id": reviewer_user.id,
                        "action": BlockchainAction.CONTRIBUTION_RECORD,
                        "description": "GitHub贡献确认: 实现FISCO BCOS智能合约集成",
                        "points_amount": 50,
                        "transaction_hash": "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
                        "block_number": 12345679,
                        "gas_used": 31000,
                        "is_confirmed": True,
                        "confirmed_at": datetime.utcnow() - timedelta(days=2)
                    },
                    {
                        "user_id": community_manager.id,
                        "action": BlockchainAction.CONTRIBUTION_RECORD,
                        "description": "GitHub贡献确认: 完善API文档和使用示例",
                        "points_amount": 20,
                        "transaction_hash": "0x3c4d5e6f7890abcdef1234567890abcdef123456",
                        "block_number": 12345680,
                        "gas_used": 25000,
                        "is_confirmed": True,
                        "confirmed_at": datetime.utcnow() - timedelta(days=1)
                    }
                ]
                
                for record_data in blockchain_records:
                    existing_record = db.exec(
                        select(BlockchainRecord).where(
                            BlockchainRecord.transaction_hash == record_data["transaction_hash"]
                        )
                    ).first()
                    if not existing_record:
                        record = BlockchainRecord(**record_data)
                        db.add(record)
                        print(f"✅ 创建区块链记录: {record_data['transaction_hash'][:10]}...")
            
            
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
