"""
GitHub集成服务模块
"""
import requests
import hashlib
import hmac
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

from .config import settings
from . import models, crud
from .database import get_db
from sqlmodel import Session

logger = logging.getLogger(__name__)

class GitHubService:
    """GitHub集成服务类"""
    
    def __init__(self):
        self.token = settings.github_token
        self.webhook_secret = settings.github_webhook_secret
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "RWA-Dream-Land-Bot"
        }
    
    def verify_webhook_signature(self, payload_body: bytes, signature_header: str) -> bool:
        """验证GitHub Webhook签名"""
        if not self.webhook_secret:
            logger.warning("GitHub webhook secret not configured")
            return False
        
        expected_signature = hmac.new(
            self.webhook_secret.encode('utf-8'),
            payload_body,
            hashlib.sha256
        ).hexdigest()
        
        # GitHub的签名格式是 "sha256=<hash>"
        if not signature_header.startswith('sha256='):
            return False
        
        provided_signature = signature_header[7:]  # 移除 "sha256=" 前缀
        
        return hmac.compare_digest(expected_signature, provided_signature)
    
    def process_webhook_event(self, event_type: str, payload: Dict[str, Any], db: Session) -> Optional[models.GitHubContribution]:
        """处理GitHub Webhook事件"""
        logger.info(f"Processing GitHub webhook event: {event_type}")
        
        if event_type == "issues":
            return self._process_issue_event(payload, db)
        elif event_type == "issue_comment":
            return self._process_issue_comment_event(payload, db)
        else:
            logger.info(f"Unhandled event type: {event_type}")
            return None
    
    def _process_issue_event(self, payload: Dict[str, Any], db: Session) -> Optional[models.GitHubContribution]:
        """处理Issue事件"""
        action = payload.get("action")
        issue = payload.get("issue", {})
        repository = payload.get("repository", {})
        
        if action not in ["opened", "closed", "reopened"]:
            return None
        
        # 获取或创建项目记录
        repo_url = repository.get("html_url", "")
        project = crud.get_open_project_by_repo(db, repo_url)
        
        if not project:
            logger.warning(f"Project not found for repository: {repo_url}")
            return None
        
        # 检查是否已存在该Issue的贡献记录
        issue_number = issue.get("number")
        existing_contribution = crud.get_github_contribution_by_issue(db, project.id, issue_number)
        
        if existing_contribution:
            # 更新现有记录的状态
            if action == "closed" and issue.get("state") == "closed":
                update_data = models.GitHubContributionUpdate(
                    status=models.ContributionStatus.ACCEPTED,
                    accepted_at=datetime.utcnow()
                )
                return crud.update_github_contribution(db, existing_contribution.id, update_data)
            return existing_contribution
        
        # 创建新的贡献记录（仅处理新开的Issue）
        if action == "opened":
            contribution_type = self._determine_contribution_type(issue)
            points = settings.contribution_points.get(contribution_type.value, 5)
            
            contribution_data = models.GitHubContributionCreate(
                project_id=project.id,
                github_username=issue.get("user", {}).get("login", ""),
                issue_number=issue_number,
                issue_title=issue.get("title", ""),
                issue_url=issue.get("html_url", ""),
                contribution_type=contribution_type,
                contribution_points=points,
                status=models.ContributionStatus.PENDING,
                github_created_at=datetime.fromisoformat(issue.get("created_at", "").replace("Z", "+00:00"))
            )
            
            return crud.create_github_contribution(db, contribution_data)
        
        return None
    
    def _process_issue_comment_event(self, payload: Dict[str, Any], db: Session) -> Optional[models.GitHubContribution]:
        """处理Issue评论事件"""
        # 这里可以实现评论相关的贡献逻辑
        # 比如，管理员在评论中@某人或使用特定标签来接受贡献
        logger.info("Issue comment event received, processing...")
        return None
    
    def _determine_contribution_type(self, issue: Dict[str, Any]) -> models.ContributionType:
        """根据Issue内容判断贡献类型"""
        title = issue.get("title", "").lower()
        body = issue.get("body", "").lower()
        labels = [label.get("name", "").lower() for label in issue.get("labels", [])]
        
        # 通过标签判断
        if "bug" in labels:
            return models.ContributionType.BUG_REPORT
        elif "enhancement" in labels or "feature" in labels:
            return models.ContributionType.FEATURE_REQUEST
        elif "documentation" in labels or "docs" in labels:
            return models.ContributionType.DOCUMENTATION
        elif "ui" in labels or "ux" in labels:
            return models.ContributionType.UI_UX_IMPROVEMENT
        elif "test" in labels:
            return models.ContributionType.TESTING
        
        # 通过标题和内容判断
        if "bug" in title or "error" in title or "issue" in title:
            return models.ContributionType.BUG_REPORT
        elif "feature" in title or "request" in title or "enhancement" in title:
            return models.ContributionType.FEATURE_REQUEST
        elif "doc" in title or "readme" in title:
            return models.ContributionType.DOCUMENTATION
        elif "ui" in title or "ux" in title or "design" in title:
            return models.ContributionType.UI_UX_IMPROVEMENT
        elif "test" in title:
            return models.ContributionType.TESTING
        
        return models.ContributionType.OTHER
    
    def get_repository_info(self, repo_url: str) -> Optional[Dict[str, Any]]:
        """获取GitHub仓库信息"""
        try:
            # 从URL提取owner和repo名称
            parts = repo_url.replace("https://github.com/", "").split("/")
            if len(parts) >= 2:
                owner = parts[0]
                repo = parts[1].replace(".git", "")
                
                url = f"{self.base_url}/repos/{owner}/{repo}"
                response = requests.get(url, headers=self.headers)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to get repository info: {response.status_code}")
        except Exception as e:
            logger.error(f"Error getting repository info: {e}")
        
        return None
    
    def get_repository_issues(self, repo_url: str, state: str = "all", per_page: int = 100) -> List[Dict[str, Any]]:
        """获取仓库的Issues列表"""
        try:
            parts = repo_url.replace("https://github.com/", "").split("/")
            if len(parts) >= 2:
                owner = parts[0]
                repo = parts[1].replace(".git", "")
                
                url = f"{self.base_url}/repos/{owner}/{repo}/issues"
                params = {
                    "state": state,
                    "per_page": per_page,
                    "sort": "created",
                    "direction": "desc"
                }
                
                response = requests.get(url, headers=self.headers, params=params)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to get repository issues: {response.status_code}")
        except Exception as e:
            logger.error(f"Error getting repository issues: {e}")
        
        return []
    
    def sync_project_contributions(self, project_id: int, db: Session) -> int:
        """同步项目的GitHub贡献"""
        project = crud.get_open_project(db, project_id)
        if not project:
            return 0
        
        # 获取GitHub Issues
        issues = self.get_repository_issues(project.github_repo)
        synced_count = 0
        
        for issue in issues:
            # 检查是否已存在
            existing = crud.get_github_contribution_by_issue(db, project_id, issue.get("number"))
            if existing:
                continue
            
            # 创建贡献记录
            contribution_type = self._determine_contribution_type(issue)
            points = settings.contribution_points.get(contribution_type.value, 5)
            
            # 根据Issue状态设置贡献状态
            status = models.ContributionStatus.ACCEPTED if issue.get("state") == "closed" else models.ContributionStatus.PENDING
            
            contribution_data = models.GitHubContributionCreate(
                project_id=project_id,
                github_username=issue.get("user", {}).get("login", ""),
                issue_number=issue.get("number"),
                issue_title=issue.get("title", ""),
                issue_url=issue.get("html_url", ""),
                contribution_type=contribution_type,
                contribution_points=points,
                status=status,
                github_created_at=datetime.fromisoformat(issue.get("created_at", "").replace("Z", "+00:00"))
            )
            
            try:
                crud.create_github_contribution(db, contribution_data)
                synced_count += 1
            except Exception as e:
                logger.error(f"Error creating contribution record: {e}")
        
        logger.info(f"Synced {synced_count} contributions for project {project_id}")
        return synced_count

# 全局GitHub服务实例
github_service = GitHubService()
