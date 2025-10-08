import { createContext, useContext } from 'react';
import en from '../locales/en/index';
import zhCN from '../locales/zh-CN/index';
import type { LocaleCode, Translations } from './types';

export const LOCALE_PATH_SEGMENTS: Record<LocaleCode, string> = {
  en: '',
  'zh-CN': 'zh-cn',
};

export const DEFAULT_LOCALE: LocaleCode = 'en';
export const SUPPORTED_LOCALES: LocaleCode[] = Object.keys(LOCALE_PATH_SEGMENTS) as LocaleCode[];

const PATH_SEGMENT_TO_LOCALE: Record<string, LocaleCode> = {};
for (const locale of SUPPORTED_LOCALES) {
  const segment = LOCALE_PATH_SEGMENTS[locale];
  PATH_SEGMENT_TO_LOCALE[segment] = locale;
}
PATH_SEGMENT_TO_LOCALE[''] = DEFAULT_LOCALE;

export const TRANSLATIONS: Record<LocaleCode, Translations> = {
  en,
  'zh-CN': zhCN,
};

export function buildIndexHref(locale: LocaleCode): string {
  const segment = LOCALE_PATH_SEGMENTS[locale];
  return segment ? `/${segment}/` : '/';
}

export function buildFriendlyPathForLocale(locale: LocaleCode, slug: string): string {
  if (slug === 'index') {
    return buildIndexHref(locale);
  }
  return buildPathForLocale(locale, slug);
}

export type I18nContextValue = {
  locale: LocaleCode;
  setLocale: (nextLocale: LocaleCode) => void;
  translations: Translations;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error('useI18n must be used within I18nContext.Provider');
  }
  return value;
}

export function getLocaleFromPath(pathname: string): { locale: LocaleCode; slug: string } {
  const normalized = pathname.replace(/^\/+/u, '').replace(/\/+$/u, '');
  if (!normalized) {
    return { locale: DEFAULT_LOCALE, slug: 'index' };
  }

  const segments = normalized.split('/');
  const [first, ...rest] = segments;

  if (first && PATH_SEGMENT_TO_LOCALE[first] && first === LOCALE_PATH_SEGMENTS[PATH_SEGMENT_TO_LOCALE[first]]) {
    const locale = PATH_SEGMENT_TO_LOCALE[first];
    const remainder = rest.join('/');
    const slug = remainder ? remainder.replace(/\.html$/u, '') : 'index';
    return { locale, slug };
  }

  const slug = normalized.replace(/\.html$/u, '') || 'index';
  return { locale: DEFAULT_LOCALE, slug };
}

export function buildPathForLocale(locale: LocaleCode, slug: string): string {
  const pathSegment = LOCALE_PATH_SEGMENTS[locale];
  const normalizedSlug = slug === 'index' ? 'index.html' : `${slug}.html`;
  if (!pathSegment) {
    return `/${normalizedSlug}`;
  }
  return `/${pathSegment}/${normalizedSlug}`;
}
