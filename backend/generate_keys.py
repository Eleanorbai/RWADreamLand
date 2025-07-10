#!/usr/bin/env python3
"""
密钥生成脚本
用于生成RWA学习平台所需的各种密钥和配置
"""
import secrets
import os
import sys
from pathlib import Path

def generate_secret_key():
    """生成SECRET_KEY"""
    return secrets.token_urlsafe(32)

def generate_webhook_secret():
    """生成GitHub Webhook密钥"""
    return secrets.token_urlsafe(16)

def check_fisco_account():
    """检查FISCO BCOS账户"""
    fisco_path = os.path.expanduser("~/fisco")
    console_path = os.path.join(fisco_path, "console")
    accounts_path = os.path.join(console_path, "accounts")
    
    if not os.path.exists(console_path):
        print("❌ FISCO BCOS控制台未找到，请先安装FISCO BCOS")
        return None
    
    # 查找账户文件
    account_files = []
    if os.path.exists(accounts_path):
        for file in os.listdir(accounts_path):
            if file.endswith('.txt'):
                account_files.append(file)
    
    if account_files:
        print(f"✅ 找到 {len(account_files)} 个FISCO BCOS账户")
        # 读取第一个账户的私钥
        first_account = os.path.join(accounts_path, account_files[0])
        try:
            with open(first_account, 'r') as f:
                lines = f.readlines()
                for line in lines:
                    if line.startswith('privateKey:'):
                        private_key = line.split(':')[1].strip()
                        return private_key
        except Exception as e:
            print(f"❌ 读取账户文件失败: {e}")
    
    print("❌ 未找到FISCO BCOS账户，请运行以下命令生成:")
    print("cd ~/fisco/console && ./gen_account.sh")
    return None

def create_env_file():
    """创建.env文件"""
    env_file = Path(".env")
    
    if env_file.exists():
        print("⚠️  .env文件已存在，是否覆盖? (y/N): ", end="")
        response = input().strip().lower()
        if response != 'y':
            print("取消操作")
            return False
    
    # 生成密钥
    secret_key = generate_secret_key()
    webhook_secret = generate_webhook_secret()
    fisco_private_key = check_fisco_account()
    
    # 读取模板
    template_file = Path("env.example")
    if not template_file.exists():
        print("❌ env.example文件不存在")
        return False
    
    with open(template_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 替换密钥
    content = content.replace('your-secret-key-here', secret_key)
    content = content.replace('rwa123456', webhook_secret)
    
    if fisco_private_key:
        content = content.replace('your-private-key-here', fisco_private_key)
    
    # 写入.env文件
    with open(env_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ .env文件创建成功")
    return True

def print_manual_steps():
    """打印手动配置步骤"""
    print("\n" + "="*50)
    print("手动配置步骤")
    print("="*50)
    
    print("\n1. GitHub Token配置:")
    print("   - 访问: https://github.com/settings/tokens")
    print("   - 点击: Generate new token (classic)")
    print("   - 选择权限: repo, workflow, admin:org")
    print("   - 复制生成的token到.env文件的GITHUB_TOKEN")
    
    print("\n2. FISCO BCOS私钥配置:")
    print("   - 如果自动检测失败，请手动运行:")
    print("     cd ~/fisco/console && ./gen_account.sh")
    print("   - 查看生成的账户文件:")
    print("     cat ~/fisco/console/accounts/account1.txt")
    print("   - 复制privateKey到.env文件的BLOCKCHAIN_PRIVATE_KEY")
    
    print("\n3. 合约地址配置:")
    print("   - 部署合约后会自动更新.env文件")
    print("   - 或手动运行: python deploy_contract.py")
    
    print("\n4. 服务器配置:")
    print("   - HOST=0.0.0.0 (监听所有网络接口)")
    print("   - PORT=8000 (如果被占用可修改为其他端口)")
    print("   - 如果使用ngrok，建议保持默认配置")

def main():
    """主函数"""
    print("🔑 RWA学习平台密钥生成工具")
    print("="*30)
    
    # 检查当前目录
    if not os.path.exists("app"):
        print("❌ 请在backend目录下运行此脚本")
        sys.exit(1)
    
    # 创建.env文件
    if create_env_file():
        print("\n✅ 自动配置完成")
        print_manual_steps()
    else:
        print("\n❌ 自动配置失败")
        print_manual_steps()

if __name__ == "__main__":
    main() 