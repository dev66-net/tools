import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_LOCALE } from '../src/i18n/index.ts';
import type { LocaleCode } from '../src/i18n/types.ts';
import { collectPageEntries, type PageEntry } from './pageData.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..');
const distDir = path.resolve(projectRoot, 'dist');

const CANONICAL_ORIGIN = process.env.CANONICAL_ORIGIN?.trim().replace(/\/$/u, '') ||
  'https://tools.dev66.net';

const HREFLANG_BY_LOCALE: Record<LocaleCode, string> = {
  en: 'en',
  'zh-CN': 'zh-cn',
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;');
}

function toAbsolutePath(location: string): string {
  return new URL(location, `${CANONICAL_ORIGIN}/`).toString();
}

function groupPagesBySlug(pages: PageEntry[]): Map<string, PageEntry[]> {
  const grouped = new Map<string, PageEntry[]>();
  for (const page of pages) {
    const list = grouped.get(page.slug) ?? [];
    list.push(page);
    grouped.set(page.slug, list);
  }

  for (const entry of grouped.values()) {
    entry.sort((a, b) => a.locale.localeCompare(b.locale));
  }

  return grouped;
}

function getSitemapFilename(locale: LocaleCode): string {
  const label = HREFLANG_BY_LOCALE[locale];
  return `sitemap-${label}.xml`;
}

function buildAlternateLinks(slug: string, grouped: Map<string, PageEntry[]>): string[] {
  const alternates = grouped.get(slug);
  if (!alternates) {
    return [];
  }

  const lines: string[] = [];
  for (const alt of alternates) {
    const hreflang = HREFLANG_BY_LOCALE[alt.locale];
    const href = escapeXml(toAbsolutePath(alt.location));
    lines.push(`    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`);
  }

  const defaultPage = alternates.find((page) => page.locale === DEFAULT_LOCALE);
  if (defaultPage) {
    const href = escapeXml(toAbsolutePath(defaultPage.location));
    lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${href}" />`);
  }

  return lines;
}

function buildUrlElement(page: PageEntry, grouped: Map<string, PageEntry[]>, lastModified: string): string {
  const loc = escapeXml(toAbsolutePath(page.location));
  const changefreq = page.slug === 'index' ? 'daily' : 'weekly';
  const priority = page.slug === 'index' ? '1.0' : '0.8';
  const alternateLinks = buildAlternateLinks(page.slug, grouped);

  const parts = [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastModified}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    ...alternateLinks,
    '  </url>',
  ];

  return parts.join('\n');
}

async function writeLocaleSitemaps(
  locales: LocaleCode[],
  pagesByLocale: Map<LocaleCode, PageEntry[]>,
  groupedBySlug: Map<string, PageEntry[]>,
  timestamp: string
) {
  for (const locale of locales) {
    const pages = pagesByLocale.get(locale) ?? [];
    const filename = getSitemapFilename(locale);
    const target = path.join(distDir, filename);
    const sortedPages = pages.slice().sort((a, b) => a.location.localeCompare(b.location));
    const urlEntries = sortedPages.map((page) => buildUrlElement(page, groupedBySlug, timestamp)).join('\n');
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
      '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
      urlEntries,
      '</urlset>',
      '',
    ].join('\n');
    await writeFile(target, xml, 'utf-8');
    console.log(`Generated ${filename} (${pages.length} URLs)`);
  }
}

async function writeSitemapIndex(locales: LocaleCode[], timestamp: string) {
  const entries = locales
    .map((locale) => {
      const filename = getSitemapFilename(locale);
      const loc = escapeXml(toAbsolutePath(`/${filename}`));
      return [
        '  <sitemap>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${timestamp}</lastmod>`,
        '  </sitemap>',
      ].join('\n');
    })
    .join('\n');

  const indexXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    '</sitemapindex>',
    '',
  ].join('\n');

  const indexPath = path.join(distDir, 'sitemap.xml');
  await writeFile(indexPath, indexXml, 'utf-8');
  console.log('Generated sitemap.xml index');
}

async function generateSitemaps() {
  const pages = collectPageEntries();
  const timestamp = new Date().toISOString();

  const pagesByLocale = new Map<LocaleCode, PageEntry[]>();
  for (const page of pages) {
    const list = pagesByLocale.get(page.locale) ?? [];
    list.push(page);
    pagesByLocale.set(page.locale, list);
  }

  const groupedBySlug = groupPagesBySlug(pages);
  const locales = Array.from(pagesByLocale.keys()).sort((a, b) => a.localeCompare(b.locale));

  await mkdir(distDir, { recursive: true });
  await writeLocaleSitemaps(locales, pagesByLocale, groupedBySlug, timestamp);
  await writeSitemapIndex(locales, timestamp);
}

generateSitemaps().catch((error) => {
  console.error('Failed to generate sitemap');
  console.error(error);
  process.exitCode = 1;
});
