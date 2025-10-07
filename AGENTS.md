# Repository Guidelines

## 项目结构与模块划分
- `web/` 保存 Vite + React (TypeScript) 前端；`App.tsx` 负责布局与路由，`QRGenerator.tsx`、`QRScanner.tsx` 分别实现二维码生成与识别工具。
- 静态资源位于 `web/public/`，运行 `pnpm build:web` 后产物输出到 `dist/` 并由 Worker 提供；勿将 `dist/` 提交仓库。
- 边缘逻辑集中在 `src/worker.js`，短链配置位于 `redirect-tools/`；`web/src/types/` 存放本地声明文件（如 `jsqr.d.ts`）。
- 关键配置文件：`wrangler.toml`（环境、域名与资产绑定）、`package.json`/`pnpm-lock.yaml`（依赖）、`tsconfig.json` 与 `web/tsconfig.json`（编译选项）。
- 遵循既定 UI/UX 原则：桌面端保持居中留白，移动端再收窄边距，表单使用 `.section` 等统一布局类。

## 构建、测试与开发命令
- `pnpm install`：修改 `package.json` 后同步依赖。
- `pnpm dev`/`pnpm dev:web`：启动 Vite 开发服务器，默认地址 `http://localhost:5173`。
- `pnpm dev:worker`：基于最新 `dist/` 由 Wrangler 本地调试 Worker。
- `pnpm build`/`pnpm build:web`：生成生产环境资源，部署前务必刷新。
- `pnpm run deploy` 部署到默认 Cloudflare 环境；`pnpm run deploy:prod` 发布到生产环境，必要时可使用 `npx wrangler …`。
- 开发调试时务必关闭浏览器 DevTools 的离线模式，并在需要时通过 Application → Storage → Clear site data 清理 Service Worker 缓存，防止本地离线缓存干扰调试。

## 代码风格与命名约定
- 统一使用 ES Modules、React Hooks 与语义化命名（如 `canvasRef`、`autoGenerate`），严格模式已启用，参考 `QRGenerator.tsx`、`QRScanner.tsx` 的类型注解方式。
- 样式集中在 `web/src/App.css`，保持两空格缩进并复用 `.section`、`.form-grid`、`.form-field` 等布局工具类，扩展样式时优先沿用现有变量。
- 组件文件采用 PascalCase，静态资源使用 kebab-case。若已配置 Prettier，可直接执行；否则请遵循既有空行与缩进规则。

## 测试指引
- 项目暂无自动化测试，提交 PR 时需记录手动验证步骤（二维码生成、扫码识别、页面导航等）。
- 引入 Vitest、Miniflare 等测试框架时，请在 PR 与本文档中补充命令、覆盖范围与执行方式。

## 提交与 PR 规范
- Commit 信息保持“动词 + 场景”，如 `Add hash navigation shell`，确保单次提交聚焦单一改动。
- PR 需包含变更摘要、人工测试结果、部署影响，并在涉及 UI 时附截图或录屏。
- 若修改 `wrangler.toml`、`package.json`、任一 `tsconfig`，务必在 PR 描述中显式标注。

## 安全与配置提示
- 所有密钥通过 Wrangler 环境变量管理，不得写入仓库。
- 部署前确认 `wrangler.toml` 的 `[assets]` 绑定为 `ASSETS` 且自定义域名正确。
- 扩展样式时优先复用既有 CSS 变量与工具类，避免割裂的局部风格。

## 添加新工具视图
- 在 `web/src/` 使用 PascalCase 新建组件并导出 React 组件。
- 在 `web/src/App.tsx` 的 `toolRoutes` 中登记 `path`、`label`、`Component`；对重量级视图可结合 `React.lazy` 与 `Suspense` 并添加 `preload` 回调。
- 同时为每个工具在 `web/src/tools.tsx` 写明 `executionMode`（`browser` 或 `remote`）与 `executionNote`，用于渲染运行方式提示；新增工具若依赖远程服务必须显式说明原因与安全注意事项。
- 如需外链更新 `externalTools` 列表，本地通过 `pnpm dev:web` 验证后执行 `pnpm build:web` 确认生产构建。
