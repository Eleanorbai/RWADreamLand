"""
区块链服务模块 - FISCO BCOS集成
"""
from typing import Optional, Dict, Any, List
import logging
import json
import hashlib
from datetime import datetime
import asyncio
from web3 import Web3
from eth_account import Account
from eth_account.messages import encode_defunct
import requests
import os

from .config import settings
from . import models

logger = logging.getLogger(__name__)

class FISCOBCOSService:
    """FISCO BCOS区块链服务类"""
    
    def __init__(self):
        self.enabled = settings.blockchain_enabled
        self.node_url = settings.blockchain_node_url
        self.private_key = settings.blockchain_private_key
        self.contribution_contract_address = settings.contribution_contract_address
        
        if self.enabled:
            self._init_blockchain_client()
    
    def _init_blockchain_client(self):
        """初始化FISCO BCOS客户端，兼容FISCO BCOS RPC"""
        import requests
        try:
            # 1. 用requests检测节点可用性
            try:
                resp = requests.post(
                    self.node_url,
                    json={
                        "jsonrpc": "2.0",
                        "method": "getBlockNumber",
                        "params": [],
                        "id": 1
                    },
                    headers={"Content-Type": "application/json"},
                    timeout=5
                )
                if resp.status_code == 200 and "result" in resp.json():
                    logger.info(f"FISCO BCOS节点可用，区块号: {resp.json()['result']}")
                else:
                    raise Exception(f"FISCO BCOS节点响应异常: {resp.text}")
            except Exception as e:
                logger.error(f"FISCO BCOS节点不可用: {e}")
                raise Exception("无法连接到FISCO BCOS节点")

            # 2. 初始化web3
            self.web3 = Web3(Web3.HTTPProvider(self.node_url))
            # 3. 设置账户
            if self.private_key:
                self.account = Account.from_key(self.private_key)
                self.web3.eth.default_account = self.account.address
                logger.info(f"区块链账户地址: {self.account.address}")
            else:
                logger.warning("未配置私钥，将使用默认账户")
            # 4. 加载合约ABI
            self._load_contract_abi()
            logger.info("FISCO BCOS客户端初始化成功")
        except Exception as e:
            logger.error(f"初始化区块链客户端失败: {e}")
            self.enabled = False
    
    def _load_contract_abi(self):
        """加载合约ABI"""
        try:
            # 这里应该从编译后的合约文件中加载ABI
            # 暂时使用简化的ABI
            self.contribution_abi = [
                {
                    "inputs": [
                        {"name": "_contributor", "type": "address"},
                        {"name": "_githubUsername", "type": "string"},
                        {"name": "_projectId", "type": "uint256"},
                        {"name": "_issueNumber", "type": "uint256"},
                        {"name": "_contributionType", "type": "string"},
                        {"name": "_points", "type": "uint256"},
                        {"name": "_issueTitle", "type": "string"},
                        {"name": "_issueUrl", "type": "string"}
                    ],
                    "name": "recordContribution",
                    "outputs": [{"name": "", "type": "uint256"}],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "anonymous": False,
                    "inputs": [
                        {"indexed": True, "name": "contributionId", "type": "uint256"},
                        {"indexed": True, "name": "contributor", "type": "address"},
                        {"indexed": False, "name": "githubUsername", "type": "string"},
                        {"indexed": True, "name": "projectId", "type": "uint256"},
                        {"indexed": False, "name": "points", "type": "uint256"},
                        {"indexed": False, "name": "contributionType", "type": "string"},
                        {"indexed": False, "name": "recordedBy", "type": "address"}
                    ],
                    "name": "ContributionRecorded",
                    "type": "event"
                }
            ]
            
            if self.contribution_contract_address:
                # 将合约地址转换为checksum格式
                checksum_address = Web3.to_checksum_address(self.contribution_contract_address)
                self.contribution_contract = self.web3.eth.contract(
                    address=checksum_address,
                    abi=self.contribution_abi
                )
                logger.info(f"贡献合约地址: {checksum_address}")
            else:
                logger.warning("未配置贡献合约地址")
                
        except Exception as e:
            logger.error(f"加载合约ABI失败: {e}")
            self.enabled = False
    
    def deploy_contribution_contract(self) -> Optional[str]:
        """部署贡献合约"""
        if not self.enabled:
            logger.error("区块链功能未启用")
            return None
        
        try:
            # 使用环境变量中的合约地址
            contract_address = settings.contribution_contract_address
            if contract_address and contract_address != "your_contract_address_here":
                logger.info(f"使用已部署的合约地址: {contract_address}")
                return contract_address
            else:
                logger.error("未配置有效的合约地址")
                return None
        except Exception as e:
            logger.error(f"获取合约地址失败: {e}")
            return None
    
    def record_contribution_on_chain(
        self,
        contributor_address: str,
        github_username: str,
        project_id: int,
        issue_number: int,
        contribution_type: str,
        points: int,
        issue_title: str,
        issue_url: str
    ) -> Optional[Dict[str, Any]]:
        """记录贡献到区块链"""
        if not self.enabled:
            logger.error("区块链功能未启用")
            return None
        
        try:
            logger.info("准备调用链上recordContribution方法")
            
            # 使用FISCO BCOS控制台调用合约
            import subprocess
            import json
            import re
            
            # 处理contributor_address，如果为零地址则使用当前账户地址
            if contributor_address == "0x0000000000000000000000000000000000000000":
                contributor_address = self.account.address
                logger.info(f"使用当前账户地址作为贡献者: {contributor_address}")
            
            # 处理字符串参数，转义特殊字符
            def escape_string(s):
                return s.replace('"', '\\"').replace("'", "\\'")
            
            escaped_github_username = escape_string(github_username)
            escaped_contribution_type = escape_string(contribution_type)
            escaped_issue_title = escape_string(issue_title)
            escaped_issue_url = escape_string(issue_url)
            
            # 构建控制台命令
            console_cmd = f'call RWAPlatformContribution {self.contribution_contract_address} recordContribution {contributor_address} "{escaped_github_username}" {project_id} {issue_number} "{escaped_contribution_type}" {points} "{escaped_issue_title}" "{escaped_issue_url}"'
            
            # 执行控制台命令
            fisco_console_path = "/Users/yubai/fisco/console"
            cmd = f'cd {fisco_console_path} && echo "{console_cmd}" | ./start.sh'
            
            logger.info(f"执行命令: {cmd}")
            
            # 尝试不同的执行方式
            try:
                # 方式1：使用shell=True，并设置JAVA_HOME
                env = os.environ.copy()
                # 尝试设置JAVA_HOME
                java_home_candidates = [
                    "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
                    "/usr/local/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home",
                    "/Library/Java/JavaVirtualMachines/openjdk-17.jdk/Contents/Home"
                ]
                
                for java_home in java_home_candidates:
                    if os.path.exists(java_home):
                        env['JAVA_HOME'] = java_home
                        env['PATH'] = f"{java_home}/bin:{env.get('PATH', '')}"
                        logger.info(f"设置JAVA_HOME: {java_home}")
                        break
                    else:
                        logger.warning("未找到Java安装，尝试使用系统默认Java")
                
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60, env=env)
                logger.info(f"subprocess returncode: {result.returncode}")
                logger.info(f"subprocess stdout (raw): {repr(result.stdout)}")
                logger.info(f"subprocess stderr (raw): {repr(result.stderr)}")
                
                if result.returncode != 0:
                    # 方式2：尝试不使用shell
                    logger.info("尝试不使用shell的方式...")
                    cmd_parts = ['bash', '-c', f'cd {fisco_console_path} && echo "{console_cmd}" | ./start.sh']
                    result = subprocess.run(cmd_parts, capture_output=True, text=True, timeout=60, env=env)
                    logger.info(f"方式2 returncode: {result.returncode}")
                    logger.info(f"方式2 stdout (raw): {repr(result.stdout)}")
                    logger.info(f"方式2 stderr (raw): {repr(result.stderr)}")
                
                if result.returncode == 0:
                    output = result.stdout
                    logger.info(f"控制台输出: {output}")
                    
                    # 解析交易哈希
                    tx_hash_match = re.search(r'transaction hash: (0x[a-fA-F0-9]+)', output)
                    if tx_hash_match:
                        tx_hash = tx_hash_match.group(1)
                        logger.info(f"贡献记录上链成功，交易哈希: {tx_hash}")
                        
                        # 解析区块号
                        block_match = re.search(r'blockNumber:(\d+)', output)
                        block_number = int(block_match.group(1)) if block_match else None
                        
                        # 解析gas使用量
                        gas_match = re.search(r'gasUsed:(\d+)', output)
                        gas_used = int(gas_match.group(1)) if gas_match else None
                        
                        return {
                            "transaction_hash": tx_hash,
                            "block_number": block_number,
                            "gas_used": gas_used,
                            "status": "success"
                        }
                    else:
                        logger.error(f"未找到交易哈希，输出: {output}")
                        return None
                else:
                    logger.error(f"控制台命令执行失败: {result.stderr}")
                    logger.error(f"subprocess returncode: {result.returncode}")
                    logger.error(f"subprocess stdout: {result.stdout}")
                    return None
                    
            except subprocess.TimeoutExpired:
                logger.error("subprocess执行超时")
                return None
            except Exception as e:
                logger.error(f"subprocess执行异常: {e}")
                return None
                
        except Exception as e:
            logger.error(f"记录贡献到区块链失败: {e}")
            return None
    
    def get_contribution_from_chain(self, contribution_id: int) -> Optional[Dict[str, Any]]:
        """从区块链获取贡献信息"""
        if not self.enabled or not self.contribution_contract:
            return None
        
        try:
            # 调用合约的getContribution函数
            contribution = self.contribution_contract.functions.getContribution(contribution_id).call()
            
            return {
                "id": contribution[0],
                "contributor": contribution[1],
                "githubUsername": contribution[2],
                "projectName": contribution[3],
                "issueNumber": contribution[4],
                "contributionType": contribution[5],
                "points": contribution[6],
                "timestamp": contribution[7],
                "isVerified": contribution[8],
                "issueTitle": contribution[9],
                "issueUrl": contribution[10],
                "recordedBy": contribution[11]
            }
        except Exception as e:
            logger.error(f"从区块链获取贡献信息失败: {e}")
            return None
    
    def verify_transaction(self, transaction_hash: str) -> Optional[Dict[str, Any]]:
        """验证交易"""
        if not self.enabled:
            return None
        
        try:
            # 获取交易收据
            tx_receipt = self.web3.eth.get_transaction_receipt(transaction_hash)
            
            if tx_receipt and tx_receipt.status == 1:
                # 获取交易详情
                tx = self.web3.eth.get_transaction(transaction_hash)
                
                return {
                    "verified": True,
                    "block_number": tx_receipt.blockNumber,
                    "gas_used": tx_receipt.gasUsed,
                    "timestamp": self.web3.eth.get_block(tx_receipt.blockNumber).timestamp,
                    "from": tx['from'],
                    "to": tx['to']
                }
            else:
                return {"verified": False}
                
        except Exception as e:
            logger.error(f"验证交易失败: {e}")
            return {"verified": False}
    
    def listen_contribution_events(self, callback):
        """监听贡献事件"""
        if not self.enabled or not self.contribution_contract:
            logger.error("无法监听事件：区块链功能未启用或合约未配置")
            return
        
        try:
            # 获取最新区块
            latest_block = self.web3.eth.block_number
            
            # 监听ContributionRecorded事件
            event_filter = self.contribution_contract.events.ContributionRecorded.create_filter(
                fromBlock=latest_block
            )
            
            logger.info("开始监听贡献事件...")
            
            while True:
                events = event_filter.get_new_entries()
                for event in events:
                    logger.info(f"收到贡献事件: {event}")
                    callback(event)
                
                asyncio.sleep(1)  # 每秒检查一次
                
        except Exception as e:
            logger.error(f"监听事件失败: {e}")

# 全局区块链服务实例
blockchain_service = FISCOBCOSService()

def record_contribution_to_blockchain(
    contributor_address: str,
    github_username: str,
    project_id: int,
    issue_number: int,
    contribution_type: str,
    points: int,
    issue_title: str,
    issue_url: str
) -> Optional[Dict[str, Any]]:
    """记录贡献到区块链"""
    result = blockchain_service.record_contribution_on_chain(
        contributor_address=contributor_address,
        github_username=github_username,
        project_id=project_id,
        issue_number=issue_number,
        contribution_type=contribution_type,
        points=points,
        issue_title=issue_title,
        issue_url=issue_url
    )
    
    if result:
        logger.info(f"贡献已成功上链: {result}")
        return result
    
    return None

def verify_blockchain_transaction(transaction_hash: str) -> bool:
    """验证区块链交易"""
    result = blockchain_service.verify_transaction(transaction_hash)
    return result and result.get("verified", False)

def get_contribution_from_blockchain(contribution_id: int) -> Optional[Dict[str, Any]]:
    """从区块链获取贡献信息"""
    return blockchain_service.get_contribution_from_chain(contribution_id)

def deploy_contract() -> Optional[str]:
    """部署合约"""
    return blockchain_service.deploy_contribution_contract()

# 事件回调处理
def handle_contribution_event(event):
    """处理贡献事件"""
    logger.info(f"处理贡献事件: {event}")
    # 这里可以添加事件处理逻辑，比如更新数据库、发送通知等
    try:
        # 解析事件数据
        contribution_id = event['args']['contributionId']
        contributor = event['args']['contributor']
        github_username = event['args']['githubUsername']
        project_id = event['args']['projectId']
        points = event['args']['points']
        contribution_type = event['args']['contributionType']
        recorded_by = event['args']['recordedBy']
        
        logger.info(f"贡献 {contribution_id} 已上链，贡献者: {contributor}, 积分: {points}")
        
        # 这里可以触发后续处理，比如更新数据库状态、发送通知等
        
    except Exception as e:
        logger.error(f"处理贡献事件失败: {e}")

# 启动事件监听
def start_event_listener():
    """启动事件监听"""
    if blockchain_service.enabled:
        try:
            blockchain_service.listen_contribution_events(handle_contribution_event)
        except Exception as e:
            logger.error(f"启动事件监听失败: {e}")
    else:
        logger.warning("区块链功能未启用，跳过事件监听")
