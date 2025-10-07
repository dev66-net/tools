import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { NavLink, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import tools from './tools.tsx';
import './App.css';
import Home from './Home.tsx';

const MAIN_TITLE = 'tools.dev66.net 开发者工具集';
const DEFAULT_DESCRIPTION =
  'tools.dev66.net 提供二维码生成、JSON 格式化、UUID、哈希等常用开发者工具，所有数据在浏览器本地处理，安全便捷。';
const DEFAULT_KEYWORDS = [
  '开发者工具',
  '在线工具',
  '二维码',
  'JSON',
  'UUID',
  'Base64',
  '哈希',
  'Markdown',
  'JWT',
];

type ToolRoute = {
  path: string;
  label: string;
  pageTitle: string;
  description: string;
  keywords: string[];
  executionMode: 'browser' | 'remote';
  executionNote: string;
  element: ReactNode;
  preload?: () => void;
  searchText: string;
};

function RouteFallback({ label }: { label: string }) {
  return (
    <div className="route-fallback">
      <div className="route-fallback-card">正在加载 {label}…</div>
    </div>
  );
}

function withSuspense(element: ReactNode, label: string): ReactNode {
  return <Suspense fallback={<RouteFallback label={label} />}>{element}</Suspense>;
}

const homeFallbackLabel = '站点简介';
const homeElement = withSuspense(<Home />, homeFallbackLabel);

const toolRoutes: ToolRoute[] = tools.map((tool) => {
  const {
    Component,
    description,
    executionMode,
    executionNote,
    fallbackLabel,
    keywords,
    label,
    pageTitle,
    path,
    preload,
  } = tool;
  const element = withSuspense(<Component />, fallbackLabel);
  const searchText = [label, fallbackLabel, pageTitle, description, executionNote, keywords.join(' '), path]
    .join(' ')
    .toLowerCase();

  return {
    path,
    label,
    pageTitle,
    description,
    keywords,
    executionMode,
    executionNote,
    element,
    preload,
    searchText,
  } satisfies ToolRoute;
});

const externalTools = [
  { name: 'CyberChef', href: 'https://gchq.github.io/CyberChef/' },
  { name: 'JWT.io', href: 'https://jwt.io/' },
  { name: 'Regex101', href: 'https://regex101.com/' },
  { name: 'JSON Formatter', href: 'https://jsonformatter.org/' },
];

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isMobile = useIsMobile();
  const location = useLocation();
  const normalizedPath = useMemo(() => location.pathname.replace(/^\/+/, ''), [location.pathname]);
  const pathSegment = useMemo(() => normalizedPath.split('/')[0] ?? '', [normalizedPath]);
  const activeRoute = useMemo(() => toolRoutes.find((route) => route.path === pathSegment) ?? null, [pathSegment]);
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
      toolRoutes.forEach((route) => route.preload?.());
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
  }, [location]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const title = activeRoute ? activeRoute.pageTitle : MAIN_TITLE;
    const descriptionContent = activeRoute?.description ?? DEFAULT_DESCRIPTION;
    const keywordsContent = (activeRoute?.keywords ?? DEFAULT_KEYWORDS).join(', ');

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
  }, [activeRoute]);

  useEffect(() => {
    if (isMobile && menuOpen) {
      searchInputRef.current?.focus();
    }
  }, [isMobile, menuOpen]);

  const filteredRoutes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return toolRoutes;
    }
    return toolRoutes.filter((route) => route.searchText.includes(term));
  }, [searchTerm]);
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

  if (isPrintMode) {
    return (
      <div className="print-layout">
        <section className="print-content">
          <Outlet />
        </section>
      </div>
    );
  }

  return (
    <div className="layout">
      <div className="layout-header">
        <button
          type="button"
          className="menu-toggle"
          onClick={handleOpenMenu}
          aria-label="打开工具菜单"
          aria-controls="tool-sidebar"
          aria-expanded={menuOpen}
        >
          菜单
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
          <div className="brand">工具集</div>
          {isMobile && (
            <button
              type="button"
              className="sidebar-close"
              onClick={handleCloseMenu}
              aria-label="关闭菜单"
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
            placeholder="搜索工具（名称、拼音或英文）"
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="搜索工具"
          />
        </div>
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} end>
            站点简介
          </NavLink>
          {filteredRoutes.length === 0 ? (
            hasSearchTerm ? <div className="menu-empty">没有找到匹配的工具</div> : null
          ) : (
            filteredRoutes.map(({ path, label, preload }) => (
              <NavLink
                key={path}
                to={`/${path}`}
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
        <div className="tool-section">
          <h2>其他工具集</h2>
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
        <div
          className={`tool-meta${
            activeRoute?.executionMode ? ` tool-meta--${activeRoute.executionMode}` : ' tool-meta--browser'
          }`}
          role="note"
        >
          <span className="tool-meta-label">运行方式</span>
          <span className="tool-meta-value">
            {activeRoute?.executionMode === 'remote' ? '依赖远程服务' : '浏览器本地计算'}
          </span>
          <span className="tool-meta-note">
            {activeRoute?.executionNote ?? '本站所有工具默认由浏览器本地执行，避免敏感数据外泄。'}
          </span>
        </div>
        <Outlet />
      </section>
    </div>
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
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={homeElement} />
        {toolRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
