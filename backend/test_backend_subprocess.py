#!/usr/bin/env python3
import subprocess
import re
import os
import logging

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_backend_subprocess():
    """模拟后端服务的subprocess调用"""
    
    # 模拟后端服务的参数
    contributor_address = "0x03343Bd3C289ddDbFca84734E96f24Be702eA9ba"
    github_username = "Eleanorbai"
    project_id = 1
    issue_number = 42
    contribution_type = "other"
    points = 5
    issue_title = "测试subprocess调用"
    issue_url = "https://github.com/test/issue/42"
    
    # 处理contributor_address，如果为零地址则使用当前账户地址
    if contributor_address == "0x0000000000000000000000000000000000000000":
        contributor_address = "0x03343Bd3C289ddDbFca84734E96f24Be702eA9ba"
        logger.info(f"使用当前账户地址作为贡献者: {contributor_address}")
    
    # 处理字符串参数，转义特殊字符
    def escape_string(s):
        return s.replace('"', '\\"').replace("'", "\\'")
    
    escaped_github_username = escape_string(github_username)
    escaped_contribution_type = escape_string(contribution_type)
    escaped_issue_title = escape_string(issue_title)
    escaped_issue_url = escape_string(issue_url)
    
    # 构建控制台命令
    contract_address = "0x37a44585bf1e9618fdb4c62c4c96189a07dd4b48"
    console_cmd = f'call RWAPlatformContribution {contract_address} recordContribution {contributor_address} "{escaped_github_username}" {project_id} {issue_number} "{escaped_contribution_type}" {points} "{escaped_issue_title}" "{escaped_issue_url}"'
    
    # 执行控制台命令
    fisco_console_path = "/Users/yubai/fisco/console"
    cmd = f'cd {fisco_console_path} && echo "{console_cmd}" | ./start.sh'
    
    logger.info(f"执行命令: {cmd}")
    logger.info(f"当前工作目录: {os.getcwd()}")
    logger.info(f"环境变量PATH: {os.environ.get('PATH', 'Not set')}")
    
    try:
        # 方式1：使用shell=True
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
        logger.info(f"subprocess returncode: {result.returncode}")
        logger.info(f"subprocess stdout: {result.stdout}")
        logger.info(f"subprocess stderr: {result.stderr}")
        
        if result.returncode == 0:
            # 解析交易哈希
            tx_hash_match = re.search(r'transaction hash: (0x[a-fA-F0-9]+)', result.stdout)
            if tx_hash_match:
                tx_hash = tx_hash_match.group(1)
                logger.info(f"成功获取交易哈希: {tx_hash}")
                return {
                    "transaction_hash": tx_hash,
                    "status": "success"
                }
            else:
                logger.error(f"未找到交易哈希，输出: {result.stdout}")
                return None
        else:
            logger.error(f"命令执行失败，returncode: {result.returncode}")
            return None
            
    except subprocess.TimeoutExpired:
        logger.error("subprocess执行超时")
        return None
    except Exception as e:
        logger.error(f"subprocess执行异常: {e}")
        return None

if __name__ == "__main__":
    result = test_backend_subprocess()
    print(f"最终结果: {result}") 