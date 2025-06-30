# RWA Dream Land - 实物资产学习平台

一个集学习、笔记、审核于一体的现代化RWA（Real World Assets）学习平台。

## 🚀 项目概述

RWA Dream Land 是一个专为RWA学习者设计的综合性平台，提供：
- 📚 **学习资源管理** - 丰富的RWA知识库和案例研究
- 📝 **个人笔记系统** - Markdown编辑器，支持实时预览
- 👥 **协作审核机制** - 多角色权限管理和内容审核
- 🏆 **积分激励系统** - 学习和贡献积分奖励

## 🏗 技术架构

### 前端
- **框架**: React 18 + TypeScript + Vite
- **样式**: TailwindCSS + shadcn/ui 组件库
- **路由**: React Router v6
- **状态管理**: React Hooks + Context
- **Markdown**: react-markdown + remark-gfm

### 后端  
- **框架**: FastAPI + SQLModel
- **数据库**: PostgreSQL 
- **认证**: JWT + PassLib
- **文件上传**: FastAPI + aiofiles
- **API文档**: 自动生成 Swagger UI

### 部署
- **前端**: Vercel 自动部署
- **后端**: 支持 Docker + PostgreSQL
- **数据库**: PostgreSQL 云服务

## 📋 功能特性

### 🔐 用户系统
- [x] 用户注册/登录
- [x] 角色权限管理（普通用户/审核员/管理员）
- [x] 个人资料管理
- [x] 头像上传
- [x] 积分系统

### 📖 笔记系统
- [x] Markdown 笔记编辑
- [x] 实时预览
- [x] 笔记管理（创建/编辑/删除/查看）
- [x] 文件下载（.md格式）
- [x] 提交审核功能

### 👨‍💼 审核系统
- [x] 审核员管理界面
- [x] 审核流程（通过/拒绝/需要修改）
- [x] 审核历史记录
- [x] 积分奖励机制

### 🎨 用户界面
- [x] 现代化响应式设计
- [x] 暗色/亮色主题支持
- [x] 移动端适配
- [x] 丰富的交互反馈

## 🛠 开发环境设置

### 环境要求
- Node.js 18+
- Python 3.9+
- PostgreSQL 12+
- pnpm (推荐) 或 npm

### 1. 克隆项目
```bash
git clone https://github.com/Eleanorbai/RWADreamLand.git
cd RWADreamLand
```

### 2. 后端设置
```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置数据库连接和密钥

# 启动PostgreSQL（使用Docker Compose）
cd ..
docker-compose up -d postgres

# 启动后端服务
cd backend
python start.py
```

### 3. 前端设置
```bash
cd frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 4. 访问应用
- 前端: http://localhost:5173
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 📚 使用指南

### 基础使用流程

1. **注册账号**
   - 访问注册页面创建账号
   - 默认角色为普通用户

2. **完善个人信息**
   - 上传头像
   - 填写个人资料

3. **创建笔记**
   - 使用Markdown语法编写笔记
   - 支持实时预览
   - 保存草稿或直接发布

4. **提交审核**
   - 完成的笔记可提交审核
   - 获得提交积分奖励

5. **审核流程**（审核员）
   - 查看待审核笔记
   - 提供审核意见
   - 通过/拒绝/要求修改

## 🔧 配置说明

### 环境变量

#### 后端 (.env)
```bash
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/rwadreamland

# JWT配置
SECRET_KEY=your-super-secret-key

# 应用配置
DEBUG=true
HOST=0.0.0.0
PORT=8000
```

#### 前端 (.env)
```bash
# API基础URL
VITE_API_BASE_URL=http://localhost:8000
```

### 数据库迁移

```bash
# 自动创建表结构（首次启动时）
python -c "from app.database import init_db; init_db()"
```

## 🚀 部署指南

### 后端部署

#### 使用Docker
```bash
# 构建镜像
docker build -t rwadreamland-backend ./backend

# 运行容器
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql://... \
  -e SECRET_KEY=your-secret-key \
  rwadreamland-backend
```

#### 直接部署
```bash
# 安装依赖
pip install -r requirements.txt

# 设置生产环境变量
export DEBUG=false
export SECRET_KEY=$(openssl rand -hex 32)
export DATABASE_URL=postgresql://...

# 启动服务
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### 前端部署

#### Vercel (推荐)
1. 连接GitHub仓库
2. 设置构建命令: `cd frontend && pnpm build`
3. 设置输出目录: `frontend/dist`
4. 设置环境变量: `VITE_API_BASE_URL`

#### 手动部署
```bash
cd frontend
pnpm build
# 将 dist/ 目录部署到静态文件服务器
```

## 📊 项目结构

```
RWADreamLand/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/      # UI组件
│   │   ├── pages/          # 页面组件
│   │   ├── lib/            # 工具库
│   │   ├── types/          # TypeScript类型
│   │   └── hooks/          # React Hooks
│   └── package.json
├── backend/                 # FastAPI后端应用
│   ├── app/
│   │   ├── models.py       # SQLModel数据模型
│   │   ├── main.py         # FastAPI主应用
│   │   ├── auth.py         # 认证逻辑
│   │   ├── crud.py         # 数据库操作
│   │   └── config.py       # 配置管理
│   └── requirements.txt
├── docs/                   # 项目文档
├── docker-compose.yml      # Docker Compose配置
└── README.md              # 项目说明
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📝 开发说明

### 代码规范
- **前端**: ESLint + Prettier + TypeScript严格模式
- **后端**: Black + isort + mypy类型检查
- **Git**: 遵循 Conventional Commits 规范

### 测试
```bash
# 前端测试
cd frontend
pnpm test

# 后端测试
cd backend
pytest
```

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

感谢以下开源项目：
- [FastAPI](https://fastapi.tiangolo.com/) - 现代化Python Web框架
- [React](https://reactjs.org/) - 用户界面构建库
- [SQLModel](https://sqlmodel.tiangolo.com/) - 类型安全的ORM
- [shadcn/ui](https://ui.shadcn.com/) - 精美的React组件库
- [TailwindCSS](https://tailwindcss.com/) - 实用优先的CSS框架

## 📞 联系方式

- 项目地址: https://github.com/Eleanorbai/RWADreamLand
- 问题反馈: [Issues](https://github.com/Eleanorbai/RWADreamLand/issues)
- 在线演示: https://rwa-dream-land.vercel.app

---

**RWA Dream Land** - 让学习RWA变得简单而有趣！ 🚀
