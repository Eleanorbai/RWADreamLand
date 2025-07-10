#!/usr/bin/env python3
import subprocess
import re

def test_subprocess():
    console_cmd = 'call RWAPlatformContribution 0x37a44585bf1e9618fdb4c62c4c96189a07dd4b48 recordContribution 0x03343Bd3C289ddDbFca84734E96f24Be702eA9ba "testuser" 1 41 "test" 5 "测试标题" "https://test.com"'
    
    fisco_console_path = "/Users/yubai/fisco/console"
    cmd = f'cd {fisco_console_path} && echo "{console_cmd}" | ./start.sh'
    
    print(f"执行命令: {cmd}")
    
    try:
        # 方式1：使用shell=True
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
        print(f"returncode: {result.returncode}")
        print(f"stdout: {result.stdout}")
        print(f"stderr: {result.stderr}")
        
        if result.returncode == 0:
            # 解析交易哈希
            tx_hash_match = re.search(r'transaction hash: (0x[a-fA-F0-9]+)', result.stdout)
            if tx_hash_match:
                tx_hash = tx_hash_match.group(1)
                print(f"成功获取交易哈希: {tx_hash}")
            else:
                print("未找到交易哈希")
        else:
            print("命令执行失败")
            
    except Exception as e:
        print(f"执行异常: {e}")

if __name__ == "__main__":
    test_subprocess() 