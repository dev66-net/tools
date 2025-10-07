import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Writable } from 'node:stream';
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App.tsx';
import tools, { type ToolDefinition } from '../src/tools.tsx';
import { SUPPORTED_LOCALES, TRANSLATIONS, buildPathForLocale } from '../src/i18n/index.ts';
import type { LocaleCode } from '../src/i18n/types.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..');
const distDir = path.resolve(projectRoot, 'dist');

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function injectHead(template: string, meta: { title?: string; description?: string; keywords?: string }) {
  let output = template;

  if (meta.title) {
    output = output.replace(/<title>.*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);
  }

  const metaTags: string[] = [];
  if (meta.description) {
    metaTags.push(`<meta name="description" content="${escapeHtml(meta.description)}" />`);
  }
  if (meta.keywords) {
    metaTags.push(`<meta name="keywords" content="${escapeHtml(meta.keywords)}" />`);
  }

  if (metaTags.length > 0) {
    const block = metaTags.map((tag) => `    ${tag}`).join('\n');
    output = output.replace('</head>', `${block}\n  </head>`);
  }

  return output;
}

type PageDefinition = {
  filePath: string;
  location: string;
  title: string;
  description: string;
  keywords: string;
};

function assertToolCopyExists(locale: LocaleCode, toolId: ToolDefinition['id']) {
  const translations = TRANSLATIONS[locale];
  const copy = translations.tools[toolId];
  if (!copy) {
    throw new Error(`Missing translations for tool "${toolId}" in locale ${locale}`);
  }
  return copy;
}

function createPages(toolList: ToolDefinition[]): PageDefinition[] {
  const pages: PageDefinition[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    const translations = TRANSLATIONS[locale];
    const homePath = buildPathForLocale(locale, 'index');
    pages.push({
      filePath: homePath.replace(/^\//u, ''),
      location: homePath,
      title: translations.site.mainTitle,
      description: translations.site.description,
      keywords: translations.site.keywords.join(', '),
    });

    for (const tool of toolList) {
      const toolCopy = assertToolCopyExists(locale, tool.id);
      const pagePath = buildPathForLocale(locale, tool.slug);
      pages.push({
        filePath: pagePath.replace(/^\//u, ''),
        location: pagePath,
        title: toolCopy.meta.pageTitle,
        description: toolCopy.meta.description,
        keywords: (toolCopy.meta.keywords ?? []).join(', '),
      });
    }
  }

  return pages;
}

const STREAM_ABORT_DELAY = 5000;

async function renderPage(location: string) {
  return new Promise<string>((resolve, reject) => {
    const chunks: string[] = [];

    const { pipe, abort } = renderToPipeableStream(
      React.createElement(
        MemoryRouter,
        { initialEntries: [location], initialIndex: 0 },
        React.createElement(App)
      ),
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
      reject(new Error(`Rendering aborted for ${location}`));
    }, STREAM_ABORT_DELAY);
    (timeoutId as NodeJS.Timeout).unref?.();
  });
}

async function prerender() {
  const templatePath = path.join(distDir, 'index.html');
  const template = await readFile(templatePath, 'utf-8');

  for (const tool of tools) {
    if (typeof tool.preload === 'function') {
      await tool.preload();
    }
  }

  const pages = createPages(tools);

  await mkdir(distDir, { recursive: true });

  for (const page of pages) {
    const appHtml = await renderPage(page.location);
    let html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
    html = injectHead(html, page);
    const target = path.join(distDir, page.filePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, html, 'utf-8');
    console.log(`Pre-rendered ${page.location} -> ${path.relative(projectRoot, target)}`);
  }
}

prerender().catch((error) => {
  console.error('Prerender failed');
  console.error(error);
  process.exitCode = 1;
});
