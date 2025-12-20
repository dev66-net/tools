import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Writable } from 'node:stream';
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(projectRoot, 'dist');

// 动态导入来避免路径解析问题
const { default: App } = await import(path.resolve(projectRoot, 'src/App.tsx'));
const { locales } = await import(path.resolve(projectRoot, 'src/i18n/index.ts'));

type Locale = 'en' | 'zh-cn';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const STREAM_ABORT_DELAY = 5000;

async function renderAppToString(locale: Locale): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const chunks: string[] = [];

    const { pipe, abort } = renderToPipeableStream(
      React.createElement(App, { initialLocale: locale }),
      {
        onAllReady() {
          const writable = new Writable({
            write(chunk, _encoding, callback) {
              chunks.push(typeof chunk === 'string' ? chunk : chunk.toString());
              callback();
            },
          });

          writable.on('finish', () => {
            clearTimeout(timeoutId);
            resolve(chunks.join(''));
          });
          writable.on('error', reject);

          pipe(writable);
        },
        onShellError(error) {
          clearTimeout(timeoutId);
          reject(error);
        },
        onError(error) {
          console.error('Render error', error);
        },
      }
    );

    const timeoutId = setTimeout(() => {
      abort();
      reject(new Error(`Rendering aborted for locale ${locale}`));
    }, STREAM_ABORT_DELAY);
    (timeoutId as NodeJS.Timeout).unref?.();
  });
}

async function prerender() {
  console.log('🚀 Starting SSR prerendering...');

  // Check if dist directory exists
  if (!existsSync(distDir)) {
    console.error('❌ Error: dist directory not found. Please run `vite build` first.');
    process.exit(1);
  }

  // Read the Vite-generated index.html
  const templatePath = path.join(distDir, 'index.html');
  if (!existsSync(templatePath)) {
    console.error('❌ Error: index.html not found in dist. Please run `vite build` first.');
    process.exit(1);
  }

  const baseTemplate = await readFile(templatePath, 'utf-8');
  console.log('✅ Template loaded');

  // Prerender for each locale
  const localeConfigs: Array<{ locale: Locale; filename: string; lang: string }> = [
    { locale: 'en', filename: 'index.html', lang: 'en' },
    { locale: 'zh-cn', filename: 'zh-cn.html', lang: 'zh-CN' },
  ];

  for (const config of localeConfigs) {
    console.log(`\n📝 Rendering ${config.locale} version...`);

    try {
      // Render the App component to HTML string
      const appHtml = await renderAppToString(config.locale);

      // Get translations for this locale
      const translations = locales[config.locale];

      // Inject the rendered HTML into template
      let html = baseTemplate;

      // Replace the loading spinner with actual content
      html = html.replace(
        /<div id="root">.*?<\/div>/s,
        `<div id="root">${appHtml}</div>`
      );

      // Update language attribute
      html = html.replace(/<html lang="[^"]*">/, `<html lang="${config.lang}">`);

      // Inject locale variable
      html = html.replace(
        '<head>',
        `<head>\n  <script>window.__INITIAL_LOCALE__ = "${config.locale}";</script>`
      );

      // Update meta tags
      html = html.replace(
        /<title>.*?<\/title>/,
        `<title>${escapeHtml(translations.title)}</title>`
      );
      html = html.replace(
        /<meta name="description" content="[^"]*" \/>/,
        `<meta name="description" content="${escapeHtml(translations.description)}" />`
      );
      html = html.replace(
        /<meta name="keywords" content="[^"]*" \/>/,
        `<meta name="keywords" content="${escapeHtml(translations.keywords)}" />`
      );

      // Update Open Graph tags
      html = html.replace(
        /<meta property="og:title" content="[^"]*" \/>/,
        `<meta property="og:title" content="${escapeHtml(translations.title)}" />`
      );
      html = html.replace(
        /<meta property="og:description" content="[^"]*" \/>/,
        `<meta property="og:description" content="${escapeHtml(translations.description)}" />`
      );

      // Update canonical and hreflang
      const canonicalUrl = config.locale === 'en'
        ? 'https://dev66.net'
        : 'https://dev66.net/zh-cn';

      html = html.replace(
        /<link rel="canonical" href="[^"]*" \/>/,
        `<link rel="canonical" href="${canonicalUrl}" />`
      );

      // Write the final HTML
      const outputPath = path.join(distDir, config.filename);
      await writeFile(outputPath, html, 'utf-8');

      console.log(`✅ Generated: ${config.filename}`);

      // Verify file size
      const { size } = await import('node:fs/promises').then(m => m.stat(outputPath));
      console.log(`   Size: ${(size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.error(`❌ Failed to render ${config.locale}:`, error);
      throw error;
    }
  }

  console.log('\n🎉 SSR prerendering completed successfully!');
  console.log('\n📁 Output files:');
  console.log('   - dist/index.html (English with full HTML)');
  console.log('   - dist/zh-cn.html (Chinese with full HTML)');
  console.log('   - dist/assets/ (Static assets)');
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught error:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run prerender
prerender().catch((error) => {
  console.error('\n❌ Prerender failed:', error);
  process.exit(1);
});
