import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { NavLink, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import tools from './tools.tsx';
import './App.css';

type ToolRoute = {
  path: string;
  label: string;
  description: string;
  keywords: string[];
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

const toolRoutes: ToolRoute[] = tools.map((tool) => {
  const { Component, description, fallbackLabel, keywords, label, path, preload } = tool;
  const element = withSuspense(<Component />, fallbackLabel);
  const searchText = [label, fallbackLabel, description, keywords.join(' '), path]
    .join(' ')
    .toLowerCase();

  return {
    path,
    label,
    description,
    keywords,
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

const defaultPath = toolRoutes[0]!.path;

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isMobile = useIsMobile();
  const location = useLocation();
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
          {filteredRoutes.length === 0 ? (
            <div className="menu-empty">没有找到匹配的工具</div>
          ) : (
            filteredRoutes.map(({ path, label, preload }) => (
              <NavLink
                key={path}
                to={path}
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
        <Route index element={<Navigate to={defaultPath} replace />} />
        {toolRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to={`/${defaultPath}`} replace />} />
    </Routes>
  );
}
