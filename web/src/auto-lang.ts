import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  buildFriendlyPathForLocale,
  getLocaleFromPath,
} from './i18n/index';
import type { LocaleCode } from './i18n/types';

const PREFERRED_LOCALE_COOKIE = 'preferredLocale';
const LOCALE_ALIASES: Record<string, LocaleCode> = {
  en: 'en',
  'en-us': 'en',
  'en-gb': 'en',
  'en-au': 'en',
  'en-ca': 'en',
  zh: 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-sg': 'zh-CN',
};

function normalizeLocaleCandidate(candidate: string): string {
  return candidate.trim().toLowerCase();
}

function resolveSupportedLocale(candidate: string | null | undefined): LocaleCode | null {
  if (!candidate) {
    return null;
  }
  const normalized = normalizeLocaleCandidate(candidate);

  if (normalized in LOCALE_ALIASES) {
    return LOCALE_ALIASES[normalized];
  }

  const directMatch = SUPPORTED_LOCALES.find(
    (locale) => normalizeLocaleCandidate(locale) === normalized
  );
  if (directMatch) {
    return directMatch;
  }

  const prefixMatch = SUPPORTED_LOCALES.find((locale) => {
    const localePrefix = normalizeLocaleCandidate(locale).split('-')[0];
    return normalized.startsWith(localePrefix);
  });

  return prefixMatch ?? null;
}

function parseCookies(): Record<string, string> {
  if (typeof document === 'undefined') {
    return {};
  }
  return document.cookie
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, pair) => {
      const separatorIndex = pair.indexOf('=');
      if (separatorIndex === -1) {
        return accumulator;
      }
      const key = pair.slice(0, separatorIndex);
      const value = pair.slice(separatorIndex + 1);
      accumulator[key] = value;
      return accumulator;
    }, {});
}

function normalizePath(path: string): string {
  if (!path) {
    return '/';
  }
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  if (withLeadingSlash === '/') {
    return '/';
  }
  return withLeadingSlash.replace(/\/+$/u, '') || '/';
}

function detectNavigatorLocale(): LocaleCode | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  const candidates: string[] = [];
  if (Array.isArray(navigator.languages)) {
    candidates.push(...navigator.languages);
  }
  if (navigator.language) {
    candidates.push(navigator.language);
  }

  for (const candidate of candidates) {
    const resolved = resolveSupportedLocale(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

export function getPreferredLocale(): LocaleCode | null {
  const cookies = parseCookies();
  const cookieValue = cookies[PREFERRED_LOCALE_COOKIE];
  if (!cookieValue) {
    return null;
  }
  try {
    const decoded = decodeURIComponent(cookieValue);
    return resolveSupportedLocale(decoded);
  } catch (error) {
    return null;
  }
}

export function setPreferredLocale(locale: LocaleCode): void {
  if (typeof document === 'undefined') {
    return;
  }
  const encoded = encodeURIComponent(locale);
  document.cookie = `${PREFERRED_LOCALE_COOKIE}=${encoded}; path=/`;
}

export function useAutoLanguageRedirect(): void {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const { locale: currentLocale, slug } = getLocaleFromPath(location.pathname);

    const preferredLocale = getPreferredLocale();
    const navigatorLocale = detectNavigatorLocale();
    const targetLocale = preferredLocale ?? navigatorLocale ?? DEFAULT_LOCALE;

    if (!SUPPORTED_LOCALES.includes(targetLocale)) {
      return;
    }

    if (targetLocale === currentLocale) {
      return;
    }

    const targetPath = buildFriendlyPathForLocale(targetLocale, slug);
    const normalizedCurrent = normalizePath(location.pathname);
    const normalizedTarget = normalizePath(targetPath);

    if (normalizedCurrent === normalizedTarget) {
      return;
    }

    navigate({ pathname: targetPath, search: location.search }, { replace: true });
  }, [location.pathname, location.search, navigate]);
}
