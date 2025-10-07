import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  DEFAULT_LOCALE,
  I18nContext,
  SUPPORTED_LOCALES,
  TRANSLATIONS,
  buildPathForLocale,
  getLocaleFromPath,
} from './i18n/index';
import type { I18nContextValue } from './i18n/index';
import type { LocaleCode } from './i18n/types';
import tools, { type ToolDefinition, type ToolId } from './tools';
import Home from './Home';
import './App.css';

const externalTools = [
  { name: 'CyberChef', href: 'https://gchq.github.io/CyberChef/' },
  { name: 'JWT.io', href: 'https://jwt.io/' },
  { name: 'Regex101', href: 'https://regex101.com/' },
  { name: 'JSON Formatter', href: 'https://jsonformatter.org/' },
];

const githubRepoUrl = 'https://github.com/dev66-net/tools.git';

type ToolRoute = {
  locale: LocaleCode;
  id: ToolId;
  slug: string;
  path: string;
  href: string;
  label: string;
  fallbackLabel: string;
  pageTitle: string;
  description: string;
  keywords: string[];
  executionMode: ToolDefinition['executionMode'];
  executionNote: string;
  element: ReactNode;
  preload?: () => void;
  searchText: string;
};

type HomeRoute = {
  locale: LocaleCode;
  path: string;
  href: string;
};

function formatLoadingMessage(template: string, label: string): string {
  return template.replace('{label}', label);
}

function RouteFallback({ message }: { message: string }) {
  return (
    <div className="route-fallback">
      <div className="route-fallback-card">{message}</div>
    </div>
  );
}

function withSuspense(element: ReactNode, message: string): ReactNode {
  return <Suspense fallback={<RouteFallback message={message} />}>{element}</Suspense>;
}

function buildToolRoutes(): {
  routes: ToolRoute[];
  byLocale: Record<LocaleCode, ToolRoute[]>;
} {
  const routes: ToolRoute[] = [];

  for (const locale of SUPPORTED_LOCALES) {
    const translations = TRANSLATIONS[locale];
    const localeRoutes: ToolRoute[] = tools.map((tool) => {
      const toolCopy = translations.tools[tool.id];
      if (!toolCopy) {
        throw new Error(`Missing translations for tool: ${tool.id} in locale ${locale}`);
      }
      const { label, fallbackLabel, pageTitle, description, keywords, executionNote } = toolCopy.meta;
      const keywordList = Array.isArray(keywords) ? keywords : [];
      const fallbackMessage = formatLoadingMessage(translations.layout.loadingLabel, fallbackLabel);
      const element = withSuspense(<tool.Component />, fallbackMessage);
      const href = buildPathForLocale(locale, tool.slug);
      const path = href.replace(/^\//u, '');
      const searchText = [
        label,
        fallbackLabel,
        pageTitle,
        description,
        executionNote,
        keywordList.join(' '),
        tool.slug,
      ]
        .join(' ')
        .toLowerCase();

      return {
        locale,
        id: tool.id,
        slug: tool.slug,
        path,
        href,
        label,
        fallbackLabel,
        pageTitle,
        description,
        keywords: keywordList,
        executionMode: tool.executionMode,
        executionNote,
        element,
        preload: tool.preload,
        searchText,
      } satisfies ToolRoute;
    });

    routes.push(...localeRoutes);
  }

  const byLocale: Record<LocaleCode, ToolRoute[]> = SUPPORTED_LOCALES.reduce(
    (accumulator, candidateLocale) => {
      accumulator[candidateLocale] = routes.filter((route) => route.locale === candidateLocale);
      return accumulator;
    },
    {} as Record<LocaleCode, ToolRoute[]>
  );

  return { routes, byLocale };
}

function buildHomeRoutes(): HomeRoute[] {
  return SUPPORTED_LOCALES.map((locale) => {
    const href = buildPathForLocale(locale, 'index');
    return {
      locale,
      path: href.replace(/^\//u, ''),
      href,
    } satisfies HomeRoute;
  });
}

const toolRouteData = buildToolRoutes();
const homeRoutes = buildHomeRoutes();

function findHomeRoute(locale: LocaleCode): HomeRoute {
  const match = homeRoutes.find((route) => route.locale === locale);
  if (!match) {
    throw new Error(`Missing home route for locale ${locale}`);
  }
  return match;
}

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { locale, slug } = useMemo(() => getLocaleFromPath(location.pathname), [location.pathname]);
  const translations = TRANSLATIONS[locale];
  const localeRoutes = toolRouteData.byLocale[locale];
  const homeRoute = findHomeRoute(locale);
  const activeRoute = useMemo(() => localeRoutes.find((route) => route.slug === slug) ?? null, [localeRoutes, slug]);
  const isPrintMode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    if (!params.has('print')) {
      return false;
    }
    const value = params.get('print');
    if (value === null || value.length === 0) {
      return true;
    }
    const normalized = value.trim().toLowerCase();
    return normalized !== '0' && normalized !== 'false' && normalized !== 'no';
  }, [location.search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      toolRouteData.routes.forEach((route) => route.preload?.());
    }, 800);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const { site } = translations;
    const title = activeRoute ? activeRoute.pageTitle : site.mainTitle;
    const descriptionContent = activeRoute?.description ?? site.description;
    const keywordsContent = (activeRoute?.keywords ?? site.keywords).join(', ');

    document.title = title;

    const ensureMeta = (name: string, content: string) => {
      const existing = document.querySelector(`meta[name="${name}"]`);
      if (existing instanceof HTMLMetaElement) {
        existing.content = content;
        return;
      }
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    };

    ensureMeta('description', descriptionContent);
    ensureMeta('keywords', keywordsContent);
  }, [activeRoute, translations]);

  useEffect(() => {
    if (isMobile && menuOpen) {
      searchInputRef.current?.focus();
    }
  }, [isMobile, menuOpen]);

  const filteredRoutes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return localeRoutes;
    }
    return localeRoutes.filter((route) => route.searchText.includes(term));
  }, [searchTerm, localeRoutes]);

  const hasSearchTerm = searchTerm.trim().length > 0;

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleOpenMenu = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleLocaleChange = useCallback(
    (nextLocale: LocaleCode) => {
      if (nextLocale === locale) {
        return;
      }
      const nextPath = buildPathForLocale(nextLocale, slug === 'index' ? 'index' : slug);
      navigate({ pathname: nextPath, search: location.search });
    },
    [locale, slug, navigate, location.search]
  );

  const i18nContextValue = useMemo<I18nContextValue>(
    () => ({ locale, setLocale: handleLocaleChange, translations }),
    [locale, handleLocaleChange, translations]
  );

  if (isPrintMode) {
    return (
      <I18nContext.Provider value={i18nContextValue}>
        <div className="print-layout">
          <section className="print-content">
            <Outlet />
          </section>
        </div>
      </I18nContext.Provider>
    );
  }

  const { layout, languageMenu } = translations;
  const executionModeLabel = activeRoute?.executionMode === 'remote'
    ? layout.executionModeRemote
    : layout.executionModeBrowser;

  return (
    <I18nContext.Provider value={i18nContextValue}>
      <div className="layout">
        <div className="layout-header">
          <button
            type="button"
            className="menu-toggle"
            onClick={handleOpenMenu}
            aria-label={layout.menuButtonAriaLabel}
            aria-controls="tool-sidebar"
            aria-expanded={menuOpen}
          >
            {layout.menuButtonLabel}
          </button>
        </div>
        {isMobile && menuOpen && <div className="sidebar-backdrop" onClick={handleCloseMenu} />}
        <aside
          id="tool-sidebar"
          className={`sidebar ${isMobile ? (menuOpen ? 'sidebar--open' : 'sidebar--closed') : ''}`}
          aria-hidden={isMobile && !menuOpen}
          tabIndex={isMobile && !menuOpen ? -1 : undefined}
        >
          <div className="sidebar-header">
            <div className="brand">{layout.brandName}</div>
            {isMobile && (
              <button
                type="button"
                className="sidebar-close"
                onClick={handleCloseMenu}
                aria-label={layout.closeMenuAriaLabel}
              >
                ×
              </button>
            )}
          </div>
        <div className="menu-search">
          <input
            ref={searchInputRef}
            type="search"
            className="menu-search-input"
            placeholder={layout.searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label={layout.searchAriaLabel}
          />
        </div>
        <a
          className="github-link"
          href={githubRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
        >
          <svg
            className="github-icon"
            viewBox="0 0 24 24"
            role="img"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.92.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.87-1.54-3.87-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.74 1.27 3.41.97.11-.75.41-1.27.75-1.56-2.55-.29-5.23-1.27-5.23-5.65 0-1.25.45-2.26 1.2-3.05-.12-.3-.52-1.52.11-3.17 0 0 .97-.31 3.18 1.17a11 11 0 0 1 2.9-.39c.99 0 1.99.13 2.9.39 2.2-1.48 3.17-1.17 3.17-1.17.63 1.65.23 2.87.11 3.17.75.79 1.2 1.8 1.2 3.05 0 4.39-2.69 5.35-5.25 5.63.42.37.8 1.09.8 2.2 0 1.59-.02 2.87-.02 3.26 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
            />
          </svg>
        </a>
        <nav className="nav">
          <NavLink to={homeRoute.href} className={({ isActive }) => (isActive ? 'active' : '')} end>
            {layout.homeNavLabel}
          </NavLink>
            {filteredRoutes.length === 0 ? (
              hasSearchTerm ? <div className="menu-empty">{layout.noSearchResult}</div> : null
            ) : (
              filteredRoutes.map(({ path, label, preload, href }) => (
                <NavLink
                  key={path}
                  to={href}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  end
                  onMouseEnter={() => preload?.()}
                  onFocus={() => preload?.()}
                >
                  {label}
                </NavLink>
              ))
            )}
          </nav>
          <LanguageSwitcher
            currentLocale={locale}
            slug={slug}
            search={location.search}
            label={languageMenu.label}
            options={languageMenu.options}
          />
          <div className="tool-section">
            <h2>{layout.externalToolsTitle}</h2>
            <ul className="tool-list">
              {externalTools.map((tool) => (
                <li key={tool.href}>
                  <a href={tool.href} target="_blank" rel="noopener noreferrer">
                    {tool.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <section className="content">
          <Outlet />
          <div
            className={`tool-meta${
              activeRoute?.executionMode ? ` tool-meta--${activeRoute.executionMode}` : ' tool-meta--browser'
            }`}
            role="note"
          >
            <span className="tool-meta-label">{layout.executionModeLabel}</span>
            <span className="tool-meta-value">{executionModeLabel}</span>
            <span className="tool-meta-note">
              {activeRoute?.executionNote ?? layout.executionNoteDefault}
            </span>
          </div>
        </section>
      </div>
    </I18nContext.Provider>
  );
}

function LanguageSwitcher({
  currentLocale,
  slug,
  search,
  label,
  options,
}: {
  currentLocale: LocaleCode;
  slug: string;
  search: string;
  label: string;
  options: Record<LocaleCode, string>;
}) {
  return (
    <nav className="language-switcher" aria-label={label}>
      <details>
        <summary>{label}</summary>
        <ul>
          {SUPPORTED_LOCALES.map((locale) => {
            const href = buildPathForLocale(locale, slug === 'index' ? 'index' : slug);
            const isCurrent = locale === currentLocale;
            return (
              <li key={locale}>
                <Link to={{ pathname: href, search }} aria-current={isCurrent ? 'true' : undefined}>
                  {options[locale] ?? locale}
                </Link>
              </li>
            );
          })}
        </ul>
      </details>
    </nav>
  );
}

function useIsMobile(maxWidth = 900) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(`(max-width: ${maxWidth}px)`).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(`(max-width: ${maxWidth}px)`);

    const listener = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', listener);
    } else {
      mediaQuery.addListener(listener);
    }

    setIsMobile(mediaQuery.matches);

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', listener);
      } else {
        mediaQuery.removeListener(listener);
      }
    };
  }, [maxWidth]);

  return isMobile;
}

export default function App() {
  const homeElements = useMemo(
    () =>
      homeRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={<Home />} />
      )),
    []
  );

  const toolElements = useMemo(
    () =>
      toolRouteData.routes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      )),
    []
  );

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/index.html" replace />} />
        {homeElements}
        {toolElements}
      </Route>
      <Route path="zh-cn" element={<Navigate to="/zh-cn/index.html" replace />} />
      <Route path="*" element={<Navigate to="/index.html" replace />} />
    </Routes>
  );
}
