# Repository Guidelines

## Project Structure & Module Organization
- `web/`: Vite + React (TypeScript) front end; `App.tsx` controls layout, `QRGenerator.tsx` 与 `QRScanner.tsx` 实现功能视图。
- `web/public/`: 静态资源（如 `favicon.svg`），构建时原样复制。
- `dist/`: 由 `pnpm build:web` 生成的 bundle，Wrangler 直接托管。
- `src/worker.js`: Cloudflare Worker 入口，负责边缘逻辑与短链转发。
- `redirect-tools/`: 自定义短链配置。
- `wrangler.toml`: 部署目标、资产目录与自定义域配置。
- `package.json` / `pnpm-lock.yaml`: 依赖与脚本；`tsconfig.json` / `web/tsconfig.json` 定义 TypeScript 选项。
- `web/src/types/`: 本地声明文件（例如 `jsqr` 类型定义）。

## Build, Test, and Development Commands
- `pnpm install`: 同步依赖（修改 `package.json` 后执行）。
- `pnpm dev` 或 `pnpm dev:web`: 本地启动 Vite (`http://localhost:5173`) 预览前端。
- `pnpm dev:worker`: 使用 Wrangler 玩家的 `dist/` 产物做本地 Worker 调试。
- `pnpm build` / `pnpm build:web`: 生产构建，刷新 `dist/` 内容。
- `pnpm run deploy`: 先构建再部署到默认环境；`pnpm run deploy:prod` 推送到 `production` 环境。以上脚本使用本地安装的 `wrangler@4`，必要时也可执行 `npx wrangler …`。
- 部署前务必确认 `dist/` 已由最新代码生成。

## Coding Style & Naming Conventions
- TypeScript/React：使用 ES Modules、Hooks、语义化变量（如 `canvasRef`、`autoGenerate`）。
- 严格模式已开启；参考 `QRGenerator.tsx`、`QRScanner.tsx` 为 refs、事件处理添加类型注解。
- 样式集中在 `App.css`，保持两空格缩进与既有配色/阴影风格。
- 静态资源使用 kebab-case (`favicon.svg`)，组件文件使用 PascalCase。
- 可运行 Prettier；如未启用，请保持现有格式与空行约定。

- 目前未配置自动化测试；提交重要改动时在 PR 中列出手动验证步骤（生成/识别二维码、导航切换等）。
- 若引入测试脚本或框架（如 Miniflare、Vitest），请同步更新命令说明并记录覆盖范围。

## Commit & Pull Request Guidelines
- Commit 消息保持“动词 + 上下文”，例：`Add hash navigation shell`。
- PR 描述包含：变更摘要、测试记录、部署影响，以及必要的截图或录屏（尤其是 UI 更新）。
- 涉及 `wrangler.toml`、`package.json`、`tsconfig` 的更改需在 PR 中明确指出。

## Security & Configuration Tips
- 环境机密通过 Wrangler 环境变量管理，切勿写入仓库。
- 不要提交 `dist/` 或临时构建文件；本地构建仅用于部署。
- 部署前核对 `wrangler.toml` 中的自定义域与资产目录是否正确。

## Adding New Tool Views
- 在 `web/src` 下创建新的功能组件（保持 PascalCase 文件名），并导出 React 组件。
- 在 `web/src/App.tsx` 的 `toolRoutes` 数组中注册新路由：设置 `path`（用于 URL）、`label`（侧边栏显示文案）与 `Component`（刚创建的组件）。
- 若功能依赖较重，可使用 `React.lazy` + `Suspense` 在 `App.tsx` 中懒加载组件，并通过 `preload` 回调实现用户悬停或空闲时预加载。
- 如需外链，请在 `externalTools` 列表中补充，保持与现有结构一致。
- 本地运行 `pnpm dev:web` 验证路由与 UI，生产前执行 `pnpm build:web` 以确保构建成功。
- 部署前确保 `wrangler.toml` 的 `[assets]` 段落设置 `binding = "ASSETS"`，Worker 通过 `env.ASSETS.fetch` 服务 SPA 入口与静态资源。
