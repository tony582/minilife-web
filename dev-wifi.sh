#!/bin/bash
# ─────────────────────────────────────────────
#  MiniLife WiFi 测试环境一键启动
#  用法: bash dev-wifi.sh
# ─────────────────────────────────────────────

# 自动查找 Node 路径（兼容 nvm / homebrew）
NODE_BIN=$(
  command -v node 2>/dev/null ||
  ls ~/.nvm/versions/node/*/bin/node 2>/dev/null | sort -V | tail -1 ||
  echo "/opt/homebrew/bin/node"
)

if [ ! -x "$NODE_BIN" ]; then
  echo "❌ 找不到 node，请先安装 Node.js 或配置 nvm"
  exit 1
fi

# 获取局域网 IP
WIFI_IP=$(ipconfig getifaddr en0 2>/dev/null || ip route get 1 2>/dev/null | awk '{print $7;exit}')

echo ""
echo "┌────────────────────────────────────────┐"
echo "│   MiniLife WiFi 测试环境               │"
echo "├────────────────────────────────────────┤"
echo "│  Node:    $NODE_BIN"
echo "│  本机 IP: $WIFI_IP"
echo "│  前端:    http://$WIFI_IP:5173"
echo "│  Server:  http://$WIFI_IP:3000"
echo "└────────────────────────────────────────┘"
echo ""

# 启动后端（后台）
echo "▶ 启动 API Server (port 3000)..."
$NODE_BIN server/server.js &
SERVER_PID=$!
echo "  Server PID: $SERVER_PID"

# 等 server 就绪
sleep 1

# 启动前端（监听所有网卡，直接调用 node_modules/.bin/vite 避免 npx PATH 问题）
echo "▶ 启动 Vite (--host, port 5173)..."
$NODE_BIN node_modules/.bin/vite --host

# 前端退出后，一并杀掉 server
kill $SERVER_PID 2>/dev/null
echo "已停止所有服务。"
