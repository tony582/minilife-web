---
description: MiniLife 品牌和设计规范
---

# MiniLife 品牌 & 设计规范

## 品牌名称
- 正式名称：**MiniLife**（M 和 L 大写）
- 不要写成：minilife / MINILIFE / Minilife / Mini Life

## 图标风格
- **优先使用扁平线性图标**（Lucide/线条风格），与现有 Icons 组件保持一致
- **避免使用 3D emoji** 作为功能图标（📧🔢🔐❌），它们在不同平台显示不一致
- 装饰性表情可少量使用（如通知消息里的 🎉），但功能图标一律用 SVG
- 参考 `src/utils/Icons.jsx` 中已有的图标集

## Logo 使用
- 应用 Logo 文件：`/minilife_logo_transparent.png`
- 邮件中使用纯文字 Logo（`MiniLife`，font-weight: 900），不加 emoji 前缀

## 配色
- 主色调：Indigo-Purple 渐变（`#6366f1 → #8b5cf6`）
- 辅助色：橙-玫红渐变（注册/活力场景）
- 成功色：Emerald/Teal
- 背景：暖白 cream（`#f8f9fc`）

## 设计原则
- 卡片式布局，大圆角（rounded-2xl / rounded-3xl）
- 毛玻璃效果（backdrop-blur）
- 微动画增强交互感
- 移动优先响应式设计
