"""
区块链事件监听服务
用于监听智能合约事件并处理后续业务逻辑
"""
import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime

from .blockchain import blockchain_service, handle_contribution_event
from .database import get_db
from . import crud, models

logger = logging.getLogger(__name__)

class BlockchainEventListener:
    """区块链事件监听器"""
    
    def __init__(self):
        self.is_running = False
        self.event_handlers = {
            'ContributionRecorded': self._handle_contribution_recorded,
            'ContributorRegistered': self._handle_contributor_registered,
            'ProjectCreated': self._handle_project_created,
            'ContributionVerified': self._handle_contribution_verified,
            'RoleAssigned': self._handle_role_assigned,
            'WhitelistUpdated': self._handle_whitelist_updated
        }
    
    async def start_listening(self):
        """开始监听区块链事件"""
        if self.is_running:
            logger.warning("事件监听器已在运行")
            return
        
        self.is_running = True
        logger.info("开始监听区块链事件...")
        
        try:
            while self.is_running:
                # 监听贡献事件
                await self._listen_contribution_events()
                
                # 等待一段时间再继续监听
                await asyncio.sleep(5)
                
        except Exception as e:
            logger.error(f"事件监听过程中发生错误: {e}")
            self.is_running = False
    
    async def stop_listening(self):
        """停止监听"""
        self.is_running = False
        logger.info("停止监听区块链事件")
    
    async def _listen_contribution_events(self):
        """监听贡献相关事件"""
        try:
            # 这里应该调用区块链服务的事件监听
            # 由于异步限制，暂时使用同步方式
            if blockchain_service.enabled and blockchain_service.contribution_contract:
                # 获取最新事件
                events = await self._get_latest_events()
                
                for event in events:
                    await self._process_event(event)
                    
        except Exception as e:
            logger.error(f"监听贡献事件失败: {e}")
    
    async def _get_latest_events(self) -> list:
        """获取最新事件（模拟实现）"""
        # 这里应该调用区块链服务获取最新事件
        # 暂时返回空列表
        return []
    
    async def _process_event(self, event: Dict[str, Any]):
        """处理事件"""
        try:
            event_name = event.get('event')
            if event_name in self.event_handlers:
                await self.event_handlers[event_name](event)
            else:
                logger.warning(f"未知事件类型: {event_name}")
                
        except Exception as e:
            logger.error(f"处理事件失败: {e}")
    
    async def _handle_contribution_recorded(self, event: Dict[str, Any]):
        """处理贡献记录事件"""
        try:
            args = event.get('args', {})
            contribution_id = args.get('contributionId')
            contributor = args.get('contributor')
            github_username = args.get('githubUsername')
            project_id = args.get('projectId')
            points = args.get('points')
            contribution_type = args.get('contributionType')
            recorded_by = args.get('recordedBy')
            
            logger.info(f"收到贡献记录事件: ID={contribution_id}, 贡献者={contributor}, 积分={points}")
            
            # 更新数据库中的贡献记录状态
            await self._update_contribution_status(contribution_id, contributor, points)
            
            # 发送通知
            await self._send_contribution_notification(contribution_id, contributor, points)
            
        except Exception as e:
            logger.error(f"处理贡献记录事件失败: {e}")
    
    async def _handle_contributor_registered(self, event: Dict[str, Any]):
        """处理贡献者注册事件"""
        try:
            args = event.get('args', {})
            contributor = args.get('contributor')
            github_username = args.get('githubUsername')
            contributor_type = args.get('contributorType')
            
            logger.info(f"收到贡献者注册事件: {contributor}, GitHub={github_username}")
            
            # 更新贡献者资料
            await self._update_contributor_profile(contributor, github_username, contributor_type)
            
        except Exception as e:
            logger.error(f"处理贡献者注册事件失败: {e}")
    
    async def _handle_project_created(self, event: Dict[str, Any]):
        """处理项目创建事件"""
        try:
            args = event.get('args', {})
            project_id = args.get('projectId')
            name = args.get('name')
            github_repo = args.get('githubRepo')
            owner = args.get('owner')
            admin = args.get('admin')
            
            logger.info(f"收到项目创建事件: ID={project_id}, 名称={name}")
            
            # 更新项目信息
            await self._update_project_info(project_id, name, github_repo, owner, admin)
            
        except Exception as e:
            logger.error(f"处理项目创建事件失败: {e}")
    
    async def _handle_contribution_verified(self, event: Dict[str, Any]):
        """处理贡献验证事件"""
        try:
            args = event.get('args', {})
            contribution_id = args.get('contributionId')
            verifier = args.get('verifier')
            
            logger.info(f"收到贡献验证事件: ID={contribution_id}, 验证者={verifier}")
            
            # 更新验证状态
            await self._update_verification_status(contribution_id, verifier)
            
        except Exception as e:
            logger.error(f"处理贡献验证事件失败: {e}")
    
    async def _handle_role_assigned(self, event: Dict[str, Any]):
        """处理角色分配事件"""
        try:
            args = event.get('args', {})
            user = args.get('user')
            role = args.get('role')
            project_id = args.get('projectId')
            
            logger.info(f"收到角色分配事件: 用户={user}, 角色={role}, 项目={project_id}")
            
            # 更新用户角色
            await self._update_user_role(user, role, project_id)
            
        except Exception as e:
            logger.error(f"处理角色分配事件失败: {e}")
    
    async def _handle_whitelist_updated(self, event: Dict[str, Any]):
        """处理白名单更新事件"""
        try:
            args = event.get('args', {})
            user = args.get('user')
            is_whitelisted = args.get('isWhitelisted')
            
            logger.info(f"收到白名单更新事件: 用户={user}, 状态={is_whitelisted}")
            
            # 更新白名单状态
            await self._update_whitelist_status(user, is_whitelisted)
            
        except Exception as e:
            logger.error(f"处理白名单更新事件失败: {e}")
    
    async def _update_contribution_status(self, contribution_id: int, contributor: str, points: int):
        """更新贡献状态"""
        try:
            # 这里应该更新数据库中的贡献记录
            # 由于异步限制，暂时使用同步方式
            db = next(get_db())
            
            # 查找对应的贡献记录
            contribution = crud.get_github_contribution_by_blockchain_id(db, contribution_id)
            if contribution:
                # 更新状态为已上链
                update_data = models.GitHubContributionUpdate(
                    blockchain_hash=f"0x{contribution_id:064x}",
                    status=models.ContributionStatus.ACCEPTED
                )
                crud.update_github_contribution(db, contribution.id, update_data)
                logger.info(f"更新贡献记录状态: {contribution_id}")
            
        except Exception as e:
            logger.error(f"更新贡献状态失败: {e}")
    
    async def _send_contribution_notification(self, contribution_id: int, contributor: str, points: int):
        """发送贡献通知"""
        try:
            # 这里应该发送通知给相关用户
            logger.info(f"发送贡献通知: 贡献ID={contribution_id}, 贡献者={contributor}, 积分={points}")
            
        except Exception as e:
            logger.error(f"发送贡献通知失败: {e}")
    
    async def _update_contributor_profile(self, contributor: str, github_username: str, contributor_type: str):
        """更新贡献者资料"""
        try:
            # 这里应该更新贡献者资料
            logger.info(f"更新贡献者资料: {contributor}, GitHub={github_username}")
            
        except Exception as e:
            logger.error(f"更新贡献者资料失败: {e}")
    
    async def _update_project_info(self, project_id: int, name: str, github_repo: str, owner: str, admin: str):
        """更新项目信息"""
        try:
            # 这里应该更新项目信息
            logger.info(f"更新项目信息: ID={project_id}, 名称={name}")
            
        except Exception as e:
            logger.error(f"更新项目信息失败: {e}")
    
    async def _update_verification_status(self, contribution_id: int, verifier: str):
        """更新验证状态"""
        try:
            # 这里应该更新验证状态
            logger.info(f"更新验证状态: 贡献ID={contribution_id}, 验证者={verifier}")
            
        except Exception as e:
            logger.error(f"更新验证状态失败: {e}")
    
    async def _update_user_role(self, user: str, role: str, project_id: int):
        """更新用户角色"""
        try:
            # 这里应该更新用户角色
            logger.info(f"更新用户角色: 用户={user}, 角色={role}, 项目={project_id}")
            
        except Exception as e:
            logger.error(f"更新用户角色失败: {e}")
    
    async def _update_whitelist_status(self, user: str, is_whitelisted: bool):
        """更新白名单状态"""
        try:
            # 这里应该更新白名单状态
            logger.info(f"更新白名单状态: 用户={user}, 状态={is_whitelisted}")
            
        except Exception as e:
            logger.error(f"更新白名单状态失败: {e}")

# 全局事件监听器实例
event_listener = BlockchainEventListener()

async def start_event_listener():
    """启动事件监听器"""
    await event_listener.start_listening()

async def stop_event_listener():
    """停止事件监听器"""
    await event_listener.stop_listening()

def start_event_listener_sync():
    """同步启动事件监听器"""
    asyncio.run(start_event_listener())

def stop_event_listener_sync():
    """同步停止事件监听器"""
    asyncio.run(stop_event_listener()) 