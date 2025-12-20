# tools.dev66.net

[English](README.md) | 简体中文

## 项目简介
访问 **[dev66.net](https://dev66.net)** – 查看所有可用工具的主入口。

[tools.dev66.net](https://tools.dev66.net/) 是一个开源的前端开发者工具合集，前端基于 Vite + React 构建并以静态资源形式部署，由 Cloudflare Worker 提供分发与域名重定向。所有数据处理都在浏览器本地完成，粘贴的内容不会离开你的设备。

## 现有功能
- **二维码生成器**：支持链接、文本、Wi-Fi 与名片二维码，生成高清 PNG 图片。中文版入口：[https://tools.dev66.net/zh-cn/qr-generator.html](https://tools.dev66.net/zh-cn/qr-generator.html)
- **二维码识别器**：拖拽、上传或粘贴图片即可识别，内置旋转纠正与模糊增强。中文版入口：[https://tools.dev66.net/zh-cn/qr-scanner.html](https://tools.dev66.net/zh-cn/qr-scanner.html)
- **URL 解析器**：实时拆解协议、域名、路径与查询参数，附带编码/解码工具。中文版入口：[https://tools.dev66.net/zh-cn/url-parser.html](https://tools.dev66.net/zh-cn/url-parser.html)
- **JSON 格式化器**：一键美化、压缩、校验 JSON，提供主题切换与复制功能。中文版入口：[https://tools.dev66.net/zh-cn/json-formatter.html](https://tools.dev66.net/zh-cn/json-formatter.html)
- **Markdown 渲染器**：双栏实时预览 GitHub 风格 Markdown，支持主题切换与打印导出。中文版入口：[https://tools.dev66.net/zh-cn/markdown-renderer.html](https://tools.dev66.net/zh-cn/markdown-renderer.html)
- **JWT 解码器**：解析 Header、Payload、Signature，本地校验 HS256 并标注过期时间。中文版入口：[https://tools.dev66.net/zh-cn/jwt-decoder.html](https://tools.dev66.net/zh-cn/jwt-decoder.html)
- **Base64 编解码器**：兼容标准与 URL Safe 变体，显示字节统计并支持复制。中文版入口：[https://tools.dev66.net/zh-cn/base64-converter.html](https://tools.dev66.net/zh-cn/base64-converter.html)
- **十六进制转换器**：文本与十六进制互转，可配置大小写、分隔符与长度统计。中文版入口：[https://tools.dev66.net/zh-cn/hex-converter.html](https://tools.dev66.net/zh-cn/hex-converter.html)
- **转义字符解码器**：兼容 JSON、JavaScript、Python、Shell 等转义规则，支持重新编码。中文版入口：[https://tools.dev66.net/zh-cn/escape-decoder.html](https://tools.dev66.net/zh-cn/escape-decoder.html)
- **哈希计算器**：生成 MD5、SHA-1、SHA-256 等摘要，提供大小写与 Base64 结果。中文版入口：[https://tools.dev66.net/zh-cn/hash-calculator.html](https://tools.dev66.net/zh-cn/hash-calculator.html)
- **UUID 生成器**：批量生成 UUID v1/v4/v5，支持命名空间与格式选项。中文版入口：[https://tools.dev66.net/zh-cn/uuid-generator.html](https://tools.dev66.net/zh-cn/uuid-generator.html)
- **随机数生成器**：在指定范围内产生高强度随机整数，可批量输出。中文版入口：[https://tools.dev66.net/zh-cn/random-number-generator.html](https://tools.dev66.net/zh-cn/random-number-generator.html)
- **随机字符串生成器**：按字符集、长度与数量自定义生成安全 Token。中文版入口：[https://tools.dev66.net/zh-cn/random-string-generator.html](https://tools.dev66.net/zh-cn/random-string-generator.html)
- **ZIP 在线工具**：浏览器内压缩文件/文件夹为 ZIP，解压 ZIP 内容，基于 WebAssembly 本地执行。中文版入口：[https://tools.dev66.net/zh-cn/zip-online.html](https://tools.dev66.net/zh-cn/zip-online.html)

## 目录结构
- `web/`：Vite + React 前端；`App.tsx` 负责布局、路由与搜索，各工具独立成组件。
- `web/src/i18n/`：多语言上下文、默认配置与工具方法。
- `web/src/locales/<language>/`：各语言文案拆分为 `home.ts`、`layout.ts`、`tools/<toolId>.ts` 等模块，通过 `index.ts` 聚合。
- `web/public/`：静态资源目录，执行 `pnpm build:web` 后打包到 `dist/`。
- `src/worker.js`：Cloudflare Worker，处理 `tool.dev66.net` → `tools.dev66.net` 的跳转并回源静态资源。
- `redirect-tools/`：用于历史短链的轻量重定向 Worker。
- `wrangler.toml`：Worker 环境、域名与静态资源绑定配置。

## 开发指南
环境需求：Node.js 18+、pnpm 8+

```bash
pnpm install
pnpm dev:web            # 在 http://localhost:5175 启动 Vite 开发服务器
pnpm dev:worker         # （可选）使用 dist/ 资源启动 Wrangler 本地调试
```

### 构建与部署
```bash
pnpm build:web          # 运行 Vite 构建与预渲染脚本，自动生成多语言静态页面
pnpm deploy             # 部署到默认 Cloudflare 环境
pnpm deploy:prod        # 部署到生产环境
```

本地调试或验证生产环境前，请清理浏览器中已缓存的 Service Worker，以免旧资源影响结果。

## 贡献方式
欢迎通过 Issue 或 PR 参与贡献。提交改动时请：
- 保持单次提交聚焦一个主题，遵循“动词 + 场景”的提交信息格式，例如 `Add hash navigation shell`。
- 在 PR 中补充手动测试步骤（二维码生成、扫码识别、页面导航等）。
- 如修改 `wrangler.toml`、`package.json` 或任意 `tsconfig`，请在 PR 描述中显式说明。
- 若新增或更新多语言文案，请在 `web/src/locales/<language>/` 中创建/修改对应模块，并同步更新 `AGENTS.md` 中的翻译规则说明。
