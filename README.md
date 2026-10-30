# 产品工程变更管理系统 (MOC Management System)

基于 Next.js 14 (React 18)、TypeScript 与 Tailwind CSS 构建的企业级工程变更控制台。

---

## 🚀 部署到 GitHub Pages 指南

**纯前端静态演示架构**（基于浏览器 `localStorage` 驱动，预置真实演示数据）。


## 📦 项目架构说明

- **前端框架**：Next.js 14 App Router + React 18 + Tailwind CSS + Lucide Icons
- **演示数据层**：`lib/clientDb.ts`（以 `localStorage` 接管 MOC 台账持久化，无须外部后端即开即用）
- **预置数据底表**：`lib/mocSeedData.ts`
- **全栈服务备份**：`api-server-backup/`（保留原 Node.js Route Handlers，便于未来切换为微服务或全栈容器化部署）
