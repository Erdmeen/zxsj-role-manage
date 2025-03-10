# 部署指南

## 1. 环境要求
- Node.js (建议 v14 或更高版本)
- npm (通常随 Node.js 一起安装)
- PM2 (用于进程管理)

## 2. 服务器准备

### CentOS/RHEL 系统：
```bash
# 安装 Node.js 和 npm
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs

# 安装开发工具（用于编译某些 npm 包）
sudo yum group install -y "Development Tools"

# 安装 PM2
sudo npm install -g pm2
```

### Debian/Ubuntu 系统：
```bash
# 安装 Node.js 和 npm
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2
```

## 3. 项目部署

### 3.1 上传代码
将项目文件上传到服务器，例如使用 git：
```bash
# 在服务器上
git clone <您的仓库地址>
cd <项目目录>
```

或者使用 scp 命令上传：
```bash
# 在本地执行
scp -r ./* user@your-server:/path/to/deploy
```

### 3.2 安装依赖
```bash
npm install --production
```

### 3.3 配置环境变量
创建 .env 文件：
```bash
# 创建并编辑 .env 文件
touch .env
nano .env

# 添加以下内容
PORT=3000
JWT_SECRET=your-secret-key-here  # 请更改为安全的密钥
NODE_ENV=production
```

### 3.4 创建管理员用户
```bash
node createUser.js
```

### 3.5 使用 PM2 启动服务
```bash
# 启动服务
pm2 start index.js --name "task-manager"

# 其他常用 PM2 命令
pm2 status                  # 查看服务状态
pm2 logs task-manager      # 查看日志
pm2 restart task-manager   # 重启服务
pm2 stop task-manager     # 停止服务

# 设置开机自启
pm2 startup
pm2 save
```

### 3.6 配置 Nginx（可选，用于反向代理）

#### CentOS/RHEL 系统：
```bash
# 安装 Nginx
sudo yum install -y epel-release
sudo yum install -y nginx

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

配置文件位置：`/etc/nginx/conf.d/default.conf`
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 4. 安全建议

### 4.1 防火墙设置（CentOS/RHEL）
```bash
# 使用 firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# 开放需要的端口
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 4.2 SELinux 设置（如果启用）
```bash
# 允许 Nginx 反向代理
sudo setsebool -P httpd_can_network_connect 1
```

### 4.3 SSL 证书（推荐）
在 CentOS/RHEL 上安装 Certbot：
```bash
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx
```

## 5. 维护

### 5.1 数据库备份
定期备份 SQLite 数据库文件：
```bash
# 创建备份脚本
mkdir -p backups
cp database.sqlite backups/database_$(date +%Y%m%d_%H%M%S).sqlite
```

### 5.2 日志管理
```bash
# 查看 PM2 日志
pm2 logs task-manager

# 清理日志
pm2 flush

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 5.3 更新部署
```bash
# 拉取最新代码
git pull

# 安装依赖
npm install --production

# 重启服务
pm2 restart task-manager
```

## 6. 监控
- 使用 PM2 的监控功能：`pm2 monit`
- 查看实时日志：`pm2 logs`
- 检查服务状态：`pm2 status`

## 7. 故障排除
1. 如果服务无法启动，检查：
   - 环境变量是否正确配置
   - 端口是否被占用
   - 日志输出 `pm2 logs`
   - SELinux 状态 `getenforce`

2. 如果遇到数据库错误：
   - 检查数据库文件权限
   - 确保数据库目录可写
   - 检查 SELinux 上下文

3. 如果遇到内存问题：
   - 检查服务器资源使用情况 `top` 或 `htop`
   - 适当调整 PM2 的内存限制 