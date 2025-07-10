# 🚀 RWA学习平台完整启动指南

## 项目概述

RWA学习平台是一个基于区块链的GitHub贡献积分系统，集成了：
- 前端：React + TypeScript
- 后端：FastAPI + Python
- 数据库：SQLite
- 区块链：FISCO BCOS联盟链
- 智能合约：Solidity

## 📋 前置条件检查

### 1. 系统要求
- **操作系统**: macOS (推荐) 或 Linux
- **Python**: 3.8+
- **Node.js**: 16+
- **Java**: 8+ (用于FISCO BCOS控制台)

### 2. 必需软件安装

#### 安装Homebrew (如果没有)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 安装Java
```bash
# 安装OpenJDK 17
brew install openjdk@17

# 设置Java环境变量
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home' >> ~/.zshrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# 验证安装
java -version
echo $JAVA_HOME
```

## 🛠️ 项目部署步骤

### 1. 克隆项目
```bash
git clone <你的项目仓库地址>
cd RWA学习平台/workspace4
```

### 2. 部署FISCO BCOS区块链

#### 下载FISCO BCOS
```bash
# 进入用户目录
cd ~

# 下载构建脚本
wget https://github.com/FISCO-BCOS/FISCO-BCOS/releases/download/v3.7.0/build_chain.sh
chmod u+x build_chain.sh

# 创建区块链节点
./build_chain.sh -l 127.0.0.1:4 -p 30300,20200,8545

# 启动区块链节点
cd nodes/127.0.0.1
./start_all.sh
```

#### 下载并配置控制台
```bash
# 下载控制台
cd ~
wget https://github.com/FISCO-BCOS/console/releases/download/v3.7.0/download_console.sh
chmod u+x download_console.sh
./download_console.sh

# 配置控制台
cd console
cp -n conf/config-example.toml conf/config.toml
```

### 3. 部署智能合约

#### 进入控制台并创建项目
```bash
cd ~/fisco/console
./start.sh
```

在控制台中执行以下命令：
```bash
# 设置交易Gas限制
call SystemConfig setValueByKey "tx_gas_limit" "300000000"

# 退出控制台
quit
```

#### 部署贡献合约
```bash
# 将合约文件复制到控制台contracts目录
cp /Users/yubai/Project/RWA/RWA学习平台/workspace4/backend/contracts/RWAPlatformContribution.sol ~/fisco/console/contracts/

# 重新进入控制台
cd ~/fisco/console
./start.sh
```

在控制台中执行：
```bash
# 编译合约
compile RWAPlatformContribution.sol

# 部署合约
deploy RWAPlatformContribution

# 记录返回的合约地址，例如：0x37a44585bf1e9618fdb4c62c4c96189a07dd4b48
```

#### 创建项目和分配权限
```bash
# 创建项目
call RWAPlatformContribution createProject "RWA学习平台" "基于区块链的GitHub贡献积分系统"

# 分配权限（将合约调用者设为项目管理员）
call RWAPlatformContribution grantRole "0x你的账户地址" "PROJECT_ADMIN_ROLE"
```

### 4. 配置环境变量

#### 复制环境变量模板
```bash
cd /Users/yubai/Project/RWA/RWA学习平台/workspace4
cp backend/.env.example backend/.env
```

#### 编辑环境变量文件
```bash
vim backend/.env
```

在`.env`文件中设置以下配置：
```env
# 区块链配置
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_NODE_URL=http://127.0.0.1:20200
BLOCKCHAIN_PRIVATE_KEY=你的私钥（64位十六进制字符串）
CONTRIBUTION_CONTRACT_ADDRESS=你部署的合约地址

# 数据库配置
DATABASE_URL=sqlite:///./rwa_platform.db

# GitHub配置
GITHUB_ACCESS_TOKEN=你的GitHub Token

# 其他配置
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 5. 启动完整系统

#### 确保在项目根目录
```bash
cd /Users/yubai/Project/RWA/RWA学习平台/workspace4
```

#### 启动所有服务
```bash
./start_dev.sh
```

## ✅ 验证部署

### 1. 检查服务状态
- **前端**: http://127.0.0.1:5173
- **后端**: http://127.0.0.1:8000
- **API文档**: http://127.0.0.1:8000/docs

### 2. 检查区块链连接
```bash
cd ~/fisco/console
./start.sh
```

在控制台中执行：
```bash
# 获取最新区块号
getBlockNumber

# 检查合约状态
call RWAPlatformContribution getContributionCount
```

### 3. 测试贡献上链功能
1. 访问前端页面：http://127.0.0.1:5173
2. 使用默认账号登录：
   - 管理员: `admin` / `admin123`
   - 审核员: `reviewer` / `reviewer123`
   - 社区管理员: `community` / `community123`
3. 创建项目
4. 提交GitHub贡献
5. 审核贡献
6. 检查数据库中是否有`transaction_hash`

## 🔧 常见问题解决

### 1. Java环境问题

**问题**: 控制台提示"At least Java8 is required"

**解决方案**:
```bash
# 检查Java版本
java -version

# 设置JAVA_HOME
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# 验证设置
echo $JAVA_HOME
java -version
```

### 2. 区块链节点问题

**问题**: 节点无法启动或连接失败

**解决方案**:
```bash
# 检查节点状态
cd ~/fisco/nodes/127.0.0.1
ps aux | grep fisco-bcos

# 重启节点
./stop_all.sh
./start_all.sh

# 检查端口监听
netstat -an | grep 20200
```

### 3. 合约部署问题

**问题**: 合约调用失败或方法不存在

**解决方案**:
```bash
cd ~/fisco/console
./start.sh
```

在控制台中执行：
```bash
# 检查合约是否部署成功
call RWAPlatformContribution getContributionCount

# 检查合约地址是否正确
getContractAddress RWAPlatformContribution

# 重新部署合约（如果需要）
deploy RWAPlatformContribution
```

### 4. 后端服务问题

**问题**: 后端启动失败或无法连接区块链

**解决方案**:
```bash
# 检查环境变量
cd /Users/yubai/Project/RWA/RWA学习平台/workspace4/backend
cat .env

# 检查日志
tail -f logs/app.log

# 重启服务
cd ..
./start_dev.sh
```

### 5. 前端连接问题

**问题**: 前端无法连接后端API

**解决方案**:
```bash
# 检查后端服务状态
curl http://127.0.0.1:8000/docs

# 检查前端代理配置
cat frontend/vite.config.ts
```

## 📊 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (React)   │    │   后端 (FastAPI) │    │   FISCO BCOS    │
│   Port: 5173    │◄──►│   Port: 8000    │◄──►│   Port: 20200   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   数据库 (SQLite)│
                       │   rwa_platform.db│
                       └─────────────────┘
```

## 🎯 功能特性

- ✅ GitHub贡献自动同步
- ✅ 贡献审核和积分发放
- ✅ 区块链上链记录
- ✅ 用户权限管理
- ✅ 项目管理系统
- ✅ 积分排行榜

## 📞 技术支持

如果遇到问题，请检查：
1. 所有服务是否正常启动
2. 环境变量是否正确配置
3. 区块链节点是否正常运行
4. 合约是否成功部署

---

**祝您使用愉快！** 🚀 