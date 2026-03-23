#!/bin/bash
# ═══════════════════════════════════════════════════
# MiniLife 一键部署脚本 (Ubuntu 22.04 / Alibaba Cloud Linux)
# 运行方式: bash deploy.sh
# ═══════════════════════════════════════════════════

set -e

echo "🚀 MiniLife 部署开始..."
echo "═══════════════════════════════════════"

# ─── 1. 系统更新 + 安装基础依赖 ───
echo "📦 [1/6] 安装系统依赖..."
apt-get update -y
apt-get install -y curl git nginx certbot python3-certbot-nginx

# ─── 2. 安装 Node.js 18 ───
echo "📦 [2/6] 安装 Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi
echo "   Node: $(node -v)  NPM: $(npm -v)"

# ─── 3. 安装 PM2 进程管理器 ───
echo "📦 [3/6] 安装 PM2..."
npm install -g pm2

# ─── 4. 创建应用目录 ───
echo "📁 [4/6] 创建应用目录..."
APP_DIR="/opt/minilife"
mkdir -p $APP_DIR
echo "   应用目录: $APP_DIR"

# ─── 5. 配置 Nginx ───
echo "🌐 [5/6] 配置 Nginx..."
cat > /etc/nginx/sites-available/minilife << 'NGINX_CONF'
server {
    listen 80;
    server_name _;  # 后续替换为你的域名

    # 前端静态文件
    root /opt/minilife/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;

    # 安装引导页面
    location = /install-guide.html {
        try_files $uri =404;
    }

    # PWA 相关文件
    location = /manifest.json { try_files $uri =404; }
    location = /sw.js {
        add_header Cache-Control "no-cache";
        try_files $uri =404;
    }

    # API 和 SSE 反向代理到 Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;  # SSE 长连接需要
        proxy_buffering off;       # SSE 需要关闭缓冲
        client_max_body_size 50m;  # 图片上传
    }

    # SPA fallback — 所有其他路径返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_CONF

ln -sf /etc/nginx/sites-available/minilife /etc/nginx/sites-enabled/minilife
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
echo "   Nginx 配置完成 ✅"

# ─── 6. 创建上传脚本 ───
echo "📝 [6/6] 创建辅助脚本..."

cat > $APP_DIR/start.sh << 'START_SCRIPT'
#!/bin/bash
cd /opt/minilife/server
pm2 delete minilife 2>/dev/null
pm2 start server.js --name minilife --max-memory-restart 300M
pm2 save
echo "✅ MiniLife 后端已启动"
pm2 status
START_SCRIPT
chmod +x $APP_DIR/start.sh

# PM2 开机自启
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo ""
echo "═══════════════════════════════════════"
echo "✅ 服务器环境准备完成！"
echo "═══════════════════════════════════════"
echo ""
echo "📋 接下来请在你的 Mac 电脑上执行上传命令："
echo ""
echo "   详见 upload.sh 脚本"
echo ""
echo "═══════════════════════════════════════"
