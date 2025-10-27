# tools.dev66.net

English | [简体中文](README-cn.md)

## Overview
[tools.dev66.net](https://tools.dev66.net/) is an open-source collection of browser-first developer utilities. The front-end runs on Vite + React and ships as static assets, while a Cloudflare Worker serves the bundle and handles canonical domain redirects. All tool logic executes locally in the browser so that pasted data never leaves your machine.

## Features
- [**QR Code Generator**](https://tools.dev66.net/qr-generator.html) – create high-resolution QR codes for links, text, Wi-Fi and business cards with PNG export.
- [**QR Code Scanner**](https://tools.dev66.net/qr-scanner.html) – decode QR images via upload, drag-and-drop, paste or camera with rotation compensation.
- [**URL Parser**](https://tools.dev66.net/url-parser.html) – inspect protocol, host, path and query parameters with encode/decode helpers.
- [**JSON Formatter**](https://tools.dev66.net/json-formatter.html) – prettify, minify and validate JSON with light/dark themes and copy helpers.
- [**Markdown Renderer**](https://tools.dev66.net/markdown-renderer.html) – preview GitHub-flavored Markdown with live two-pane view, themes and print/export.
- [**JWT Decoder**](https://tools.dev66.net/jwt-decoder.html) – inspect JWT headers and payloads, highlight expiry information and verify HS256 signatures locally.
- [**Base64 Converter**](https://tools.dev66.net/base64-converter.html) – convert between text and Base64 (standard and URL-safe) with byte insights and copy tools.
- [**Hex Converter**](https://tools.dev66.net/hex-converter.html) – transform text to hexadecimal and back with byte length statistics and delimiter options.
- [**Escape Decoder**](https://tools.dev66.net/escape-decoder.html) – decode and re-encode strings across JSON, JavaScript, Python and shell escape rules.
- [**Hash Calculator**](https://tools.dev66.net/hash-calculator.html) – compute MD5, SHA-1, SHA-256 and friends with uppercase/lowercase plus Base64 variants.
- [**UUID Generator**](https://tools.dev66.net/uuid-generator.html) – generate UUID v1, v4 and v5 in bulk with namespace presets and formatting controls.
- [**Random Number Generator**](https://tools.dev66.net/random-number-generator.html) – produce cryptographically strong integers in custom ranges with batching support.
- [**Random String Generator**](https://tools.dev66.net/random-string-generator.html) – build secure tokens from configurable character sets, lengths and batch sizes.
- [**ZIP Utility**](https://tools.dev66.net/zip-online.html) – compress files/folders into ZIP archives and extract ZIP contents, all locally in-browser with WebAssembly.

## Project Layout
- `web/` – Vite + React front-end (`App.tsx` wires routes, layout and search; tools reside in dedicated components).
- `web/public/` – static assets bundled into `dist/` after `pnpm build:web`.
- `src/worker.js` – Cloudflare Worker that redirects `tool.dev66.net` to the canonical domain and serves static assets.
- `redirect-tools/` – minimal redirect worker package for legacy short links.
- `wrangler.toml` – environment, domain and asset binding configuration.

## Getting Started
Prerequisites: Node.js 18+, pnpm 8+.

```bash
pnpm install
pnpm dev:web            # start Vite dev server on http://localhost:5175
pnpm dev:worker         # (optional) serve the built assets via Wrangler using dist/
```

### Build & Deploy
```bash
pnpm build:web          # generate dist/ using Vite build + prerender script
pnpm deploy             # deploy to default Cloudflare environment
pnpm deploy:prod        # deploy to production environment
```

Before re-running the worker locally or testing production builds, clear any Service Worker caches in your browser to avoid stale assets interfering with verification.

## Contributing
Issues and pull requests are welcome. When submitting changes, please:
- Keep commits focused and use the "verb + context" convention (for example, `Add hash navigation shell`).
- Document manual testing steps (QR generation, scanning, navigation, etc.) in the PR description.
- Call out modifications to `wrangler.toml`, `package.json` or any `tsconfig` directly in the PR body.
