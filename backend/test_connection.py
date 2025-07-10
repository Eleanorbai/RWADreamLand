#!/usr/bin/env python3
"""
测试FISCO BCOS连接
"""
import os
import sys
import requests
from web3 import Web3
from eth_account import Account

# 添加项目路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import settings

def test_blockchain_connection():
    """测试区块链连接"""
    print("=== 测试FISCO BCOS连接 ===")
    
    # 打印配置
    print(f"节点URL: {settings.blockchain_node_url}")
    print(f"私钥长度: {len(settings.blockchain_private_key) if settings.blockchain_private_key else 0}")
    print(f"合约地址: {settings.contribution_contract_address}")
    
    # 1. 先用requests测试HTTP连接
    print("\n1. 测试HTTP连接...")
    try:
        response = requests.post(
            settings.blockchain_node_url,
            json={
                "jsonrpc": "2.0",
                "method": "getBlockNumber",
                "params": [],
                "id": 1
            },
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"HTTP响应状态码: {response.status_code}")
        print(f"HTTP响应内容: {response.text}")
        
        if response.status_code == 200:
            print("✅ HTTP连接成功")
        else:
            print("❌ HTTP连接失败")
            return False
    except Exception as e:
        print(f"❌ HTTP连接异常: {e}")
        return False
    
    # 2. 测试Web3连接
    print("\n2. 测试Web3连接...")
    try:
        # 初始化Web3客户端
        web3 = Web3(Web3.HTTPProvider(settings.blockchain_node_url))
        
        # 检查连接
        is_connected = web3.is_connected()
        print(f"Web3连接状态: {is_connected}")
        
        if not is_connected:
            print("❌ Web3无法连接到FISCO BCOS节点")
            print("尝试绕过连接检查...")
            
            # 尝试直接调用方法
            try:
                block_number = web3.eth.block_number
                print(f"当前区块号: {block_number}")
                print("✅ 绕过连接检查成功")
            except Exception as e:
                print(f"❌ 绕过连接检查也失败: {e}")
                return False
        else:
            print("✅ Web3连接成功")
            try:
                block_number = web3.eth.block_number
                print(f"当前区块号: {block_number}")
            except Exception as e:
                print(f"获取区块号失败: {e}")
                return False
        
        # 3. 测试账户
        if settings.blockchain_private_key:
            print("\n3. 测试账户...")
            try:
                account = Account.from_key(settings.blockchain_private_key)
                print(f"账户地址: {account.address}")
                
                # 获取账户余额
                try:
                    balance = web3.eth.get_balance(account.address)
                    print(f"账户余额: {web3.from_wei(balance, 'ether')} ETH")
                except Exception as e:
                    print(f"获取余额失败: {e}")
            except Exception as e:
                print(f"账户测试失败: {e}")
                return False
        
        # 4. 测试合约地址
        if settings.contribution_contract_address:
            print("\n4. 测试合约地址...")
            try:
                checksum_address = Web3.to_checksum_address(settings.contribution_contract_address)
                print(f"Checksum地址: {checksum_address}")
                
                # 检查合约代码
                try:
                    code = web3.eth.get_code(checksum_address)
                    if code and code != b'':
                        print("✅ 合约地址有效，合约已部署")
                    else:
                        print("❌ 合约地址无效或合约未部署")
                        return False
                except Exception as e:
                    print(f"检查合约代码失败: {e}")
                    return False
            except Exception as e:
                print(f"合约地址检查失败: {e}")
                return False
        
        print("\n✅ 所有测试通过！")
        return True
        
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False

if __name__ == "__main__":
    test_blockchain_connection() 