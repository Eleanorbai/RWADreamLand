#!/usr/bin/env python3
"""
创建GitHub贡献测试数据
用于测试贡献审核功能
"""

import asyncio
from datetime import datetime, timedelta
import random
from app.database import get_db
from app.models import *
from sqlmodel import Session, select

def create_test_github_contributions():
    """创建测试用的GitHub贡献数据"""
    db = next(get_db())
    
    try:
        # 确保有RWA项目
        rwa_project = db.exec(select(OpenProject).where(OpenProject.name == "RWA星球共创项目")).first()
        if not rwa_project:
            rwa_project = OpenProject(
                name="RWA星球共创项目",
                github_repo="https://github.com/Eleanorbai/RWADreamLand",
                description="RWA数字化资产管理平台的开源项目",
                contract_address="0x1234567890123456789012345678901234567890",
                is_active=True
            )
            db.add(rwa_project)
            db.commit()
            db.refresh(rwa_project)
            print("✅ 创建RWA项目")
        
        # 获取管理员用户
        admin_user = db.exec(select(User).where(User.role == UserRole.ADMIN)).first()
        if not admin_user:
            print("❌ 未找到管理员用户，请先运行init_db.py")
            return
        
        # 创建测试贡献数据
        test_contributions = [
            {
                "project_id": rwa_project.id,
                "github_username": "developer001",
                "issue_number": 101,
                "issue_title": "修复用户登录时的认证错误",
                "issue_url": "https://github.com/Eleanorbai/RWADreamLand/issues/101",
                "contribution_type": ContributionType.BUG_REPORT,
                "contribution_points": 50,
                "status": ContributionStatus.PENDING,
                "github_created_at": datetime.utcnow() - timedelta(hours=2),
                "user_id": None
            },
            {
                "project_id": rwa_project.id,
                "github_username": "enterprise_tech",
                "issue_number": 102,
                "issue_title": "增加企业用户批量导入功能",
                "issue_url": "https://github.com/Eleanorbai/RWADreamLand/issues/102",
                "contribution_type": ContributionType.FEATURE_REQUEST,
                "contribution_points": 80,
                "status": ContributionStatus.PENDING,
                "github_created_at": datetime.utcnow() - timedelta(hours=1),
                "user_id": None
            },
            {
                "project_id": rwa_project.id,
                "github_username": "ux_designer",
                "issue_number": 103,
                "issue_title": "优化移动端界面响应式设计",
                "issue_url": "https://github.com/Eleanorbai/RWADreamLand/issues/103",
                "contribution_type": ContributionType.UI_UX_IMPROVEMENT,
                "contribution_points": 60,
                "status": ContributionStatus.ACCEPTED,
                "github_created_at": datetime.utcnow() - timedelta(days=1),
                "accepted_at": datetime.utcnow() - timedelta(hours=12),
                "blockchain_hash": "0x" + "".join([format(random.randint(0, 15), 'x') for _ in range(64)]),
                "user_id": admin_user.id
            },
            {
                "project_id": rwa_project.id,
                "github_username": "security_expert",
                "issue_number": 104,
                "issue_title": "发现并报告安全漏洞",
                "issue_url": "https://github.com/Eleanorbai/RWADreamLand/issues/104",
                "contribution_type": ContributionType.BUG_REPORT,
                "contribution_points": 100,
                "status": ContributionStatus.ACCEPTED,
                "github_created_at": datetime.utcnow() - timedelta(days=2),
                "accepted_at": datetime.utcnow() - timedelta(days=1),
                "blockchain_hash": "0x" + "".join([format(random.randint(0, 15), 'x') for _ in range(64)]),
                "user_id": admin_user.id
            },
            {
                "project_id": rwa_project.id,
                "github_username": "doc_writer",
                "issue_number": 105,
                "issue_title": "完善API文档说明",
                "issue_url": "https://github.com/Eleanorbai/RWADreamLand/issues/105",
                "contribution_type": ContributionType.DOCUMENTATION,
                "contribution_points": 30,
                "status": ContributionStatus.PENDING,
                "github_created_at": datetime.utcnow() - timedelta(minutes=30),
                "user_id": None
            }
        ]
        
        created_count = 0
        for contrib_data in test_contributions:
            # 检查是否已存在
            existing = db.exec(
                select(GitHubContribution).where(
                    GitHubContribution.project_id == contrib_data["project_id"],
                    GitHubContribution.issue_number == contrib_data["issue_number"]
                )
            ).first()
            
            if not existing:
                contribution = GitHubContribution(**contrib_data)
                db.add(contribution)
                created_count += 1
                print(f"✅ 创建测试贡献: Issue #{contrib_data['issue_number']} - {contrib_data['issue_title']}")
        
        # 创建对应的区块链记录
        for contrib in db.exec(select(GitHubContribution).where(GitHubContribution.blockchain_hash.is_not(None))).all():
            # 检查是否已有区块链记录
            existing_record = db.exec(
                select(BlockchainRecord).where(
                    BlockchainRecord.user_id == contrib.user_id,
                    BlockchainRecord.description.contains(f"Issue #{contrib.issue_number}")
                )
            ).first()
            
            if not existing_record and contrib.user_id:
                blockchain_record = BlockchainRecord(
                    user_id=contrib.user_id,
                    action=BlockchainAction.CONTRIBUTION_RECORD,
                    description=f"GitHub贡献确认: {contrib.issue_title}",
                    amount=contrib.contribution_points,
                    transaction_hash=contrib.blockchain_hash,
                    block_number=random.randint(1000000, 9999999),
                    gas_used=random.randint(21000, 100000),
                    gas_price=random.randint(1000000000, 50000000000),
                    status="confirmed",
                    created_at=contrib.accepted_at or datetime.utcnow()
                )
                db.add(blockchain_record)
                print(f"✅ 创建区块链记录: {contrib.issue_title}")
        
        db.commit()
        print(f"\n🎉 成功创建 {created_count} 个测试贡献记录")
        
        # 显示统计信息
        total_contributions = db.exec(select(GitHubContribution)).all()
        pending_count = len([c for c in total_contributions if c.status == ContributionStatus.PENDING])
        accepted_count = len([c for c in total_contributions if c.status == ContributionStatus.ACCEPTED])
        on_chain_count = len([c for c in total_contributions if c.blockchain_hash])
        
        print(f"\n📊 当前统计:")
        print(f"  总贡献数: {len(total_contributions)}")
        print(f"  待审核: {pending_count}")
        print(f"  已接受: {accepted_count}")
        print(f"  已上链: {on_chain_count}")
        
    except Exception as e:
        print(f"❌ 创建测试数据失败: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 开始创建GitHub贡献测试数据...")
    create_test_github_contributions()
    print("✅ 测试数据创建完成！")
    print("\n📝 接下来的步骤:")
    print("1. 启动后端服务: cd backend && python start.py")
    print("2. 启动前端服务: cd frontend && npm run dev")
    print("3. 以管理员身份登录")
    print("4. 访问 个人中心 → 系统管理 → 贡献审核")
    print("5. 测试贡献审核功能")
