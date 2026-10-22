# 产品工程变更管理系统 (MOC Management System)

基于 Next.js 14 (React 18)、TypeScript 与 Tailwind CSS 构建的企业级工程变更控制台。遵循 ISO 9001 / IATF 16949 质量管理体系与制造业受控变更流程规范。

---

## 🚀 部署到 GitHub Pages 指南

本项目已改造为**纯前端静态演示架构**（基于浏览器 `localStorage` 驱动，预置真实演示数据），可直接部署到 GitHub Pages。

### 1. 自动构建与部署 (GitHub Actions - 推荐)
仓库已内置自动化工作流文件 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)。

操作步骤：
1. 在 GitHub 上创建名为 `moc-change-system` 的公开或私有仓库。
2. 将本地代码推送到该仓库：
   ```bash
   git init
   git add .
   git commit -m "feat: init MOC change system with GitHub Pages support"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/moc-change-system.git
   git push -u origin main
   ```
3. 进入 GitHub 仓库网页：
   - 点击 **Settings** ➔ **Pages**。
   - 在 **Build and deployment** 下的 **Source** 选项中，选择 **GitHub Actions**。
4. 推送代码后，GitHub Actions 会自动触发构建并发布。发布成功后即可在 `https://<你的用户名>.github.io/moc-change-system/` 在线访问。

---

### 2. 本地构建与静态产物直接托管
若需本地手动编译：
```bash
# 执行静态导出与生成 .nojekyll
npm run build
```
编译完成后的所有静态 HTML/CSS/JS 文件均存放在 `out/` 目录中，可直接上传到任何静态文件服务器或 `gh-pages` 分支。

---

## 🛠️ 本地开发运行

```bash
# 启动本地开发服务 (支持热重载，默认端口 3000)
npm run dev
```

---

## 📦 项目架构说明

- **前端框架**：Next.js 14 App Router + React 18 + Tailwind CSS + Lucide Icons
- **演示数据层**：`lib/clientDb.ts`（以 `localStorage` 接管 MOC 台账持久化，无须外部后端即开即用）
- **预置数据底表**：`lib/mocSeedData.ts`
- **全栈服务备份**：`api-server-backup/`（保留原 Node.js Route Handlers，便于未来切换为微服务或全栈容器化部署）
