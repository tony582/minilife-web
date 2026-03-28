# MiniLife 🌟 家庭成长平台

> 一款面向家庭的儿童成长管理 PWA，帮助家长和孩子一起培养好习惯、管理学习任务、建立理财意识。

## ✨ 功能概览

### 👨‍👩‍👧 家长端
- **习惯管理** — 创建好/坏习惯，一键打卡/记录，每日/每周限额
- **学习任务** — 创建任务、设置时间/金币奖励、审核孩子提交
- **AI 任务助手** — 通过 AI 自动解析作业照片生成任务
- **财富管理** — 查看孩子余额变动、发放/扣除家庭币
- **商城管理** — 上架奖品，管理孩子兑换订单
- **兴趣班管理** — 排课、签到、请假管理
- **情绪保护** — 频繁扣分时触发冷静提醒

### 🧒 学生端
- **习惯打卡/坦白** — 好习惯打卡获得家庭币，坏习惯坦白自动扣除
- **学习任务** — 计时器（正计时/倒计时/番茄钟）完成任务
- **小金库** — 查看余额、收支明细、今日赚取明细
- **商城** — 用家庭币兑换奖品
- **个人中心** — 等级、经验值、徽章

## 🛠 技术栈

| 层       | 技术                                    |
|----------|----------------------------------------|
| 前端     | React 19 + Vite 7 + TailwindCSS 4      |
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
npx vite --host 0.0.0.0
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
│   ├── hooks/                 # 业务逻辑 Hooks
│   ├── components/modals/     # 25 个独立弹窗组件
│   ├── pages/Kid/             # 学生端页面
│   ├── pages/Parent/          # 家长端页面
│   └── utils/                 # 工具函数
├── server/
│   ├── server.js              # Express 入口
│   ├── database.js            # PostgreSQL 连接 + DDL
│   ├── routes/                # 10 个路由模块
│   └── aiRoutes.js            # AI 相关路由
├── upload.sh                  # 一键部署脚本
└── ARCHITECTURE.md            # 架构文档
```

## 📖 相关文档

- [ARCHITECTURE.md](ARCHITECTURE.md) — 系统架构、数据流、状态管理
- [HANDOFF.md](HANDOFF.md) — 协作交接文档
- [.agents/workflows/deploy.md](.agents/workflows/deploy.md) — 部署流程
- [.agents/workflows/brand-guidelines.md](.agents/workflows/brand-guidelines.md) — 品牌设计规范
