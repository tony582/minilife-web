# MiniLife 架构文档 (ARCHITECTURE.md)

## 系统架构

```
┌─ Browser (React SPA) ──────────────────────────────┐
│                                                     │
│  AuthProvider → DataProvider → UIProvider → App      │
│       │              │              │                │
│   useAuth.js   useAppData.js   UIContext.jsx         │
│                  (SSE sync)     (90+ useState)       │
│                      │                               │
│              ┌───────┴────────┐                      │
│         KidApp.jsx      ParentApp.jsx                │
│              │                │                      │
│         5 Tab Pages      5 Tab Pages                 │
│                                                      │
│  GlobalModals.jsx (3856 lines = 所有弹窗)             │
│    └─ useTaskManager.js (打卡/审核/奖励)              │
│    └─ useShopManager.js (购买/发货)                   │
└────────────────────────────────────────────────────────┘
         │ REST API + SSE
┌─ Server (Express + SQLite) ──────────────────────────┐
│  server.js (799 lines = 全部路由)                     │
│  aiRoutes.js (AI 任务解析，已独立)                     │
│  database.js (DDL 初始化)                             │
└───────────────────────────────────────────────────────┘
```

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

## 状态管理

### 当前架构 (Context)
```
AuthContext   → token, user, authForm
DataContext   → kids, tasks, inventory, orders, transactions, classes
UIContext     → 90+ useState (弹窗开关、Tab、表单、定时器...)
```

**问题**: UIContext 任一 `setState` 调用会导致所有订阅组件重新渲染。

## 页面导航

### 当前方式 (appState 字符串)
```javascript
// UIContext.jsx
const [appState, setAppState] = useState('profiles');
// 可选值: 'profiles' | 'parent_pin' | 'kid_app' | 'parent_app'

// App.jsx
{appState === 'kid_app' && <KidApp />}
{appState === 'parent_app' && <ParentApp />}
```

### 子页面导航 (Tab 字符串)
```javascript
// Kid: kidTab = 'study' | 'habit' | 'wealth' | 'shop' | 'profile'
// Parent: parentTab = 'tasks' | 'plans' | 'wealth' | 'shop_manage' | 'more'
```

## API 端点清单

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/register` | 注册 |
| POST | `/api/login` | 登录 |
| GET | `/api/me` | 当前用户信息 |
| POST | `/api/redeem-code` | 激活码兑换 |
| GET | `/api/sync` | SSE 同步 |
| CRUD | `/api/kids` | 孩子管理 |
| POST | `/api/kids/:id/reward` | 原子奖励（金币+经验） |
| CRUD | `/api/tasks` | 任务管理 |
| PUT | `/api/tasks/:id/history` | 更新打卡记录 |
| CRUD | `/api/inventory` | 商品管理 |
| CRUD | `/api/orders` | 订单管理 |
| CRUD | `/api/classes` | 兴趣班管理 |
| CRUD | `/api/transactions` | 交易记录 |
| POST | `/api/ai/parse-homework` | AI 解析作业 |
| GET/PUT | `/api/admin/ai-config` | AI 配置管理 |
