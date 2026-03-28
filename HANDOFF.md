# MiniLife 协作交接文档 (HANDOFF.md)

> 本文档供 Gemini 或其他 AI 协作者在 Antigravity 额度不可用时，能快速理解项目并继续开发。

## 1. 技术栈

| 层       | 技术                           |
|----------|-------------------------------|
| 前端     | React 19 + Vite 7 + TailwindCSS 4 |
| 后端     | Node.js + Express + PostgreSQL |
| AI 集成  | Gemini / DeepSeek API          |
| 部署     | 阿里云 ECS + Nginx + PM2       |

## 2. 项目结构

```
minilife/
├── src/
│   ├── App.jsx              # 顶层路由（目前靠 appState 字符串切换）
│   ├── main.jsx             # Vite 入口
│   ├── api/client.js        # apiFetch 封装（自动注入 token）
│   ├── context/
│   │   ├── AuthContext.jsx   # 认证状态
│   │   ├── DataContext.jsx   # 数据加载（kids/tasks/transactions）
│   │   └── UIContext.jsx     # UI 状态
│   ├── stores/
│   │   └── modalStore.js    # Zustand 弹窗状态管理
│   ├── hooks/
│   │   ├── useAppData.js     # SSE 同步 + 数据初始化
│   │   ├── useAuth.js        # 登录/注册
│   │   ├── useTaskManager.js # 核心业务（打卡/审核/奖励/打回）
│   │   ├── useShopManager.js # 商城逻辑
│   │   └── useTasks.js       # 任务调度算法
│   ├── components/
│   │   ├── common/
│   │   │   ├── GlobalModals.jsx  # 弹窗协调层（引用 25 个独立弹窗）
│   │   │   ├── AiPlanCreator.jsx # AI 任务生成器
│   │   │   └── AppGrid.jsx       # 家长端应用网格
│   │   └── modals/           # 25 个独立弹窗组件
│   ├── pages/
│   │   ├── Kid/       # 学生端页面
│   │   ├── Parent/    # 家长端页面
│   │   ├── Admin/     # 管理员面板
│   │   └── Auth/      # 登录/注册/PIN
│   └── utils/         # 工具函数
├── server/
│   ├── server.js      # Express 入口 + 中间件
│   ├── database.js    # PostgreSQL 连接池 + SQLite 兼容 API
│   ├── routes/        # 10 个路由模块 (auth, kids, tasks, etc.)
│   └── aiRoutes.js    # AI 相关路由
├── deploy.sh          # 服务器初始化脚本
├── upload.sh          # 本地一键部署脚本
└── .env               # 环境变量（Gemini API Key + DB）
```

## 3. 开发命令

```bash
# 前端开发服务器 (port 5173)
npm run dev

# 后端 API 服务器 (port 3000)
node server/server.js

# 构建生产版本
npm run build

# WiFi 局域网访问（手机测试）
npm run dev:wifi
```

## 4. 部署到阿里云

```bash
# 必须在 main 分支执行！upload.sh 有分支检查
git checkout main
git merge <feature-branch>
git push origin main
bash upload.sh 47.103.125.200
# 密码: Chenlu19880425!
```

> 脚本会自动: `npm run build` → `rsync dist/` → `rsync server/` → `npm install` → `PM2 restart`

## 5. 分支规范

| 分支类型 | 示例 | 说明 |
|---------|------|------|
| `main` | — | 生产分支，只从功能分支合并 |
| `feature/*` | `feature/study-tasks-improvements` | 新功能 |
| `fix/*` | `fix/coin-revert-v2` | Bug 修复 |
| `refactor/*` | `refactor/architecture-v2` | 架构重构 |

## 6. 数据库

PostgreSQL 部署在阿里云 ECS 本地，连接信息在 `.env` 中配置 (`DATABASE_URL`).
`server/database.js` 提供了 SQLite 兼容的 API 封装 (`db.get`, `db.all`, `db.run`, `db.serialize`)，路由代码无需感知底层数据库差异。

核心表：`users`, `kids`, `tasks`, `inventory`, `orders`, `transactions`, `classes`, `ai_config`, `ai_usage_log`, `activation_codes`, `settings`

## 7. 常见陷阱

1. **GlobalModals 解构遗漏**：`useTaskManager` 导出的方法必须在 `GlobalModals` 的 `context` 解构中显式列出，否则按钮点击无效（不报错但不工作）
2. **JSX 嵌套错误**：GlobalModals 文件极大，改完务必 `npm run build` 验证
3. **SSE 竞态**：`useAppData.js` 中的 `pauseSync/resumeSync` 机制很脆弱，修改打卡/审核逻辑时要注意
4. **内联样式**：大量使用 `style={{}}` 而非 Tailwind 类，逐步迁移中
5. **.env 不要提交**：包含 Gemini API Key

## 8. 账号信息

- **测试账号**: dulaidila@gmail.com / 123456
- **管理员账号**: admin@minilife.com / admin123
- **阿里云 SSH**: root@47.103.125.200 / Chenlu19880425!
