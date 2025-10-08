import tools, { type ToolDefinition } from '../src/tools.tsx';
import {
  SUPPORTED_LOCALES,
  TRANSLATIONS,
  buildFriendlyPathForLocale,
  buildPathForLocale,
} from '../src/i18n/index.ts';
import type { LocaleCode } from '../src/i18n/types.ts';

export type PageEntry = {
  locale: LocaleCode;
  slug: string;
  filePath: string;
  location: string;
  title: string;
  description: string;
  keywords: string[];
};

function assertToolCopyExists(locale: LocaleCode, toolId: ToolDefinition['id']) {
  const translations = TRANSLATIONS[locale];
  const copy = translations.tools[toolId];
  if (!copy) {
    throw new Error(`Missing translations for tool "${toolId}" in locale ${locale}`);
  }
  return copy;
}

export function collectPageEntries(toolList: ToolDefinition[] = tools): PageEntry[] {
  const pages: PageEntry[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    const translations = TRANSLATIONS[locale];
    const homeFilePath = buildPathForLocale(locale, 'index');
    const homeLocation = buildFriendlyPathForLocale(locale, 'index');
    pages.push({
      locale,
      slug: 'index',
      filePath: homeFilePath.replace(/^\//u, ''),
      location: homeLocation,
      title: translations.site.mainTitle,
      description: translations.site.description,
      keywords: translations.site.keywords,
    });

    for (const tool of toolList) {
      const toolCopy = assertToolCopyExists(locale, tool.id);
      const pagePath = buildPathForLocale(locale, tool.slug);
      pages.push({
        locale,
        slug: tool.slug,
        filePath: pagePath.replace(/^\//u, ''),
        location: pagePath,
        title: toolCopy.meta.pageTitle,
        description: toolCopy.meta.description,
        keywords: toolCopy.meta.keywords ?? [],
      });
    }
  }

  return pages;
}
