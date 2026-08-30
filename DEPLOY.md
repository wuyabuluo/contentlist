# Vercel 部署指南

> 目标：5 分钟内把项目部署到 Vercel，拿到 `xxx.vercel.app` 公网 URL
> 适用：自用期（不做宣传，不挂自己的域名，不接后端）

---

## 前置准备

| 项 | 是否必须 | 备注 |
|---|---|---|
| Vercel 账号 | ✅ | 用 GitHub 登录最快（一个账号打通两个） |
| GitHub 账号 | ✅ | Vercel 直接 import 仓库 |
| Git 客户端 | ✅ | Windows 推荐 [Git for Windows](https://git-scm.com/download/win) |
| 项目代码 | ✅ | 本仓库 |

---

## 步骤 1 · 注册账号（2 分钟）

1. 打开 https://github.com 注册（如果还没有）
2. 打开 https://vercel.com 点 **"Sign Up"** → 选 **"Continue with GitHub"** → 授权
3. 进入 Vercel Dashboard：https://vercel.com/dashboard

---

## 步骤 2 · 创建 GitHub 仓库（1 分钟）

1. 登录 GitHub → 右上角 ＋ → **New repository**
2. 填写：
   - **Repository name**: `contentlist`（或任意你喜欢的名字）
   - **Description**: 内容清单分享平台
   - **Public** / **Private** 选哪个都行（Vercel 都支持）
   - **不要**勾选 "Add a README file" / "Add .gitignore" / "Choose a license"（我们已经有了）
3. 点 **Create repository**
4. 记住仓库地址，类似：`https://github.com/你的用户名/contentlist.git`

---

## 步骤 3 · 推送代码到 GitHub（1 分钟）

打开 PowerShell，**进入项目目录**：

```powershell
cd 'D:\minimax-workplace\内容清单'

# 初始化 git 仓库
git init

# 配置用户信息（首次使用 git 才需要）
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"

# 添加所有文件（.gitignore 会自动排除 .preview/）
git add .

# 第一次提交
git commit -m "feat: v1.0.1 初次部署"

# 关联到你的 GitHub 仓库（替换 URL）
git remote add origin https://github.com/你的用户名/contentlist.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

> ⚠️ 第一次 push 会弹出 GitHub 登录窗口，按提示登录即可。

---

## 步骤 4 · 在 Vercel 部署（1 分钟）

1. 打开 https://vercel.com/new
2. **Import Git Repository** 区域会列出你的 GitHub 仓库
3. 找到 `contentlist` 仓库 → 点 **Import**
4. 配置项目：
   - **Project Name**: 决定你的子域名，比如填 `contentlist` → URL 就是 `contentlist.vercel.app`
   - **Framework Preset**: 选 **"Other"**（不要选 Vite/Next.js）
   - **Root Directory**: 留空（默认）
   - **Build Command**: 留空（纯静态站不用 build）
   - **Output Directory**: 留空
5. 点 **Deploy**
6. 等 30-60 秒 → 出现 🎉 撒花动画 → 部署完成

---

## 步骤 5 · 拿到 URL

部署完成后，Vercel 会显示你的公网 URL，类似：

```
https://contentlist.vercel.app
```

把这个 URL 发给朋友，他们就能访问了。

---

## 之后 · 怎么更新代码

每次改完代码后：

```powershell
cd 'D:\minimax-workplace\内容清单'
git add .
git commit -m "改了啥"
git push
```

Vercel 会**自动**重新部署（30 秒），URL 不变。

---

## 常见问题

### Q1. 子域名被占用怎么办？
Vercel 会自动加后缀，比如 `contentlist-abc123.vercel.app`。或者换个名字重新部署。

### Q2. 部署后访问是空白的？
打开浏览器 F12 → Console 看错误。99% 是路径问题。如果看到 404 文件没找到，检查 `vercel.json` 里的路径配置。

### Q3. Vercel 会自动 HTTPS 吗？
**会**。所有 vercel.app 子域名自动 HTTPS，无需配置。

### Q4. 部署后访问的是新的 localStorage，跟本地不一样？
**是的**。每个域名（origin）的 localStorage 是隔离的。
- 本地 `file://` 调试的数据 ≠ Vercel 上的数据
- Vercel 上每个用户的浏览器 localStorage 也互相隔离
- 之前在本地导出的 JSON 备份，可以在新环境里通过"导入"功能恢复（**导入功能节点 3 实现，现在还没做**）

### Q5. 朋友能注册/用吗？
**能**。每个访客的 localStorage 是独立的，他们登录会建自己的匿名账号，能创建清单、能发内容。但你看不到他们的内容（演示模式无后端）。

### Q5. 国内访问慢？
Vercel 部署在海外节点，国内访问延迟 200-500ms。早期够用。要更快需要国内备案 + 国内 CDN，那是节点 5 的事。

### Q6. 部署后想看访问统计？
Vercel 免费版自带基础统计：https://vercel.com/dashboard → 选项目 → **Analytics** tab。

---

## 下一步

部署完成后：

1. **用真实场景测试**：在手机上访问 `xxx.vercel.app` → 完整跑一遍"登录 → 发布 → 加入清单 → 收藏"流程
2. **分享给朋友**：把 URL 发到微信群 / 发给 2-3 个朋友
3. **攒内容**：自己持续往里加内容，触发"接后端"条件
4. **回到节点 3**：内容 ≥ 30 清单 / 100 单条时，导出 JSON 贴给我，我开干迁移

详见 `DEVELOPMENT.md`。
