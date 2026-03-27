---
description: 部署流程 — 从开发到生产的标准化发布流程
---

# MiniLife 部署流程

> 适用于所有功能开发和基础架构变更。变更越大，越要严格遵循每一步。

## 变更分级

| 级别 | 示例 | 最低要求 |
|------|------|----------|
| 🟢 小 | UI 文案修改、样式微调 | 步骤 1→4→6→7 |
| 🟡 中 | 新增页面、新 API 路由 | 步骤 1→2→3→4→6→7 |
| 🔴 大 | 数据库迁移、依赖替换、架构重构 | **全部步骤，不可跳过** |

---

## 步骤

### 1. 创建 feature 分支
```bash
git checkout -b feature/<功能名>
```
在 feature 分支上完成所有开发工作。

### 2. 本地测试环境验证
- 启动本地开发服务器 `npm run dev`
- 手动测试所有受影响的功能
- 如有数据库变更，先在本地数据库验证
- 确认无报错、无功能回归

### 3. 通知用户测试 ⚠️ **必须等待用户确认**
- 告知用户：本地测试环境已就绪，请验证
- **在用户确认测试通过之前，不得进行后续步骤**
- 如用户发现问题，返回步骤 1 修复后重新测试

### 4. 提交并合并
```bash
git add -A
git commit -m "feat: <描述>"
git checkout main
git merge feature/<功能名> --no-edit
```

### 5. 生产环境备份（🔴 大变更必须）
```bash
# SSH 到服务器
ssh root@47.103.125.200

# 备份数据库
PGPASSWORD=minilife pg_dump -h 127.0.0.1 -U minilife minilife > /opt/backups/minilife_$(date +%Y%m%d_%H%M%S).sql

# 备份当前代码
cp -r /opt/minilife/server /opt/backups/server_$(date +%Y%m%d_%H%M%S)
```

### 6. 部署到生产
// turbo
```bash
bash upload.sh 47.103.125.200
```

### 7. 生产验证
- 检查 PM2 日志：`ssh root@47.103.125.200 "pm2 logs minilife --lines 10 --nostream"`
- 确认服务正常运行
- 通知用户访问 http://47.103.125.200 验证

---

## 回滚方案（出现问题时）

```bash
# SSH 到服务器
ssh root@47.103.125.200

# 恢复代码
cp -r /opt/backups/server_<时间戳> /opt/minilife/server

# 恢复数据库（如需要）
PGPASSWORD=minilife psql -h 127.0.0.1 -U minilife -d minilife < /opt/backups/minilife_<时间戳>.sql

# 重启服务
pm2 restart minilife
```
