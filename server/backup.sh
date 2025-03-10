#!/bin/bash

# 创建备份目录
BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

# 生成备份文件名（包含时间戳）
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/database_$TIMESTAMP.sqlite"

# 停止应用程序（如果正在运行）
pm2 stop task-manager

# 创建数据库备份
cp database.sqlite "$BACKUP_FILE"

# 重启应用程序
pm2 start task-manager

# 保留最近30天的备份，删除旧的备份
find $BACKUP_DIR -name "database_*.sqlite" -type f -mtime +30 -delete

echo "数据库已备份到: $BACKUP_FILE" 