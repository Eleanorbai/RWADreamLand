#!/usr/bin/env python3
"""
测试GitHub集成功能的脚本
"""

import requests
import json
import subprocess
import time
import sys
import os

def test_backend_apis():
    """测试后端API功能"""
    print("🚀 启动后端服务器...")
    
    # 切换到后端目录
    backend_dir = "/workspace/rwadream-land_workspace4/backend"
    os.chdir(backend_dir)
    
    # 启动后端服务器
    server = subprocess.Popen(['python', 'start.py'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(8)  # 等待服务器完全启动
    
    try:
        base_url = "http://localhost:8000"
        
        # 1. 测试公共贡献列表API
        print("\n📋 测试公共贡献列表API...")
        response = requests.get(f"{base_url}/github-contributions")
        if response.status_code == 200:
            contributions = response.json()
            print(f"  ✅ 公共API正常: 找到 {len(contributions)} 条贡献记录")
            
            # 显示记录详情
            pending_count = sum(1 for c in contributions if c['status'] == 'pending')
            accepted_count = sum(1 for c in contributions if c['status'] == 'accepted')
            print(f"  📊 状态统计: {pending_count} 条待审核, {accepted_count} 条已接受")
            
            if pending_count > 0:
                print("  🔔 待审核的贡献:")
                for contrib in contributions:
                    if contrib['status'] == 'pending':
                        print(f"    - {contrib['github_username']}: {contrib['issue_title']}")
        else:
            print(f"  ❌ 公共API错误: {response.status_code} - {response.text}")
            
        # 2. 测试登录API
        print("\n🔐 测试管理员登录...")
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        response = requests.post(f"{base_url}/auth/login", data=login_data)
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data['access_token']
            print("  ✅ 管理员登录成功")
            
            # 设置认证header
            headers = {"Authorization": f"Bearer {access_token}"}
            
            # 3. 测试管理员贡献列表API
            print("\n👑 测试管理员贡献列表API...")
            response = requests.get(f"{base_url}/admin/github-contributions", headers=headers)
            if response.status_code == 200:
                admin_contributions = response.json()
                print(f"  ✅ 管理员API正常: 找到 {len(admin_contributions)} 条记录")
            else:
                print(f"  ❌ 管理员API错误: {response.status_code} - {response.text}")
                
            # 4. 测试贡献统计API
            print("\n📊 测试贡献统计API...")
            response = requests.get(f"{base_url}/github-contributions/stats", headers=headers)
            if response.status_code == 200:
                stats = response.json()
                print(f"  ✅ 统计API正常: {stats}")
            else:
                print(f"  ❌ 统计API错误: {response.status_code} - {response.text}")
        else:
            print(f"  ❌ 登录失败: {response.status_code} - {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("  ❌ 无法连接到后端服务器")
    except Exception as e:
        print(f"  ❌ 测试过程中出错: {e}")
    finally:
        print("\n🛑 关闭后端服务器...")
        server.terminate()
        server.wait()

def check_database_data():
    """检查数据库数据"""
    print("\n💾 检查数据库数据...")
    
    backend_dir = "/workspace/rwadream-land_workspace4/backend"
    os.chdir(backend_dir)
    
    # 检查数据库中的数据
    check_script = '''
from app.database import engine
from sqlmodel import Session, text

with Session(engine) as session:
    # 检查用户数据
    result = session.exec(text("SELECT username, role FROM users WHERE role IN ('admin', 'community_manager')"))
    admin_users = result.fetchall()
    print(f"管理员用户: {len(admin_users)} 个")
    for user in admin_users:
        print(f"  - {user[0]} ({user[1]})")
    
    # 检查GitHub贡献数据
    result = session.exec(text("SELECT status, COUNT(*) FROM github_contributions GROUP BY status"))
    status_counts = result.fetchall()
    print(f"\\n贡献记录统计:")
    for status, count in status_counts:
        print(f"  - {status}: {count} 条")
    
    # 检查开源项目
    result = session.exec(text("SELECT name, github_repo FROM open_projects"))
    projects = result.fetchall()
    print(f"\\n开源项目: {len(projects)} 个")
    for project in projects:
        print(f"  - {project[0]}: {project[1]}")
'''
    
    try:
        result = subprocess.run(['python', '-c', check_script], 
                              capture_output=True, text=True, cwd=backend_dir)
        print(result.stdout)
        if result.stderr:
            print(f"警告: {result.stderr}")
    except Exception as e:
        print(f"❌ 数据库检查失败: {e}")

def print_summary():
    """打印修复总结"""
    print("\n" + "="*60)
    print("📋 GitHub集成问题修复总结")
    print("="*60)
    print()
    print("✅ 已修复的问题:")
    print("1. 界面文本: '系统管理' → '审核管理中心'")
    print("2. 后端导入错误: 添加了 Dict, Any 导入")
    print("3. 数据库初始化: 创建了管理员账户和测试数据")
    print("4. API端点冲突: 管理员API移至 /admin/github-contributions")
    print("5. 前端API调用: 更新为正确的端点")
    print()
    print("🎯 修改的文件:")
    print("后端文件:")
    print("  - /backend/app/crud.py (添加导入)")
    print("  - /backend/app/config.py (数据库配置)")
    print("  - /backend/app/main.py (API端点修复)")
    print("  - /backend/init_db.py (修复导入)")
    print()
    print("前端文件:")
    print("  - /frontend/src/pages/PermissionCenter.tsx (界面文本)")
    print("  - /frontend/src/lib/api.ts (API端点更新)")
    print()
    print("🚀 使用方法:")
    print("1. 启动后端: cd backend && python start.py")
    print("2. 启动前端: cd frontend && npm run dev")
    print("3. 用管理员账户登录: admin / admin123")
    print("4. 访问: 个人中心 → 审核管理中心 → 贡献审核")
    print("5. 应该能看到1条待审核的贡献记录")
    print()

if __name__ == "__main__":
    print("🔍 GitHub集成功能测试")
    print("="*40)
    
    # 检查数据库数据
    check_database_data()
    
    # 测试后端API
    test_backend_apis()
    
    # 打印总结
    print_summary()
