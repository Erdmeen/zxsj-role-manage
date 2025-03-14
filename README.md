# 诛仙世界角色周任务管理系统

这是一个用于管理诛仙世界游戏角色周任务的管理系统，帮助玩家更好地追踪和管理游戏任务进度。

## 技术架构

### 前端
- Vue 3 + TypeScript
- Ant Design Vue
- Vite 构建工具
- Vue Draggable（拖拽功能支持）

### 后端
- Node.js + Express
- SQLite 数据库
- Sequelize ORM
- JWT 认证

## 功能特点

- 用户认证和授权
- 角色任务管理
- 任务进度追踪
- 拖拽式任务排序
- 数据本地持久化

## 安装说明

### 后端服务器
```bash
cd server
npm install
# 配置环境变量
cp .env.example .env
# 启动服务器
npm run dev
```

### 前端应用
```bash
cd client
npm install
npm run dev
```

## 开发环境

- 开发服务器: http://localhost:3000
- API 服务器: http://localhost:5000

## 部署

详细的部署说明请参考 `server/DEPLOY.md` 文件。

## 数据备份

系统提供了自动备份脚本，位于 `server/backup.sh`。

## 开发团队

欢迎提交 Issue 和 Pull Request。

## 许可证

ISC License
