#!/usr/bin/env python3
"""
初始化合约：创建项目和分配权限
"""
import os
import sys
from web3 import Web3
from eth_account import Account

# 添加项目路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import settings

def init_contract():
    """初始化合约"""
    print("=== 初始化合约 ===")
    
    try:
        # 初始化web3
        web3 = Web3(Web3.HTTPProvider(settings.blockchain_node_url))
        account = Account.from_key(settings.blockchain_private_key)
        print(f"账户地址: {account.address}")
        
        # 合约ABI
        abi = [
            # createProject方法
            {
                "inputs": [
                    {"name": "_name", "type": "string"},
                    {"name": "_githubRepo", "type": "string"},
                    {"name": "_owner", "type": "address"},
                    {"name": "_admin", "type": "address"}
                ],
                "name": "createProject",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            # assignRole方法
            {
                "inputs": [
                    {"name": "_user", "type": "address"},
                    {"name": "_role", "type": "uint8"},
                    {"name": "_projectId", "type": "uint256"}
                ],
                "name": "assignRole",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            # 查询方法
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
            }
        ]
        
        # 创建合约实例
        contract_address = Web3.to_checksum_address(settings.contribution_contract_address)
        contract = web3.eth.contract(address=contract_address, abi=abi)
        
        # 1. 检查当前项目数量
        try:
            project_count = contract.functions.projectCounter().call()
            print(f"当前项目数量: {project_count}")
        except Exception as e:
            print(f"获取项目数量失败: {e}")
            return
        
        # 2. 如果还没有项目，创建第一个项目
        if project_count == 0:
            print("\n创建第一个项目...")
            try:
                # 构建交易
                function = contract.functions.createProject(
                    "RWA学习平台",  # 项目名称
                    "https://github.com/Eleanorbai/RWADreamLand.git",  # GitHub仓库
                    account.address,  # 项目所有者
                    account.address   # 项目管理员
                )
                
                # 估算gas
                gas_estimate = function.estimate_gas()
                
                # 构建交易
                transaction = function.build_transaction({
                    'gas': int(gas_estimate * 1.2),
                    'gasPrice': web3.eth.gas_price,
                    'nonce': web3.eth.get_transaction_count(account.address),
                })
                
                # 签名交易
                signed_txn = web3.eth.account.sign_transaction(transaction, settings.blockchain_private_key)
                
                # 发送交易
                tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
                
                # 等待交易确认
                tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
                
                if tx_receipt.status == 1:
                    print(f"✅ 项目创建成功，交易哈希: {tx_hash.hex()}")
                else:
                    print(f"❌ 项目创建失败: {tx_hash.hex()}")
                    return
                    
            except Exception as e:
                print(f"❌ 创建项目失败: {e}")
                return
        
        # 3. 检查项目1是否存在
        try:
            project = contract.functions.getProject(1).call()
            print(f"项目1详情: {project}")
        except Exception as e:
            print(f"❌ 获取项目1失败: {e}")
            return
        
        # 4. 给当前用户分配项目管理员权限
        print("\n分配用户权限...")
        try:
            # 构建交易 - 分配项目管理员权限
            function = contract.functions.assignRole(
                account.address,  # 用户地址
                3,  # PROJECT_ADMIN角色
                1   # 项目ID
            )
            
            # 估算gas
            gas_estimate = function.estimate_gas()
            
            # 构建交易
            transaction = function.build_transaction({
                'gas': int(gas_estimate * 1.2),
                'gasPrice': web3.eth.gas_price,
                'nonce': web3.eth.get_transaction_count(account.address),
            })
            
            # 签名交易
            signed_txn = web3.eth.account.sign_transaction(transaction, settings.blockchain_private_key)
            
            # 发送交易
            tx_hash = web3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # 等待交易确认
            tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
            
            if tx_receipt.status == 1:
                print(f"✅ 权限分配成功，交易哈希: {tx_hash.hex()}")
            else:
                print(f"❌ 权限分配失败: {tx_hash.hex()}")
                
        except Exception as e:
            print(f"❌ 分配权限失败: {e}")
            return
        
        print("\n✅ 合约初始化完成！")
        print("现在可以测试贡献记录了。")
        
    except Exception as e:
        print(f"❌ 初始化失败: {e}")

if __name__ == "__main__":
    init_contract() 