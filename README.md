# MiniLife 🌟 家庭成长平台

> 一款面向家庭的儿童成长管理 PWA，帮助家长和孩子一起培养好习惯、管理学习任务、建立理财意识。内置像素风虚拟宠物系统，让成长更有趣。

## ✨ 功能概览

### 👨‍👩‍👧 家长端
- **习惯管理** — 创建好/坏习惯，一键打卡/记录，每日/每周限额
- **学习任务** — 创建任务、设置时间/金币奖励、审核孩子提交
- **AI 任务助手** — 通过 AI 自动解析作业照片生成任务
- **财富管理** — 查看孩子余额变动、发放/扣除家庭币、利息系统
- **商城管理** — 上架奖品，管理孩子兑换订单
- **兴趣班管理** — 排课、签到、请假管理
- **情绪保护** — 频繁扣分时触发冷静提醒
- **数据仪表盘** — 增长趋势、转化漏斗、系统健康
- **订阅管理** — 激活码兑换、到期续费
- **任务打印** — 任务清单导出打印

### 🧒 学生端
- **习惯打卡/坦白** — 好习惯打卡获得家庭币，坏习惯坦白自动扣除
- **学习任务** — 计时器（正计时/倒计时/番茄钟）完成任务
- **小金库** — 查看余额、收支明细、今日赚取明细
- **商城** — 用家庭币兑换奖品
- **个人中心** — 等级、经验值、成就徽章 (40枚)
- **🐱 虚拟宠物** — 像素风宠物房间，装饰家具，互动成长

### 🐾 虚拟宠物系统
- **像素渲染引擎** — Sprite 动画驱动的宠物表情和行为
- **多房间系统** — 15种主题背景，自由装饰
- **家具商城** — 用家庭币购买家具装饰房间
- **宠物进化** — 数据驱动的成长阶段（幼猫→少年猫→成年猫）
- **防沉迷** — 每日 15 分钟 + 完成任务获得额外时间
- **全局浮动胶囊** — 随时进入宠物房间

## 🛠 技术栈

| 层       | 技术                                    |
|----------|----------------------------------------|
| 前端     | React 19 + Vite 7 + TailwindCSS 4      |
| 路由     | React Router v7                         |
| 状态管理 | React Context + Zustand 5 (4 stores)    |
| 后端     | Node.js + Express + PostgreSQL          |
| AI 集成  | Gemini / DeepSeek API                   |
| 部署     | 阿里云 ECS + Nginx + PM2               |
| 实时同步 | Server-Sent Events (SSE)                |

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动前端开发服务器 (port 5173)
npm run dev

# 启动后端 API 服务器 (port 3000)
node server/server.js

# 手机局域网访问
npm run dev:wifi
```

## 📦 部署

```bash
# 必须在 main 分支
git checkout main
git merge <feature-branch>
bash upload.sh 47.103.125.200
```

> 详细部署流程见 [.agents/workflows/deploy.md](.agents/workflows/deploy.md)

## 📂 项目结构

```
minilife/
├── src/
│   ├── api/client.js          # API 请求封装
│   ├── context/               # React Context (Auth/Data/UI)
│   ├── stores/                # Zustand Stores (modal/form/navigation/timer)
│   ├── hooks/                 # 12 个业务逻辑 Hooks
│   ├── components/
│   │   ├── common/            # 全局组件（GlobalModals、PaywallModal 等）
│   │   ├── VirtualPet/        # 宠物系统（8个组件）
│   │   └── modals/            # 27 个独立弹窗组件
│   ├── pages/
│   │   ├── Kid/               # 学生端（5 Tab + 宠物）
│   │   ├── Parent/            # 家长端（5 Tab + 8 子应用）
│   │   ├── Admin/             # 管理员面板
│   │   └── Auth/              # 登录/注册/PIN/到期页
│   ├── data/                  # 静态数据（宠物/家具/习惯目录）
│   └── utils/                 # 工具函数（成就/等级/日期等）
├── server/
│   ├── server.js              # Express 入口 + SSE
│   ├── middleware.js          # JWT认证 + 封禁检查
│   ├── database.js            # PostgreSQL 连接 + DDL (17张表)
│   ├── emailService.js        # 邮件服务
│   ├── routes/                # 12 个路由模块
│   └── aiRoutes.js            # AI 相关路由
├── upload.sh                  # 一键部署脚本
├── deploy.sh                  # 服务器初始化脚本
├── setup-pg.sh                # PostgreSQL 安装脚本
└── ARCHITECTURE.md            # 架构文档
```

## 📊 项目规模

| 指标 | 数量 |
|------|------|
| Git 提交 | 412+ |
| 弹窗组件 | 27 个 |
| 业务 Hooks | 12 个 |
| 路由模块 | 12 个 |
| 数据库表 | 17 张 |
| Zustand Stores | 4 个 |
| 家长子应用 | 8 个 |
| 成就徽章 | 40 枚 |
| 房间主题 | 15 种 |

## 📖 相关文档

- [ARCHITECTURE.md](ARCHITECTURE.md) — 系统架构、数据流、状态管理、API 端点
- [HANDOFF.md](HANDOFF.md) — 协作交接文档
- [.agents/workflows/deploy.md](.agents/workflows/deploy.md) — 部署流程
- [.agents/workflows/brand-guidelines.md](.agents/workflows/brand-guidelines.md) — 品牌设计规范
- [.agents/workflows/build-apk.md](.agents/workflows/build-apk.md) — Android APK 构建
