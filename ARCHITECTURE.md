# MiniLife 架构文档 (ARCHITECTURE.md)

> 最后更新: 2026-04-15

## 系统架构

```
┌─ Browser (React SPA + PWA) ──────────────────────────────────┐
│                                                               │
│  SmartInstallBanner (PWA 安装引导)                             │
│  BrowserRouter                                                │
│    └─ AuthProvider → DataProvider → UIProvider → AppContent    │
│           │              │              │                      │
│       useAuth.js   useAppData.js   UIContext.jsx               │
│                     (SSE sync)     (modalStore.js)             │
│                         │          (formStore.js)              │
│                         │          (navigationStore.js)        │
│                         │          (timerStore.js)             │
│                 ┌───────┴────────┐                             │
│            KidApp.jsx      ParentApp.jsx                      │
│                 │                │                             │
│            5 Tab Pages      5 Tab Pages + 8 Sub-Apps           │
│                                                               │
│  VirtualPet System (宠物房间 + 像素引擎 + 装饰经济)             │
│    └─ usePetRooms.js / usePetCoins.js / useAntiAddiction.js    │
│                                                               │
│  GlobalModals.jsx (协调层 + 27个独立弹窗组件)                   │
│    └─ useTaskManager.js (打卡/审核/奖励)                       │
│    └─ useShopManager.js (购买/发货)                            │
│                                                               │
│  PaywallModal + ExpiredBanner (订阅到期降级体验)                │
│    └─ useSubscription.js (写操作守卫)                          │
└───────────────────────────────────────────────────────────────┘
         │ REST API + SSE
┌─ Server (Express + PostgreSQL) ───────────────────────────────┐
│  server.js (入口 + 中间件)                                     │
│  middleware.js (JWT认证 + 封禁检查 + SSE推送)                   │
│  database.js (PG连接池 + SQLite兼容API封装)                    │
│  emailService.js (Nodemailer 邮件服务)                         │
│  routes/ (12个路由模块)                                        │
│  aiRoutes.js (AI 任务解析)                                     │
└───────────────────────────────────────────────────────────────┘
```

## 页面导航

### 路由方式 (React Router v7)

```javascript
// App.jsx — 使用 BrowserRouter + Routes
<BrowserRouter>
  <Routes>
    <Route path="/" element={<ProfileSelectionPage />} />
    <Route path="/parent/pin" element={<ParentPinPage />} />
    <Route path="/parent/*" element={<ParentApp />} />
    <Route path="/kid/*" element={<KidApp />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</BrowserRouter>
```

### 子页面导航 (Tab 字符串, via navigationStore)
```javascript
// Kid: kidTab = 'study' | 'habit' | 'wealth' | 'shop' | 'profile'
// Parent: parentTab = 'tasks' | 'plans' | 'wealth' | 'shop_manage' | 'more'
```

### 家长端子应用 (pages/Parent/apps/)
| 组件 | 说明 |
|------|------|
| `ParentDashboardApp` | 家长数据仪表盘 |
| `InterestClassApp` | 兴趣班管理 |
| `InterestSettingsApp` | 利息设置 |
| `SubscriptionApp` | 订阅管理 |
| `TaskPrintApp` | 任务打印 |
| `KidSettingsApp` | 孩子设置 |
| `TermSettingsApp` | 学期设置 |
| `SecurityApp` | 安全设置 |

## 数据流

### 读取流程
1. `useAppData.js` 在 token 有效时 `Promise.all` 拉取 kids/tasks/inventory/orders/transactions/classes
2. 通过 SSE (`/api/sync`) 监听服务端推送，收到 `sync` 事件后 debounce 3s 重拉全量数据
3. 页面可见性变化时自动重连 SSE
4. 每 2 分钟 fallback 轮询

### 写入流程
1. 组件调用 `useTaskManager` 或 `useShopManager` 的方法
2. 方法内部: `pauseSync()` → `apiFetch()` → `setTasks(prev => ...)` → `resumeSync()`
3. 服务端收到写入后 `notifyUser(userId)` 推送 SSE 事件
4. 前端收到事件时如果 sync 未暂停，则重拉数据

### 核心竞态保护
- `pauseSync()`: 在多步操作（如审核 = 更新任务 + 发金币 + 加经验）期间暂停 SSE 刷新
- `resumeSync()`: 操作完成后解锁，如果期间有未处理的 SSE 事件则延迟 5s 后刷新

### 订阅到期降级
- `useSubscription.js` 提供 `guardAction()` — 到期用户的写操作被拦截，弹出 `PaywallModal`
- 到期用户仍可只读访问所有数据
- `ExpiredBanner` 在页面顶部显示续费提示

## 状态管理

### Context 层
```
AuthContext   → token, user, authLoading
DataContext   → kids, tasks, inventory, orders, transactions, classes, notifications
UIContext     → appState（已弃用，仅保留兼容）, 弹窗可见性 flags
```

### Zustand Stores (4个)
```
modalStore.js       → 27个弹窗的 开/关 状态、编辑目标等
formStore.js        → 表单数据（planForm, newItem, newKidForm, transferForm, reviewForm 等）
navigationStore.js  → Tab切换、筛选器、日期导航、家长PIN设置
timerStore.js       → 计时器状态（正计时/倒计时/番茄钟）
```

## 虚拟宠物系统

### 架构
```
VirtualPet/
├── VirtualPetDashboard.jsx   # 宠物主视图（纯 JSX 渲染，~1100行）
├── usePetGame.js             # 游戏逻辑 Hook（状态 + 循环 + 交互，~860行）
├── petConstants.js           # 像素图标常量 + 时段定义（~210行）
├── PixelIcon.jsx             # 通用像素图标渲染组件
├── PetRoomModal.jsx          # 房间全屏弹窗
├── PixelPetEngine.jsx        # 像素渲染引擎（Sprite动画）
├── PixelBackground.jsx       # 像素风格房间背景
├── FurnitureShop.jsx         # 家具商城
├── BackpackModal.jsx         # 背包系统
├── PetCapsule.jsx            # 全局浮动胶囊（快速进入宠物房间）
└── PetBoxTeaser.jsx          # 宠物盲盒引导
```

### 数据驱动
```
src/data/
├── petSpecies.js       # 宠物物种定义（进化阶段）
├── furnitureCatalog.js  # 家具目录（house decorations）
├── itemsCatalog.js      # 消耗品目录
├── roomConfig.js        # 15个房间主题配置
└── defaultHabits.js     # 默认习惯模板
```

### 相关 Hooks
| Hook | 说明 |
|------|------|
| `usePetRooms.js` | 房间CRUD、家具布置、主题切换 |
| `usePetCoins.js` | 宠物消费（扣币/退款，含开发调试模式） |
| `useAntiAddiction.js` | 防沉迷：每日15分钟 + 任务奖励时间 |
| `useSwipeBack.js` | 手势返回拦截（防止误退出房间） |

## Hooks 清单

| Hook | 文件大小 | 说明 |
|------|---------|------|
| `useTaskManager.js` | 78KB | 核心业务：打卡/审核/奖励/打回/快速完成 |
| `useTasks.js` | 33KB | 任务调度算法（周期、重复、日期过滤） |
| `useAppData.js` | 12KB | SSE 同步 + 数据初始化 + 批量拉取 |
| `usePetRooms.js` | 12KB | 宠物房间管理 |
| `useShopManager.js` | 9KB | 商城购买/发货逻辑 |
| `useAuth.js` | 6KB | 登录/注册/忘记密码 |
| `useSwipeBack.js` | 5KB | 手势返回处理 |
| `useAntiAddiction.js` | 4KB | 防沉迷计时 |
| `usePetCoins.js` | 3KB | 宠物消费系统 |
| `useSubscription.js` | 728B | 订阅到期写操作守卫 |
| `useToast.js` | 460B | Toast 通知 |
| `useOnClickOutside.js` | 667B | 点击外部关闭 |

## 数据库表

| 表名 | 说明 |
|------|------|
| `users` | 用户（含 role、subscription 信息） |
| `activation_codes` | 激活码 |
| `kids` | 孩子档案（余额、经验、等级） |
| `tasks` | 任务/习惯定义 |
| `inventory` | 商品库存 |
| `orders` | 兑换订单 |
| `transactions` | 金币交易记录 |
| `classes` | 兴趣班 |
| `ai_config` | AI 配置 |
| `ai_usage_log` | AI 用量日志 |
| `user_settings` | 用户个性化设置 |
| `login_log` | 登录日志 |
| `announcements` | 系统公告 |
| `interest_history` | 利息发放记录 |
| `app_settings` | 应用全局设置（收款码等） |
| `pet_rooms` | 宠物房间（家具布局、主题） |
| `pet_anti_addiction` | 防沉迷交互记录 |

## API 端点清单

### 认证 (`/api`)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/register` | 注册 |
| POST | `/api/login` | 登录 |
| GET | `/api/me` | 当前用户信息 |
| GET | `/api/me/codes` | 我的激活码 |
| POST | `/api/redeem-code` | 激活码兑换 |
| POST | `/api/forgot-password` | 忘记密码（发送邮件） |
| POST | `/api/verify-reset-code` | 验证重置码 |
| POST | `/api/reset-password` | 重置密码 |
| GET | `/api/settings/public` | 公开设置（收款码等） |
| GET | `/api/sync` | SSE 实时同步 |

### 业务 CRUD
| 方法 | 路径 | 说明 |
|------|------|------|
| CRUD | `/api/kids` | 孩子管理 |
| POST | `/api/kids/:id/reward` | 原子奖励（金币+经验） |
| CRUD | `/api/tasks` | 任务管理 |
| PUT | `/api/tasks/:id/history` | 更新打卡记录 |
| CRUD | `/api/inventory` | 商品管理 |
| CRUD | `/api/orders` | 订单管理 |
| CRUD | `/api/classes` | 兴趣班管理 |
| CRUD | `/api/transactions` | 交易记录 |

### 宠物系统 (`/api/pet`)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/pet/rooms` | 获取宠物房间列表 |
| POST | `/api/pet/rooms` | 创建/更新房间 |
| PUT | `/api/pet/rooms/:id` | 更新房间配置 |
| POST | `/api/pet/interaction` | 记录互动时长 |
| GET | `/api/pet/interaction/today` | 今日互动统计 |

### 利息系统 (`/api/interest`)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/interest/calculate` | 计算并发放利息 |
| GET | `/api/interest/history` | 利息发放历史 |

### 设置 (`/api/settings`)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/settings` | 获取用户设置 |
| PUT | `/api/settings` | 更新用户设置 |

### AI (`/api/ai`)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/ai/parse-homework` | AI 解析作业 |

### 管理员 (`/api/admin`)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/codes` | 生成激活码 |
| GET | `/api/admin/codes` | 激活码列表 |
| PUT | `/api/admin/codes/:code/revoke` | 撤销激活码 |
| DELETE | `/api/admin/codes/:code` | 删除激活码 |
| GET | `/api/admin/users` | 用户列表 |
| GET | `/api/admin/users/:id/details` | 用户详情 |
| PUT | `/api/admin/users/:id/status` | 封禁/解封 |
| PUT | `/api/admin/users/:id/subscription` | 修改订阅 |
| POST | `/api/admin/users/:id/reset-password` | 重置密码 |
| DELETE | `/api/admin/users/:id` | 删除用户 |
| GET/PUT | `/api/admin/ai-config` | AI 配置 |
| GET | `/api/admin/ai-usage` | AI 用量 |
| PUT | `/api/admin/users/:id/ai-quota` | AI 配额 |
| GET/PUT | `/api/admin/settings` | 全局设置 |
| POST | `/api/admin/settings/upload-qr` | 上传收款码 |

### 管理员统计 (`/api/admin/stats`)
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/stats/overview` | 数据概览 |
| GET | `/api/admin/stats/growth` | 增长趋势 |
| GET | `/api/admin/stats/funnel` | 转化漏斗 |
| GET | `/api/admin/stats/expiring` | 即将到期用户 |
| GET | `/api/admin/stats/recent-activity` | 近期活动 |
| GET | `/api/admin/stats/system-health` | 系统健康 |
