#!/bin/bash

# RWA Dream Land 部署脚本
# 用于快速部署前后端应用

set -e

echo "🚀 开始部署 RWA Dream Land..."

# 检查必要的命令
command -v node >/dev/null 2>&1 || { echo "❌ Node.js 未安装"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python3 未安装"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker 未安装"; exit 1; }

# 设置变量
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
ENV_FILE="$BACKEND_DIR/.env"

echo "📋 检查环境配置..."

# 检查后端环境配置
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  创建后端环境配置文件..."
    cp "$BACKEND_DIR/.env.example" "$ENV_FILE"
    echo "✅ 请编辑 $ENV_FILE 文件并设置正确的数据库连接和密钥"
    echo "⏸️  部署暂停，请配置环境变量后重新运行"
    exit 1
fi

echo "🐘 启动PostgreSQL数据库..."
if ! docker-compose ps | grep -q postgres; then
    docker-compose up -d postgres
    echo "⏳ 等待数据库启动..."
    sleep 10
else
    echo "✅ PostgreSQL已在运行"
fi

echo "🔧 安装后端依赖..."
cd "$BACKEND_DIR"
if [ ! -d "venv" ]; then
    echo "📦 创建Python虚拟环境..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

echo "🗄️  初始化数据库..."
python -c "
from app.database import init_db
try:
    init_db()
    print('✅ 数据库初始化成功')
except Exception as e:
    print(f'❌ 数据库初始化失败: {e}')
    exit(1)
"

echo "🖥️  启动后端服务..."
nohup python start.py > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"

cd ..

echo "🎨 安装前端依赖..."
cd "$FRONTEND_DIR"

# 检查包管理器
if command -v pnpm >/dev/null 2>&1; then
    PACKAGE_MANAGER="pnpm"
elif command -v yarn >/dev/null 2>&1; then
    PACKAGE_MANAGER="yarn"
else
    PACKAGE_MANAGER="npm"
fi

echo "📦 使用 $PACKAGE_MANAGER 安装依赖..."
$PACKAGE_MANAGER install

echo "🏗️  构建前端应用..."
$PACKAGE_MANAGER run build

echo "🌐 启动前端服务..."
nohup $PACKAGE_MANAGER run preview > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"

cd ..

# 保存进程ID
echo $BACKEND_PID > backend.pid
echo $FRONTEND_PID > frontend.pid

echo ""
echo "🎉 部署完成！"
echo ""
echo "📡 访问地址:"
echo "   前端应用: http://localhost:4173"
echo "   后端API: http://localhost:8000"
echo "   API文档: http://localhost:8000/docs"
echo ""
echo "📜 日志文件:"
echo "   后端日志: backend.log"
echo "   前端日志: frontend.log"
echo ""
echo "🛑 停止服务:"
echo "   运行: ./stop.sh"
echo ""
echo "💡 提示:"
echo "   - 确保PostgreSQL数据库正常运行"
echo "   - 检查环境变量配置是否正确"
echo "   - 如有问题请查看日志文件"
