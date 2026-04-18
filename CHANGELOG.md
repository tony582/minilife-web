# MiniLife 更新日志 (CHANGELOG)

所有重要版本的更新记录。格式基于 [Keep a Changelog](https://keepachangelog.com/)。

---

## [1.3.0] - 2026-04-18

### 🎨 头像系统重建
- **新增 `avatarPresets.js`** — 统一管理头像预设、URL 生成、性别检测（取代分散的 emoji 数组）
- **集成 DiceBear Miniavs** — 克制高质感扁平人物风格，纯 CDN，零安装
- **精选儿童友好预设**：女生 8 个（Lily / Sofia / Xiao / Mila / Bubu / Cherry / Lele / Nini）+ 男生 8 个（Noah / Rex / Bao / Ace / Pangpang / Bear / Paisley / Maple）
- 所有头像均通过 API 参数限制：无眼镜、无耳环、无胡须，完全儿童友好
- 存储格式 `miniavs:SeedName`，兼容旧版 base64 照片和 emoji 头像

### 👤 AddKidModal 重构
- 头像选择器从 emoji 网格升级为 **Miniavs 图片网格**（4列，按性别过滤）
- **新增宝贝照片上传** — 拍照/相册上传，压缩至 320px JPEG；上传后显示圆形预览 + ✕ 清除
- 性别切换自动预选对应性别默认头像
- 男孩/女孩 emoji 替换为 **♂/♀ 扁平符号**

### 🔒 批量导入习惯全屏修复（手机端）
- `HabitTemplateModal` z-index 从 `z-[200]` 提升至 `z-[10000]`，覆盖底部导航栏（z-9999）
- Footer 新增 `safe-area-inset-bottom` 内边距，适配 iPhone 刘海

### 🧩 AvatarDisplay 组件升级
- 支持 `miniavs:seed` 格式渲染，自动拼接 DiceBear API URL
- 向后兼容 base64 照片和 legacy emoji

### 📝 文档
- CHANGELOG.md 补充历史版本记录
- avatarPresets.js 内置注释说明存储格式和参数约束

---


### 🏗 架构重构
- **VirtualPetDashboard 拆分** — 2064 行巨型文件拆分为 4 个模块：
  - `usePetGame.js` (861行) — 游戏状态 Hook（30+ useState、游戏循环、随机事件、交互逻辑）
  - `petConstants.js` (208行) — 像素图标常量、昼夜时段定义
  - `PixelIcon.jsx` (29行) — 通用像素图标渲染组件
  - `VirtualPetDashboard.jsx` (1101行) — 纯 JSX 渲染层（从 2064 行减少 47%）

### 📝 文档
- ARCHITECTURE.md 更新虚拟宠物模块目录结构
- HANDOFF.md 更新常见陷阱：Dashboard 拆分后的修改指引

---

## [1.1.0] - 2026-04-15

### 🔒 安全修复
- **[P0] 关闭宠物系统无限金币漏洞** — `DEV_MODE` 从 `true` 改为 `false`，恢复真实余额和扣款检查
- **[P1] 隐藏生产环境调试工具栏** — 宠物房间的 Debug Toolbar 不再对用户可见
- **[P1] JWT Secret 改用环境变量** — 从源码硬编码迁移到 `process.env.JWT_SECRET`，防止密钥泄露

### 📝 文档
- **ARCHITECTURE.md 全面重写** — 系统架构图、React Router 路由、4个 Zustand Store、虚拟宠物系统、50+ API 端点
- **HANDOFF.md 全面重写** — 完整项目结构树、12个路由模块、17张数据库表、9条常见陷阱
- **README.md 全面重写** — 功能概览、技术栈、项目规模统计
- **新增 CHANGELOG.md** — 版本更新日志

### ⚠️ 注意
- JWT Secret 已更新，所有用户需重新登录

---

## [1.0.0] - 2026-04-07 (tag: v1.0.0)

### 🐾 虚拟宠物系统
- 像素渲染引擎 (PixelPetEngine) — Sprite 动画驱动
- 多房间系统 — 家/浴室/医院 3个场景切换
- 15种房间主题背景，家具换色系统
- 家具商城 — 用家庭币购买装饰
- 背包系统 — 物品管理和使用
- 宠物进化 — 幼猫→少年猫→成年猫（数据驱动）
- 防沉迷 — 每日15分钟 + 任务奖励时间
- 全局浮动胶囊 — PetCapsule 随时进入
- 随机事件 — 蝴蝶/下雨/礼物/噩梦等
- 任务完成联动 — 完成任务时宠物有反应
- 猫碗喂食 — 动态走位 + 吃饭动画
- 睡眠系统 — 关灯/唤醒 + 床位自动定位
- 生病/治疗 — 医院场景 + 治愈动画
- 便便/打扫 — 清洁度管理

### 👤 个人中心重设计
- Dribbble 健康 App 风格全面重设计
- Hero区 + 宠物合并为一张卡
- 等级胶囊弹出特权图鉴
- 头像上传交互全修复

### 💰 订阅到期降级
- 到期用户可只读访问，写操作弹续费弹窗
- PaywallModal + ExpiredBanner 组件
- useSubscription hook 写操作守卫

---

## [0.9.0] - 2026-03 ~ 2026-04

### 🎮 宠物系统早期阶段
- Phase 1: 守护精灵成长系统、进化、利息加成
- Phase 2: 性格系统 + 昼夜循环
- Phase 3: 随机事件 + 任务联动
- 精灵命名、情感文案、成就系统 40 枚

### 📱 习惯系统增强
- 习惯卡片 Dribbble 级 Premium 设计
- 习惯模板一键导入（47个精选模板）
- 拖拽排序 + 批量删除
- 1列/2列视图切换

### ⏱ 计时器大重构
- V3→V4 计时器重做：300px SVG 环 + 霓虹发光
- 正计时/倒计时/番茄钟三模式
- 离开确认弹窗 + 自动保存

### 🏗 架构变更
- 数据库从 SQLite 迁移到 PostgreSQL
- 弹窗拆分为 27 个独立组件
- 路由拆分为 12 个模块
- Zustand 状态管理引入（4 个 store）

---

## [0.8.0] - 2026-03

### 🛡 管理员系统
- SaaS Admin 仪表盘（KPI + 用户管理）
- 增长趋势、转化漏斗、系统健康监控
- 激活码管理（生成/撤销/删除）
- 用户封禁/解封、订阅管理、密码重置
- AI 配额管理

### 📧 忘记密码
- 邮箱验证码重置流程（Nodemailer）

### 📋 任务审核优化
- 左右对比布局（计划 vs 实际）
- Audit Trail 审核时间轴
- 被打回任务红色标记

---

## [0.7.0] - 2026-03

### 🛒 商城系统
- 商品上架/库存管理
- 孩子兑换 + 家长发货
- QR 码订单验证
- 每孩限购

### 📊 财富管理
- 金币余额/收支明细
- 转账（存钱罐/慈善）
- 利息系统

### 🎓 兴趣班管理
- 排课/签到/请假
- 课程统计

---

## [0.1.0] - 2026-02

### 🚀 项目初始化
- React 19 + Vite 7 + TailwindCSS 4 项目搭建
- Express 后端 + SQLite 数据库
- 基础认证（注册/登录）
- 孩子管理 CRUD
- 任务创建/打卡/审核基础流程
- SSE 实时同步
