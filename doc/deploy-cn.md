# Cloudflare Worker 自动化部署指南

本项目通过 Wrangler 构建并发布到 Cloudflare Workers。以下步骤说明如何在 GitHub 仓库中配置 CI/CD，实现每次 Push 自动触发部署。

## 1. 准备 Cloudflare 凭证

1. 登录 Cloudflare 仪表盘，前往 **My Profile → API Tokens → Create Token**。
2. 选择模板 **Edit Cloudflare Workers**，或手动授予 `Account.Workers Scripts`、`Account.Workers Routes` 写权限。
3. 生成的 Token 只会显示一次，复制后在仓库 Settings 中配置为机密。
4. 在仪表盘的 **Workers & Pages → Overview** 获取 `Account ID`，与仓库内 `wrangler.toml` 的 `account_id` 保持一致。

> 建议先在本地执行 `npx wrangler whoami --profile <可选配置>` 验证 Token 权限无误。

## 2. 配置 GitHub Secrets / Variables

在仓库 `Settings → Secrets and variables → Actions` 中新增：

- **Secret `CLOUDFLARE_API_TOKEN`**：粘贴上一步生成的 Token。
- **Variable 或 Secret `CLOUDFLARE_ACCOUNT_ID`**：填写 Cloudflare Account ID。
- 若 `wrangler.toml` 使用 `env` 块引用其他敏感配置（如自定义域名、KV/DO ID），请同步添加对应 Secrets。

## 3. 新增部署工作流

在仓库创建 `.github/workflows/deploy.yml`，示例：

```yaml
name: Deploy Worker

on:
  push:
    branches: [main]   # 可根据需要改为生产分支或添加 tag 触发

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm build       # 如需单独构建前端可使用 pnpm build:web

      - name: Deploy with Wrangler
        run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ vars.CLOUDFLARE_ACCOUNT_ID || secrets.CLOUDFLARE_ACCOUNT_ID }}
          # 其他 wrangler 环境变量按需补充
```

### 常见变体

- 生产与预览双环境：新增 `on: pull_request` 触发，命令改为 `npx wrangler deploy --env preview`，并在步骤末输出预览域名。
- 自定义入口命令：若 `package.json` 定义 `deploy` 脚本，可改为 `pnpm run deploy`。
- 仅构建前端：若 worker 只托管 `dist/` 静态资源，可在构建后添加 `npx wrangler deploy --assets dist`。

## 4. 验证流程

1. 在本地运行 `pnpm build` 与 `npx wrangler deploy --dry-run`，确保构建及配置正常。
2. 将 `.github/workflows/deploy.yml` 推送到触发分支，等待 GitHub Actions 执行。
3. 在 Actions 列表中确认部署任务成功，终端日志应包含 `Uploaded <script-name>` 或对应环境的 URL。
4. 若失败，根据提示检查以下常见问题：
   - Token 权限不足或账户 ID 不匹配。
   - `wrangler.toml` 引用的环境变量缺失。
   - 构建命令未生成 `dist/`，或 `pnpm build` 失败。

## 5. 日常维护建议

- 变更 `wrangler.toml`、`package.json` 或 `tsconfig` 时，在 PR 描述中标注，并在合并前确认 Actions 通过。
- 避免提交 `dist/` 目录；部署脚本会在 CI 中重新构建。
- 若需要手动回滚，可使用 `npx wrangler deployments list` 查看历史版本并执行 `npx wrangler deployments rollback <ID>`。
- 定期在 Cloudflare 仪表盘确认绑定的域名、资产 KV、Workers 环境变量是否与仓库配置一致。

完成以上配置后，每次向目标分支推送代码，GitHub Actions 将自动构建并通过 Wrangler 发布最新版本。
