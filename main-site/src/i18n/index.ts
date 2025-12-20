import en from '../locales/en';
import zhCN from '../locales/zh-cn';

export type Locale = 'en' | 'zh-cn';

export const locales = {
  en,
  'zh-cn': zhCN
} as const;

export type TranslationKeys = typeof en;

export function getLocale(path?: string): Locale {
  if (path?.startsWith('/zh-cn')) {
    return 'zh-cn';
  }
  return 'en';
}

export function getAlternatePath(currentPath: string, targetLocale: Locale): string {
  // 移除现有的语言前缀
  const cleanPath = currentPath.replace(/^\/zh-cn/, '') || '/';

  // 添加新的语言前缀
  if (targetLocale === 'zh-cn') {
    return cleanPath === '/' ? '/zh-cn' : `/zh-cn${cleanPath}`;
  }

  return cleanPath;
}