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

### Tab 主题色（左上角半圆装饰 + 交易记录分类标签）
| Tab | 名称 | 主色 | 副色 | 用途 |
|-----|------|------|------|------|
| 任务 | study/tasks | `#FF8C42` 橙 | `#FFD93D` 黄 | 任务分类交易、任务Tab半圆 |
| 习惯 | habit/plans | `#4ECDC4` teal | `#10B981` 绿 | 习惯分类交易、习惯Tab半圆 |
| 财富 | wealth | `#6C9CFF` 蓝 | `#93B8FF` 浅蓝 | 财富Tab半圆 |
| 超市 | shop | `#7C5CFC` 紫 | `#A78BFA` 浅紫 | 商店分类交易、超市Tab半圆 |
| 我的 | profile | `#EC4899` 粉 | `#F472B6` 浅粉 | 宠物分类交易、我的Tab半圆 |

### 交易记录分类色
- 任务完成：`#FF8C42`（子分类用 `getCatHexColor()` 按学科独立配色）
- 习惯打卡：`#4ECDC4`
- 商店兑换：`#7C5CFC`
- 宠物消费：`#F472B6`
- 利息收入：`#4ECDC4`
- 爱心公益：`#EC4899`
- 惩罚扣分：`#FF6B6B`
- 收入/支出：`#10B981` / `#FF6B6B`

### 通用色
- 主色调：Indigo-Purple 渐变（`#6366f1 → #8b5cf6`）
- 辅助色：橙-玫红渐变（注册/活力场景）
- 成功色：Emerald/Teal
- 背景：暖白 cream（`#FBF7F0`）

## 设计原则
- 卡片式布局，大圆角（rounded-2xl / rounded-3xl）
- 毛玻璃效果（backdrop-blur）
- 微动画增强交互感
- 移动优先响应式设计
