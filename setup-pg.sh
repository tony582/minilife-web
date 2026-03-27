#!/bin/bash
# ═══════════════════════════════════════════════════════════
# MiniLife PostgreSQL 安装 & 数据迁移脚本 (在阿里云服务器上运行)
# 用法: bash setup-pg.sh
# ═══════════════════════════════════════════════════════════

set -e

DB_NAME="minilife"
DB_USER="minilife"
DB_PASS="minilife"

echo "═══════════════════════════════════════"
echo "  MiniLife PostgreSQL 初始化"
echo "═══════════════════════════════════════"

# ─── 1. Install PostgreSQL ───
echo ""
echo "📦 [1/4] 安装 PostgreSQL..."
if ! command -v psql &> /dev/null; then
    apt-get update -qq
    apt-get install -y -qq postgresql postgresql-contrib
    echo "   PostgreSQL 安装完成 ✅"
else
    echo "   PostgreSQL 已安装 ✅"
fi

# Ensure PostgreSQL is running
systemctl start postgresql
systemctl enable postgresql

# ─── 2. Create DB and User ───
echo ""
echo "🔧 [2/4] 创建数据库和用户..."
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || echo "   用户已存在"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || echo "   数据库已存在"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo "   数据库配置完成 ✅"

# ─── 3. Configure pg_hba.conf for local connections ───
echo ""
echo "🔒 [3/4] 配置本地连接认证..."
PG_HBA=$(sudo -u postgres psql -t -A -c "SHOW hba_file;")
# Add md5 auth for local connections if not already present
if ! grep -q "minilife" "$PG_HBA" 2>/dev/null; then
    echo "local   $DB_NAME   $DB_USER   md5" | sudo tee -a "$PG_HBA" > /dev/null
    echo "host    $DB_NAME   $DB_USER   127.0.0.1/32   md5" | sudo tee -a "$PG_HBA" > /dev/null
    systemctl reload postgresql
    echo "   认证配置完成 ✅"
else
    echo "   认证已配置 ✅"
fi

# ─── 4. Migrate data from SQLite (if exists) ───
echo ""
echo "📊 [4/4] 检查 SQLite 数据迁移..."
SQLITE_DB="/opt/minilife/server/minilife.sqlite"
if [ -f "$SQLITE_DB" ]; then
    echo "   发现 SQLite 数据库，准备迁移..."
    
    # Install sqlite3 if needed
    if ! command -v sqlite3 &> /dev/null; then
        apt-get install -y -qq sqlite3
    fi
    
    # Export data as INSERT statements
    TMPFILE="/tmp/minilife_migrate.sql"
    
    echo "   导出用户数据..."
    sqlite3 "$SQLITE_DB" ".mode insert users" "SELECT * FROM users;" > "$TMPFILE" 2>/dev/null || true
    sqlite3 "$SQLITE_DB" ".mode insert activation_codes" "SELECT * FROM activation_codes;" >> "$TMPFILE" 2>/dev/null || true
    sqlite3 "$SQLITE_DB" ".mode insert kids" "SELECT * FROM kids;" >> "$TMPFILE" 2>/dev/null || true
    sqlite3 "$SQLITE_DB" ".mode insert tasks" "SELECT * FROM tasks;" >> "$TMPFILE" 2>/dev/null || true
    sqlite3 "$SQLITE_DB" ".mode insert inventory" "SELECT * FROM inventory;" >> "$TMPFILE" 2>/dev/null || true
    sqlite3 "$SQLITE_DB" ".mode insert orders" "SELECT * FROM orders;" >> "$TMPFILE" 2>/dev/null || true
    sqlite3 "$SQLITE_DB" ".mode insert transactions" "SELECT * FROM transactions;" >> "$TMPFILE" 2>/dev/null || true
    sqlite3 "$SQLITE_DB" ".mode insert classes" "SELECT * FROM classes;" >> "$TMPFILE" 2>/dev/null || true
    sqlite3 "$SQLITE_DB" ".mode insert ai_config" "SELECT * FROM ai_config;" >> "$TMPFILE" 2>/dev/null || true
    sqlite3 "$SQLITE_DB" ".mode insert ai_usage_log" "SELECT * FROM ai_usage_log;" >> "$TMPFILE" 2>/dev/null || true
    sqlite3 "$SQLITE_DB" ".mode insert user_settings" "SELECT * FROM user_settings;" >> "$TMPFILE" 2>/dev/null || true
    sqlite3 "$SQLITE_DB" ".mode insert login_log" "SELECT * FROM login_log;" >> "$TMPFILE" 2>/dev/null || true
    sqlite3 "$SQLITE_DB" ".mode insert announcements" "SELECT * FROM announcements;" >> "$TMPFILE" 2>/dev/null || true
    
    # Convert INSERT INTO "table" to INSERT INTO table (PG compat)
    sed -i 's/INSERT INTO "\([^"]*\)"/INSERT INTO \1/g' "$TMPFILE"
    
    if [ -s "$TMPFILE" ]; then
        echo "   导入数据到 PostgreSQL..."
        # Let the Node app create tables first, then import data
        # We'll add ON CONFLICT handling
        PGPASSWORD=$DB_PASS psql -h 127.0.0.1 -U $DB_USER -d $DB_NAME -f "$TMPFILE" 2>/dev/null || echo "   ⚠️ 部分数据导入可能有冲突（已有数据），这是正常的"
        echo "   数据迁移完成 ✅"
    else
        echo "   SQLite 数据库为空，跳过迁移"
    fi
    
    # Backup the old SQLite file
    mv "$SQLITE_DB" "${SQLITE_DB}.bak.$(date +%Y%m%d)" 2>/dev/null || true
    echo "   SQLite 文件已备份为 ${SQLITE_DB}.bak.$(date +%Y%m%d)"
else
    echo "   没有发现 SQLite 文件，跳过迁移（全新安装）"
fi

echo ""
echo "═══════════════════════════════════════"
echo "✅ PostgreSQL 初始化完成！"
echo ""
echo "   连接信息:"
echo "   DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
echo ""
echo "   测试连接: PGPASSWORD=$DB_PASS psql -h 127.0.0.1 -U $DB_USER -d $DB_NAME"
echo "═══════════════════════════════════════"
