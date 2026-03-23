#!/bin/bash
# ═══════════════════════════════════════════════════
# MiniLife 上传部署脚本 (在 Mac 上运行)
# 用法: bash upload.sh <服务器IP>
# 示例: bash upload.sh 47.100.123.45
#
# ⚠️ 安全规则: 只允许从 main 分支部署到生产环境
# ═══════════════════════════════════════════════════

set -e

SERVER_IP=$1
if [ -z "$SERVER_IP" ]; then
    echo "❌ 请提供服务器 IP 地址"
    echo "用法: bash upload.sh <服务器IP>"
    echo "示例: bash upload.sh 47.100.123.45"
    exit 1
fi

# ─── 安全检查: 只允许 main 分支部署 ───
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo ""
    echo "🚫 部署被阻止！"
    echo "═══════════════════════════════════════"
    echo "   当前分支: $CURRENT_BRANCH"
    echo "   只允许从 main 分支部署到生产环境！"
    echo ""
    echo "   请先合并到 main 分支:"
    echo "     git checkout main"
    echo "     git merge $CURRENT_BRANCH"
    echo "     bash upload.sh $SERVER_IP"
    echo "═══════════════════════════════════════"
    exit 1
fi

# ─── 检查是否有未提交的更改 ───
if ! git diff --quiet HEAD 2>/dev/null; then
    echo ""
    echo "⚠️  检测到未提交的代码更改！"
    echo "   请先 git add && git commit 后再部署。"
    echo ""
    exit 1
fi

APP_DIR="/opt/minilife"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 MiniLife 上传部署"
echo "═══════════════════════════════════════"
echo "   服务器: root@$SERVER_IP"
echo "   分支:   $CURRENT_BRANCH ✅"
echo "   提交:   $(git log --oneline -1)"
echo "   项目目录: $PROJECT_DIR"
echo "═══════════════════════════════════════"

# ─── 1. 本地构建前端 ───
echo ""
echo "📦 [1/4] 构建前端..."
cd "$PROJECT_DIR"
npm run build
echo "   构建完成 ✅"

# ─── 2. 上传前端 dist ───
echo ""
echo "📤 [2/4] 上传前端文件..."
rsync -avz --delete "$PROJECT_DIR/dist/" root@$SERVER_IP:$APP_DIR/dist/
echo "   前端上传完成 ✅"

# ─── 3. 上传后端 server ───
echo ""
echo "📤 [3/4] 上传后端文件..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude 'minilife.sqlite' \
    --exclude 'minilife.sqlite-shm' \
    --exclude 'minilife.sqlite-wal' \
    "$PROJECT_DIR/server/" root@$SERVER_IP:$APP_DIR/server/

# 上传 .env 和 package.json
scp "$PROJECT_DIR/.env" root@$SERVER_IP:$APP_DIR/.env 2>/dev/null || echo "   ⚠️ 没有 .env 文件，跳过"
scp "$PROJECT_DIR/package.json" root@$SERVER_IP:$APP_DIR/package.json
echo "   后端上传完成 ✅"

# ─── 4. 远程安装依赖 + 启动 ───
echo ""
echo "🔧 [4/4] 远程安装依赖并启动..."
ssh root@$SERVER_IP << 'REMOTE_CMD'
cd /opt/minilife/server
# 复制 .env
cp /opt/minilife/.env /opt/minilife/server/.env 2>/dev/null || true
# 安装后端依赖
npm install --production
# 用 PM2 启动/重启
pm2 delete minilife 2>/dev/null || true
pm2 start server.js --name minilife --max-memory-restart 300M
pm2 save
echo ""
echo "═══════════════════════════════════════"
echo "✅ MiniLife 部署完成！"
echo "═══════════════════════════════════════"
pm2 status
REMOTE_CMD

echo ""
echo "═══════════════════════════════════════"
echo "🎉 部署成功！"
echo ""
echo "   访问: http://$SERVER_IP"
echo ""
echo "═══════════════════════════════════════"
