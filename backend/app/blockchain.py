"""
区块链服务模块 - FISCO BCOS集成
"""
from typing import Optional, Dict, Any
import logging
import json
import hashlib
from datetime import datetime

from .config import settings
from . import models

logger = logging.getLogger(__name__)

class BlockchainService:
    """区块链服务类，用于与FISCO BCOS联盟链交互"""
    
    def __init__(self):
        self.enabled = settings.blockchain_enabled
        self.node_url = settings.blockchain_node_url
        self.private_key = settings.blockchain_private_key
        self.points_contract_address = settings.points_contract_address
        self.contribution_contract_address = settings.contribution_contract_address
        
        if self.enabled:
            self._init_blockchain_client()
    
    def _init_blockchain_client(self):
        """初始化区块链客户端"""
        try:
            # 这里应该初始化FISCO BCOS Python SDK客户端
            # 由于示例目的，我们使用模拟实现
            logger.info("初始化FISCO BCOS客户端")
            # from eth_account import Account
            # from web3 import Web3
            # self.web3 = Web3(Web3.HTTPProvider(self.node_url))
            # self.account = Account.from_key(self.private_key)
        except Exception as e:
            logger.error(f"初始化区块链客户端失败: {e}")
            self.enabled = False
    
    def record_points_transaction(self, user_id: int, points: int, action: str, description: str) -> Optional[Dict[str, Any]]:
        """记录积分交易到区块链"""
        if not self.enabled:
            logger.warning("区块链功能未启用，跳过积分记录")
            return None
        
        try:
            # 生成交易数据
            transaction_data = {
                "user_id": user_id,
                "points": points,
                "action": action,
                "description": description,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # 计算数据哈希
            data_hash = hashlib.sha256(json.dumps(transaction_data, sort_keys=True).encode()).hexdigest()
            
            # 模拟区块链交易
            # 在实际实现中，这里应该调用智能合约
            result = self._send_transaction("recordPoints", transaction_data)
            
            if result:
                logger.info(f"积分交易已记录到区块链: {data_hash}")
                return {
                    "transaction_hash": result.get("transaction_hash"),
                    "block_number": result.get("block_number"),
                    "gas_used": result.get("gas_used"),
                    "data_hash": data_hash
                }
        except Exception as e:
            logger.error(f"记录积分交易失败: {e}")
        
        return None
    
    def record_contribution(self, user_id: int, content_id: int, contribution_type: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """记录用户贡献到区块链"""
        if not self.enabled:
            logger.warning("区块链功能未启用，跳过贡献记录")
            return None
        
        try:
            # 生成贡献数据
            contribution_data = {
                "user_id": user_id,
                "content_id": content_id,
                "contribution_type": contribution_type,
                "data": data,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # 计算数据哈希
            data_hash = hashlib.sha256(json.dumps(contribution_data, sort_keys=True).encode()).hexdigest()
            
            # 模拟区块链交易
            result = self._send_transaction("recordContribution", contribution_data)
            
            if result:
                logger.info(f"贡献记录已上链: {data_hash}")
                return {
                    "transaction_hash": result.get("transaction_hash"),
                    "block_number": result.get("block_number"),
                    "gas_used": result.get("gas_used"),
                    "data_hash": data_hash
                }
        except Exception as e:
            logger.error(f"记录贡献失败: {e}")
        
        return None
    
    def verify_record(self, transaction_hash: str) -> Optional[Dict[str, Any]]:
        """验证区块链记录"""
        if not self.enabled:
            return None
        
        try:
            # 模拟查询区块链记录
            # 在实际实现中，这里应该查询区块链交易
            result = self._query_transaction(transaction_hash)
            
            if result:
                return {
                    "verified": True,
                    "block_number": result.get("block_number"),
                    "timestamp": result.get("timestamp"),
                    "data": result.get("data")
                }
        except Exception as e:
            logger.error(f"验证记录失败: {e}")
        
        return {"verified": False}
    
    def _send_transaction(self, method: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """发送区块链交易（模拟实现）"""
        # 这是一个模拟实现
        # 在实际项目中，这里应该调用FISCO BCOS智能合约
        import time
        import random
        
        # 模拟交易处理时间
        time.sleep(0.1)
        
        # 模拟交易结果
        if random.random() > 0.1:  # 90%成功率
            return {
                "transaction_hash": f"0x{hashlib.sha256(str(time.time()).encode()).hexdigest()}",
                "block_number": random.randint(1000000, 9999999),
                "gas_used": random.randint(21000, 100000),
                "status": "success"
            }
        else:
            raise Exception("模拟交易失败")
    
    def _query_transaction(self, transaction_hash: str) -> Optional[Dict[str, Any]]:
        """查询区块链交易（模拟实现）"""
        # 这是一个模拟实现
        import random
        
        if random.random() > 0.1:  # 90%成功率
            return {
                "block_number": random.randint(1000000, 9999999),
                "timestamp": datetime.utcnow().isoformat(),
                "data": {"verified": True},
                "status": "success"
            }
        else:
            return None

# 全局区块链服务实例
blockchain_service = BlockchainService()

def record_user_points(user_id: int, points: int, action: models.BlockchainAction, description: str) -> Optional[models.BlockchainRecord]:
    """记录用户积分变化到区块链"""
    result = blockchain_service.record_points_transaction(
        user_id=user_id,
        points=points,
        action=action.value,
        description=description
    )
    
    if result:
        # 创建区块链记录
        record = models.BlockchainRecord(
            user_id=user_id,
            action=action,
            description=description,
            points_amount=points,
            transaction_hash=result.get("transaction_hash"),
            block_number=result.get("block_number"),
            gas_used=result.get("gas_used"),
            is_confirmed=True,
            confirmed_at=datetime.utcnow()
        )
        return record
    
    return None

def record_content_contribution(user_id: int, content_id: int, contribution_data: Dict[str, Any]) -> Optional[models.BlockchainRecord]:
    """记录内容贡献到区块链"""
    result = blockchain_service.record_contribution(
        user_id=user_id,
        content_id=content_id,
        contribution_type="content_publish",
        data=contribution_data
    )
    
    if result:
        # 创建区块链记录
        record = models.BlockchainRecord(
            user_id=user_id,
            content_id=content_id,
            action=models.BlockchainAction.CONTRIBUTION_RECORD,
            description=f"内容贡献记录: {contribution_data.get('title', 'Unknown')}",
            transaction_hash=result.get("transaction_hash"),
            block_number=result.get("block_number"),
            gas_used=result.get("gas_used"),
            is_confirmed=True,
            confirmed_at=datetime.utcnow()
        )
        return record
    
    return None

def verify_blockchain_record(transaction_hash: str) -> bool:
    """验证区块链记录"""
    result = blockchain_service.verify_record(transaction_hash)
    return result and result.get("verified", False)
