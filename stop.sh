#!/bin/bash

# RWA Dream Land 停止脚本
# 用于停止前后端服务

echo "🛑 停止 RWA Dream Land 服务..."

# 停止后端服务
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "🔴 停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        rm backend.pid
        echo "✅ 后端服务已停止"
    else
        echo "⚠️  后端服务已停止"
        rm backend.pid
    fi
else
    echo "⚠️  找不到后端进程ID文件"
fi

# 停止前端服务
if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "🔴 停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        rm frontend.pid
        echo "✅ 前端服务已停止"
    else
        echo "⚠️  前端服务已停止"
        rm frontend.pid
    fi
else
    echo "⚠️  找不到前端进程ID文件"
fi

# 可选：停止PostgreSQL
read -p "是否停止PostgreSQL数据库? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🐘 停止PostgreSQL数据库..."
    docker-compose down postgres
    echo "✅ PostgreSQL已停止"
fi

echo ""
echo "🎉 所有服务已停止！"
