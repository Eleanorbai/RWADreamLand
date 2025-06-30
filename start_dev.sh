#!/bin/bash

# RWA Dream Land 开发环境启动脚本

echo "🚀 启动 RWA Dream Land 开发环境"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 Python 环境
echo -e "${BLUE}检查 Python 环境...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 未安装${NC}"
    exit 1
fi

# 检查 Node.js 环境
echo -e "${BLUE}检查 Node.js 环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    exit 1
fi

# 进入项目目录
cd "$(dirname "$0")"

# 启动后端
echo -e "${BLUE}启动后端服务...${NC}"
cd backend

# 安装 Python 依赖
echo -e "${YELLOW}安装 Python 依赖...${NC}"
pip install -r requirements.txt

# 初始化数据库
echo -e "${YELLOW}初始化数据库...${NC}"
python init_db.py

# 启动后端服务（后台运行）
echo -e "${GREEN}启动 FastAPI 服务...${NC}"
python start.py &
BACKEND_PID=$!

# 等待后端启动
sleep 5

# 启动前端
echo -e "${BLUE}启动前端服务...${NC}"
cd ../frontend

# 安装前端依赖
echo -e "${YELLOW}安装前端依赖...${NC}"
npm install

# 启动前端开发服务器
echo -e "${GREEN}启动 React 开发服务器...${NC}"
npm run dev &
FRONTEND_PID=$!

# 等待服务启动
sleep 3

echo -e "${GREEN}"
echo "🎉 RWA Dream Land 开发环境启动完成!"
echo ""
echo "📍 服务地址:"
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:8000"
echo "   API文档: http://localhost:8000/docs"
echo ""
echo "👤 默认账号:"
echo "   管理员: admin / admin123"
echo "   审核员: reviewer / reviewer123"
echo "   社区管理员: community / community123"
echo ""
echo "🔧 停止服务请按 Ctrl+C"
echo -e "${NC}"

# 等待用户中断
trap 'echo -e "\n${YELLOW}正在停止服务...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# 保持脚本运行
wait
