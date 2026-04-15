# MiniLife 协作交接文档 (HANDOFF.md)

> 本文档供 Gemini 或其他 AI 协作者在 Antigravity 额度不可用时，能快速理解项目并继续开发。
> 最后更新: 2026-04-15

## 1. 技术栈

| 层       | 技术                                    |
|----------|----------------------------------------|
| 前端     | React 19 + Vite 7 + TailwindCSS 4      |
| 路由     | React Router v7                         |
| 状态管理 | React Context + Zustand 5               |
| 图标     | Phosphor Icons React                    |
| 图表     | Recharts                                |
| 拖拽     | dnd-kit (拖拽排序)                       |
| 二维码   | qrcode.react + react-qr-scanner         |
| 后端     | Node.js + Express + PostgreSQL          |
| 邮件     | Nodemailer                              |
| AI 集成  | Gemini / DeepSeek API                   |
| 部署     | 阿里云 ECS + Nginx + PM2               |

## 2. 项目结构

```
minilife/
├── src/
│   ├── App.jsx              # 顶层路由（BrowserRouter + Routes）
│   ├── main.jsx             # Vite 入口
│   ├── api/client.js        # apiFetch 封装（自动注入 token）
│   ├── context/
│   │   ├── AuthContext.jsx   # 认证状态（token, user）
│   │   ├── DataContext.jsx   # 数据（kids/tasks/transactions/inventory/orders/classes）
│   │   └── UIContext.jsx     # UI 状态（弹窗 flags）
│   ├── stores/
│   │   ├── modalStore.js     # Zustand: 27个弹窗开关状态
│   │   ├── formStore.js      # Zustand: 表单数据（planForm/newItem 等）
│   │   ├── navigationStore.js # Zustand: Tab/筛选器/日期导航
│   │   └── timerStore.js     # Zustand: 计时器状态
│   ├── hooks/
│   │   ├── useAppData.js     # SSE 同步 + 数据初始化
│   │   ├── useAuth.js        # 登录/注册/忘记密码
│   │   ├── useTaskManager.js # 核心业务（打卡/审核/奖励/打回, 78KB）
│   │   ├── useShopManager.js # 商城逻辑
│   │   ├── useTasks.js       # 任务调度算法
│   │   ├── usePetRooms.js    # 宠物房间管理
│   │   ├── usePetCoins.js    # 宠物消费（扣币/退款）
│   │   ├── useAntiAddiction.js # 防沉迷（15min/天 + 任务奖励）
│   │   ├── useSubscription.js  # 订阅到期写操作守卫
│   │   ├── useSwipeBack.js    # 手势返回拦截
│   │   ├── useToast.js        # Toast 通知
│   │   └── useOnClickOutside.js # 点击外部关闭
│   ├── components/
│   │   ├── common/
│   │   │   ├── GlobalModals.jsx      # 弹窗协调层（引用 27 个弹窗）
│   │   │   ├── AiPlanCreator.jsx     # AI 任务生成器
│   │   │   ├── AppGrid.jsx           # 家长端应用网格
│   │   │   ├── PaywallModal.jsx      # 订阅付费弹窗
│   │   │   ├── ExpiredBanner.jsx     # 到期横幅
│   │   │   ├── SmartInstallBanner.jsx # PWA 安装引导
│   │   │   └── ReorderableList.jsx   # 可拖拽排序列表
│   │   ├── VirtualPet/              # 宠物系统（8个组件）
│   │   │   ├── VirtualPetDashboard.jsx  # 主界面 (128KB)
│   │   │   ├── PetRoomModal.jsx      # 房间全屏弹窗
│   │   │   ├── PixelPetEngine.jsx    # 像素渲染引擎
│   │   │   ├── PixelBackground.jsx   # 像素背景
│   │   │   ├── FurnitureShop.jsx     # 家具商城
│   │   │   ├── BackpackModal.jsx     # 背包
│   │   │   ├── PetCapsule.jsx        # 全局浮动胶囊
│   │   │   └── PetBoxTeaser.jsx      # 盲盒引导
│   │   ├── modals/                   # 27 个独立弹窗组件
│   │   └── HelpTip.jsx              # 上下文帮助提示
│   ├── pages/
│   │   ├── Kid/                      # 学生端（7个文件）
│   │   │   ├── KidApp.jsx
│   │   │   ├── KidStudyTab.jsx
│   │   │   ├── KidHabitTab.jsx
│   │   │   ├── KidWealthTab.jsx
│   │   │   ├── KidShopTab.jsx
│   │   │   ├── KidProfileTab.jsx
│   │   │   └── ExpHistoryModal.jsx
│   │   ├── Parent/                   # 家长端（6个文件 + 8个子应用）
│   │   │   ├── ParentApp.jsx
│   │   │   ├── ParentTasksTab.jsx
│   │   │   ├── ParentPlansTab.jsx
│   │   │   ├── ParentWealthTab.jsx
│   │   │   ├── ParentShopTab.jsx
│   │   │   ├── ParentMoreAppsTab.jsx
│   │   │   └── apps/                 # 8个子应用
│   │   │       ├── ParentDashboardApp.jsx
│   │   │       ├── InterestClassApp.jsx
│   │   │       ├── InterestSettingsApp.jsx
│   │   │       ├── SubscriptionApp.jsx
│   │   │       ├── TaskPrintApp.jsx
│   │   │       ├── KidSettingsApp.jsx
│   │   │       ├── TermSettingsApp.jsx
│   │   │       └── SecurityApp.jsx
│   │   ├── Admin/AdminPage.jsx       # 管理员面板 (75KB)
│   │   └── Auth/                     # 认证页面
│   │       ├── AuthPage.jsx
│   │       ├── ProfileSelectionPage.jsx
│   │       ├── ParentPinPage.jsx
│   │       └── ExpiredPage.jsx
│   ├── data/                         # 静态数据目录
│   │   ├── defaultHabits.js          # 默认习惯模板
│   │   ├── furnitureCatalog.js       # 家具目录
│   │   ├── itemsCatalog.js           # 消耗品目录
│   │   ├── petSpecies.js             # 宠物物种（进化阶段）
│   │   └── roomConfig.js            # 15个房间主题
│   ├── utils/                        # 工具函数
│   │   ├── Icons.jsx                 # 图标封装
│   │   ├── achievements.js           # 成就系统 (40枚)
│   │   ├── spiritUtils.js            # 精灵/宠物工具
│   │   ├── taskUtils.js              # 任务工具
│   │   ├── categoryUtils.js          # 分类工具
│   │   ├── dateUtils.js              # 日期工具
│   │   ├── levelUtils.js             # 等级工具
│   │   └── habitIcons.jsx            # 习惯图标
│   └── assets/                       # 静态素材
├── server/
│   ├── server.js              # Express 入口 + SSE + 路由挂载
│   ├── middleware.js          # JWT认证 + 封禁检查 + SSE推送
│   ├── database.js            # PostgreSQL 连接池 + DDL (17张表)
│   ├── emailService.js        # Nodemailer 邮件服务
│   ├── aiRoutes.js            # AI 相关路由
│   └── routes/                # 12 个路由模块
│       ├── auth.js            # 认证（注册/登录/密码重置）
│       ├── kids.js            # 孩子管理
│       ├── tasks.js           # 任务管理
│       ├── inventory.js       # 商品管理
│       ├── orders.js          # 订单管理
│       ├── transactions.js    # 交易记录
│       ├── classes.js         # 兴趣班
│       ├── settings.js        # 用户设置
│       ├── interest.js        # 利息系统
│       ├── pet.js             # 宠物房间 + 防沉迷
│       ├── admin.js           # 管理员操作
│       └── admin-stats.js     # 管理员统计仪表盘
├── deploy.sh                  # 服务器初始化脚本
├── upload.sh                  # 本地一键部署脚本
├── setup-pg.sh                # PostgreSQL 安装脚本
└── .env                       # 环境变量（Gemini API Key + DB）
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
| `feature/*` | `feature/pet-furniture-system` | 新功能 |
| `fix/*` | `fix/pet-sleep-position` | Bug 修复 |
| `refactor/*` | `refactor/architecture-v2` | 架构重构 |

## 6. 数据库

PostgreSQL 部署在阿里云 ECS 本地，连接信息在 `.env` 中配置 (`DATABASE_URL`).
`server/database.js` 提供了 SQLite 兼容的 API 封装 (`db.get`, `db.all`, `db.run`, `db.serialize`)，路由代码无需感知底层数据库差异。

### 核心表 (17张)
`users`, `activation_codes`, `kids`, `tasks`, `inventory`, `orders`, `transactions`, `classes`, `ai_config`, `ai_usage_log`, `user_settings`, `login_log`, `announcements`, `interest_history`, `app_settings`, `pet_rooms`, `pet_anti_addiction`

## 7. 常见陷阱

1. **GlobalModals 解构遗漏**：`useTaskManager` 导出的方法必须在 `GlobalModals` 的 `context` 解构中显式列出，否则按钮点击无效（不报错但不工作）
2. **JSX 嵌套错误**：GlobalModals 文件极大 (29KB)，改完务必 `npm run build` 验证
3. **SSE 竞态**：`useAppData.js` 中的 `pauseSync/resumeSync` 机制很脆弱，修改打卡/审核逻辑时要注意
4. **VirtualPetDashboard 巨型文件**：128KB 超大组件，修改时注意性能和 JSX 嵌套层级
5. **useTaskManager 巨型 Hook**：78KB，是最大的业务逻辑聚合点，拆分困难需谨慎
6. **宠物系统跨组件通信**：使用 `window.addEventListener('petroom:open/close')` 自定义事件，非 React 标准模式
7. **DEV_MODE 常量**：`usePetCoins.js` 中 `DEV_MODE = true` 会给无限金币，上线前务必改为 `false`
8. **Zustand store 分散**：4 个 store 文件，修改前先确认状态属于哪个 store
9. **.env 不要提交**：包含 Gemini API Key 和数据库密码

## 8. 账号信息

- **测试账号**: dulaidila@gmail.com / 123456
- **管理员账号**: admin@minilife.com / admin123
- **阿里云 SSH**: root@47.103.125.200 / Chenlu19880425!
