#!/bin/bash

# RWA贡献合约部署脚本

echo "开始部署RWAPlatformContribution合约..."

# 1. 复制合约到FISCO控制台
echo "1. 复制合约文件..."
cp contracts/RWAPlatformContribution.sol /Users/yubai/fisco/console/contracts/solidity/

# 2. 进入FISCO控制台目录
cd /Users/yubai/fisco/console

# 3. 部署合约
echo "2. 部署合约..."
./console.sh deploy contracts/solidity/RWAPlatformContribution.sol

echo "部署完成！"
echo "请记录合约地址并更新环境变量 CONTRIBUTION_CONTRACT_ADDRESS" 