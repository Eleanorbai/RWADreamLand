#!/usr/bin/env python3
"""
测试合约状态和权限
"""
import os
import sys
import requests
from web3 import Web3
from eth_account import Account

# 添加项目路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import settings

def test_contract_status():
    """测试合约状态"""
    print("=== 测试合约状态 ===")
    
    # 打印配置
    print(f"节点URL: {settings.blockchain_node_url}")
    print(f"私钥长度: {len(settings.blockchain_private_key) if settings.blockchain_private_key else 0}")
    print(f"合约地址: {settings.contribution_contract_address}")
    
    try:
        # 初始化web3
        web3 = Web3(Web3.HTTPProvider(settings.blockchain_node_url))
        account = Account.from_key(settings.blockchain_private_key)
        print(f"账户地址: {account.address}")
        
        # 简化的ABI，只包含我们需要的方法
        abi = [
            {
                "inputs": [],
                "name": "getTotalContributions",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "projectCounter",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_projectId", "type": "uint256"}],
                "name": "getProject",
                "outputs": [
                    {"name": "id", "type": "uint256"},
                    {"name": "name", "type": "string"},
                    {"name": "githubRepo", "type": "string"},
                    {"name": "owner", "type": "address"},
                    {"name": "admin", "type": "address"},
                    {"name": "totalContributions", "type": "uint256"},
                    {"name": "totalPoints", "type": "uint256"},
                    {"name": "isActive", "type": "bool"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_user", "type": "address"}, {"name": "_projectId", "type": "uint256"}],
                "name": "getUserRole",
                "outputs": [{"name": "", "type": "uint8"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
        
        # 创建合约实例
        contract_address = Web3.to_checksum_address(settings.contribution_contract_address)
        contract = web3.eth.contract(address=contract_address, abi=abi)
        
        # 1. 检查总贡献数
        try:
            total_contributions = contract.functions.getTotalContributions().call()
            print(f"总贡献数: {total_contributions}")
        except Exception as e:
            print(f"获取总贡献数失败: {e}")
        
        # 2. 检查项目计数器
        try:
            project_count = contract.functions.projectCounter().call()
            print(f"项目计数器: {project_count}")
        except Exception as e:
            print(f"获取项目计数器失败: {e}")
        
        # 3. 检查项目1是否存在
        try:
            project = contract.functions.getProject(1).call()
            print(f"项目1详情: {project}")
        except Exception as e:
            print(f"获取项目1失败: {e}")
        
        # 4. 检查用户权限
        try:
            user_role = contract.functions.getUserRole(account.address, 1).call()
            print(f"用户角色: {user_role}")
        except Exception as e:
            print(f"获取用户角色失败: {e}")
        
        print("\n=== 分析结果 ===")
        if project_count == 0:
            print("❌ 问题：合约中还没有创建任何项目")
            print("解决方案：需要先调用createProject创建项目")
        else:
            print("✅ 项目已存在")
            
        if user_role == 0:
            print("❌ 问题：用户没有权限调用recordContribution")
            print("解决方案：需要给用户分配权限")
        else:
            print("✅ 用户有权限")
            
    except Exception as e:
        print(f"❌ 测试失败: {e}")

if __name__ == "__main__":
    test_contract_status() 