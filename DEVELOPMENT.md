# 清单 · 产品开发文档

> **版本**：v1.0.1 · 2026-08-30
> **模式**：纯前端 + localStorage（自用期）
> **目标**：内容清单分享平台（类网易云歌单）
> **维护**：单人在前端浏览器内自用 → 内容充裕后接后端 → 公测 → 正式上线

---

## 1. 项目概述

**一句话定位**：用户分享抖音 / 小红书 / 公众号 / B 站内容链接，组织成清单，互相发现。

**核心能力**：
- 发布单条内容（一键分享链接 + 简介）
- 创建清单（把多条内容组织成一个主题）
- 浏览、收藏其他清单
- 点赞、举报

**支持平台**：抖音、小红书、微信公众号、B 站

---

## 2. 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 前端 | 纯 HTML + 原生 JS + CSS | 不引入框架，零依赖 |
| 数据 | localStorage 模拟后端 | 演示期无真实数据库 |
| 部署 | 静态站（计划 Vercel） | 暂未部署，本地浏览器自用 |
| 法律 | `legal/agreement.html` + `legal/privacy.html` | 已上线可用 |

**已知限制**：
- 换设备 / 清浏览器缓存 = 数据全没（已提供"导出我的数据"备份）
- 多端无法同步（同上）
- 敏感词仅前端校验（接后端时必须后端二次校验）

---

## 3. 已完成功能

### 3.1 前台（5 个页面）

| 页面 | 文件 | 功能 |
|---|---|---|
| 首页 / 发现 | `index.html` | 平台 tab、发布入口、内容流 |
| 清单详情 | `list.html` | 清单内点内容 → 抽屉弹层（不跳页） |
| 单条详情 | `item.html` | 极简版（仅"打开外站 + 返回"） |
| 我的 | `me.html` | 创建/编辑清单 + 数据导出 + 退出 |
| 登录注册 | `login.html` | 演示流程 + 用户协议勾选 |

### 3.2 后台（1 页 6 模块）

`admin.html` → admin / `jmy-12345`

| 模块 | 功能 |
|---|---|
| 数据看板 | 总量、用户数、待处理举报 |
| 举报审核 | 通过 / 拒绝（通过即删除目标 + 二次确认） |
| 清单管理 | 查看、删除、编辑所有用户清单 |
| 内容管理 | 查看、删除、编辑所有用户单条 |
| 用户管理 | 查看、封禁/解封 |
| 操作日志 | 最近 200 条管理员操作 |

### 3.3 通用能力

- 敏感词字典 364 个（12 大类，发布/编辑时拦截）
- 法律文档（用户协议 + 隐私政策）
- 数据导出（me.html "📦 导出我的数据"按钮）
- SEO 基础（动态 title/description/og meta）
- 移动端适配（底部 tab bar + 中央 FAB + 触摸目标 ≥44pt + input 16px）
- 抽屉弹层（清单页内点内容）
- 复制清单链接（剪贴板 API + prompt 降级）
- 版本号机制（`APP_VERSION='1.0.0'`，大版本自动清理 localStorage）
- 缓存控制（所有页面 no-cache meta）

---

## 4. 关键设计决策

| 决策 | 理由 |
|---|---|
| **白色主题** | 黑色主题用户反馈"不好看" |
| **清单为核心** | 用户对"清单"心智明确，不破坏浏览流 |
| **抽屉弹层**（替代单条详情页） | 清单是核心，弹层不打断浏览 |
| **顶部 nav 简化 + 底部 tab** | 移动端极简，避免按钮冗余 |
| **创建清单入口 = 发布后引导** | 不强迫创建时填简介 |
| **清单封面随机 emoji** | 视觉一致性 + 零成本 |
| **方案 B 自动生成简介** | 零摩擦，无需 AI |
| **简介创建时定一次不自动更新** | 避免分享出去的链接文案跳变 |
| **drawer 底部"复制清单链接"** | 文案诚实，剪贴板 + 降级 |
| **删除评论功能** | 无人力审核，合规风险太大 |
| **不做注册流程** | localStorage 限制下注册无意义；用"免登录 + 昵称"方案 |
| **方案 B 自动登录**（计划） | MOCK 清空后改 login.html：输入任意账号密码 → 自动建匿名 user |

---

## 5. 上线 Checklist · 状态

### 🔴 必修（已计划做）

| # | 项 | 状态 | 计划 |
|---|----|------|------|
| 1 | 改 admin 密码 | ✅ `jmy-12345` | data.js:44 |
| 2 | 删根目录冗余文件 | ✅ 软删除到 `.preview/_disabled/` | privacy.html + terms.html |
| 3 | 页脚加协议链接 | ✅ 5 个页面统一 footer | index / list / item / me / admin |
| 4 | MOCK 清空（方案 B） | ✅ B1 已实施 | 见 §6.1 |

### 🟡 推荐（暂不做）

- 真机测试（iOS Safari + Android Chrome）
- 敏感词后端校验（接后端时一起做）
- Vercel 部署
- 域名 + 备案
- sitemap.xml + robots.txt
- favicon + OG image
- 错误监控（Sentry）

### 🟢 上线后

- 接后端（50-100 用户再做）
- 评论 / 私信（合规成本高）

---

## 6. 开发节点

> **核心原则**：当前自用期只用前端浏览器，不接后端、不宣传、不挂域名。

### 6.0 节点 0：自用期 ⏳ 进行中

**触发**：从现在起
**任务**：
- 在前端浏览器里创建清单、发布内容
- me.html 顶部 tab "我创建的清单" 是入口
- 首页右下角 FAB → 分享链接
- 分享后弹"加入已有清单 / 创建新清单"引导

**数据备份（必做）**：
- 每周 / 每次大量内容后，在 me.html 点"📦 导出我的数据"
- 文件名格式：`内容清单-备份-{昵称}-{YYYY-MM-DD}.json`
- 建议存到网盘（百度/OneDrive/iCloud），不要只放本地

**验收**：
- 清单数 ≥ 30
- 单条数 ≥ 100
- 出现自然分类（如"做饭灵感 / 长文收藏 / 旅行攻略"等）

---

### 6.1 节点 1：清空 MOCK（自用期内必做一次）✅ 已完成（v1.0.1）

**方案选择**：B1 · 彻底版
- MOCK_USERS 清空（`const MOCK_USERS = []`）
- MOCK_LISTS 清空（`const MOCK_LISTS = []`）
- MOCK_ITEMS 清空（`const MOCK_ITEMS = []`）
- `seedReports()` 返回 `[]`（清掉 MOCK id 的演示举报）
- 新增 `createAnonUser({...})` 函数：自动建匿名 user 存 `contentlist_users` localStorage
- `getUserById()` 扩展为查 MOCK + localStorage
- login.html 改：输入任意账号密码 → 自动建匿名 user → 跳首页
- admin.js 用户看板扩展为 `MOCK_USERS + getLocalUsers()`

**已完成的关联改动**（v1.0.1 同批次）：
- admin 密码 `admin123` → `jmy-12345`
- 根目录冗余 `privacy.html` / `terms.html` 软删除到 `.preview/_disabled/`
- 5 个页面（index / list / item / me / admin）加统一 footer
- CSS 删早期版本 `.app-footer`（保留后期版本）

**升级说明**：
- APP_VERSION 1.0.0 → 1.0.1（patch 升级，触发 minor 升级处理：保留数据只更新版本号）
- 旧 localStorage 中的 `contentlist_current_user = 'u1'` 等 MOCK id 现在会查不到 user → 用户被要求重新登录
- 旧 userLists / userItems 数据保留，但 creatorId 是旧 MOCK id，所以重新登录后看不到旧清单
- 补救：在重新登录前用"📦 导出我的数据"备份；登录后让开发者写迁移脚本（如果需要）

---

### 6.2 节点 2：内容充裕 → 选后端

**触发条件**：
- 清单数 ≥ 30
- 单条数 ≥ 100
- 已稳定自用 1-3 个月
- 想要分享给真实用户

**任务**：

#### 6.2.1 选后端方案

| 方案 | 成本 | 难度 | 适合 |
|---|---|---|---|
| **Supabase** | 500MB DB 免费（需绑卡） | 低 | 不想运维的 |
| **Cloudflare Workers + D1** | 免费额度大 | 中 | 想要极快 |
| **自建 VPS + Node + Postgres** | 50-100 元/月 | 高 | 想完全控制 |

**建议**：先用 Supabase，省心，量大了再迁。

#### 6.2.2 准备后端 API

迁移需要后端支持以下接口（命名不限，能写就行）：
```
POST /api/users              # 创建用户
POST /api/lists              # 批量创建清单
POST /api/items              # 批量创建单条
POST /api/favorites          # 恢复收藏
POST /api/likes              # 恢复点赞
```

#### 6.2.3 域名 + 备案

- 短期：用 Vercel/Cloudflare 部署，子域名 `xxx.vercel.app` 即可
- 中期：买自己的域名（阿里云/Cloudflare Registrar）
- 国内访问快：需要 ICP 备案（7-20 天流程）

---

### 6.3 节点 3：数据迁移（关键路径）⭐

**触发**：节点 2 后端就绪
**执行方**：由 AI 助手（我）写脚本

**流程**：

#### 步骤 1 · 用户导出
- 在 me.html 点"📦 导出我的数据"
- 拿到 JSON 文件

#### 步骤 2 · 用户把 JSON 贴给我
- 打开 JSON 文件 → 全选复制 → 贴到对话

#### 步骤 3 · 我写迁移脚本（Node 或 Python）
- 读 JSON
- 按依赖顺序创建：先 user → 后 list/item → 最后 favorites/likes
- **id 映射**：本地 id（`i_1725012345678`）→ 后端新 id（UUID 或自增）→ 替换 list.itemIds 里的旧 id
- 错误重试（网络失败 / 限流）
- 进度日志
- 完成后对账（条数对比）

#### 步骤 4 · 我交付一个迁移报告
- 成功创建的 user / list / item / favorite / like 条数
- 失败的（如有）+ 原因
- 后端数据库的 ID 映射表（以防未来需要回查）

**预计耗时**：几百条内容约 1-2 小时写脚本 + 执行

---

### 6.4 节点 4：公测

**触发**：迁移完成 + 域名就位
**任务**：
- 切换前端数据源从 localStorage 到后端 API
- 修改 `js/data.js`（200-300 行）→ 调 fetch 替代 localStorage
- UI 不变
- 真实用户注册流程（手机号验证码 / 邮箱密码）
- 数据导入提示（首次登录用户可选择"导入本地数据"）

**验收**：
- 多端同步正常
- 真实举报 → 真实 admin 审核
- 性能：单页加载 < 2s

---

### 6.5 节点 5：正式上线

**触发**：公测 1-2 个月无重大问题
**任务**：
- 真机测试（iOS Safari + Android Chrome）
- 错误监控（Sentry）
- 性能优化（图片懒加载、CDN）
- SEO 提交（百度/Google Search Console）
- 隐私政策二次审核（涉及真实用户数据）
- 工信部备案（如国内访问）

---

## 7. 关键技术细节备忘

### 7.1 localStorage 键名
```
contentlist_current_user       # 当前登录用户 id
contentlist_user_lists         # 用户创建的清单
contentlist_user_items         # 用户发布的单条
contentlist_favorite_lists     # 收藏的清单 id
contentlist_liked_items        # 点赞的 item id
contentlist_reports            # 举报
contentlist_banned_users       # 封禁用户 id
contentlist_admin_logs         # 管理员操作日志
contentlist_admin_session      # 管理员登录态
contentlist_app_version        # 版本号（升级检测）
```

### 7.2 数据导出 JSON 结构
```json
{
  "__meta": {
    "formatVersion": "1.0",
    "appVersion": "1.0.0",
    "exportedAt": "2026-08-30T10:30:00.000Z",
    "source": "内容清单（本地浏览器存储演示版）",
    "note": "未来接入云端后，由 AI 助手基于此文件批量迁移"
  },
  "user": { "id": "u_xxx", "name": "我", "avatar": "我", "avatarColor": "#xxx", "bio": "..." },
  "lists": [ { "id": "l_xxx", "title": "...", "itemIds": ["i_xxx"], ... } ],
  "items": [ { "id": "i_xxx", "url": "...", "platform": "douyin", "title": "...", ... } ],
  "favoriteListIds": ["l_xxx"],
  "likedItemIds": ["i_xxx"]
}
```

### 7.3 id 命名规则
- 演示 user：`u1` `u2` ... `u4`（清 MOCK 后消失）
- 演示 list：`l1` ... `l7`（清 MOCK 后消失）
- 演示 item：`i1` ... `i12`（清 MOCK 后消失）
- 真实 user：`u_${Date.now()}`  （MOCK 清空后所有 user 都是这个格式）
- 真实 list：`l_${Date.now()}`
- 真实 item：`i_${Date.now()}`
- 后端 id（迁移后）：UUID 或自增，由后端决定

### 7.4 敏感词（前端）
- 字典位置：`js/data.js` `SENSITIVE_WORDS`
- 当前 364 个，12 大类
- 触发场景：发布 / 编辑清单标题或简介
- 命中后 toast 提示"内容含敏感词（X、X），请修改后再发布"
- **前端可绕过**：接后端时必须后端二次校验

---

## 8. 文件清单

```
D:\minimax-workplace\内容清单\
├── index.html              # 首页 / 发现
├── list.html               # 清单详情
├── item.html               # 单条详情
├── me.html                 # 我的
├── login.html              # 登录 / 注册
├── admin.html              # 后台管理
├── legal/
│   ├── agreement.html      # 用户协议
│   └── privacy.html        # 隐私政策
├── js/
│   ├── data.js             # 数据层（MOCK + localStorage）
│   ├── main.js             # 前台公共逻辑
│   └── admin.js            # 后台逻辑
├── css/
│   ├── style.css           # 前台样式
│   └── admin.css           # 后台样式
├── DEVELOPMENT.md          # ← 本文档
└── .preview/               # 测试/截图（不入产品）
    ├── _disabled/          # 软删除的文件（待 B1/B2 实施）
    └── ...
```

---

## 9. 修订记录

| 版本 | 日期 | 变更 |
|---|---|---|
| v1.0.1 | 2026-08-30 | MOCK 清空（B1）+ 登录页自动建匿名 user + 5 页面加 footer + 软删除冗余文件 + admin 密码改强 + APP_VERSION 升级 |
| v1.0.0 | 2026-08-30 | 初始版本：完成上线 P0 必修 + 数据导出 + 登录页清理 + 协议勾选 |
| | | |

---

## 10. 待办（按优先级）

- [x] **节点 1 → 4 连做**：admin 密码 / 删冗余 / 加页脚 / MOCK 清空（B1）
- [ ] 自用期内：定期导出数据
- [ ] 内容充裕后：进入节点 2（选后端）
- [ ] 节点 3：迁移数据（贴 JSON 给我，我写脚本）
- [ ] 节点 4：切换数据源
- [ ] 节点 5：正式上线
