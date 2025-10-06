import { Suspense, lazy, useEffect } from 'react';
import type { ReactNode } from 'react';
import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import QRGenerator from './QRGenerator.tsx';
import QRScanner from './QRScanner.tsx';
import UrlParse from './UrlParse.tsx';
import './App.css';

const loadJWTDecoder = () => import('./JWTDecoder.tsx');
const JWTDecoder = lazy(loadJWTDecoder);

const loadJSONFormatter = () => import('./JSONFormatter.tsx');
const JSONFormatter = lazy(loadJSONFormatter);

type ToolRoute = {
  path: string;
  label: string;
  element: ReactNode;
  preload?: () => void;
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

const toolRoutes: ToolRoute[] = [
  { path: 'generator', label: '二维码生成', element: <QRGenerator /> },
  { path: 'scanner', label: '二维码识别', element: <QRScanner /> },
  { path: 'url-parser', label: 'URL 解析', element: <UrlParse /> },
  {
    path: 'json-formatter',
    label: 'JSON 格式化',
    element: withSuspense(<JSONFormatter />, 'JSON 格式化工具'),
    preload: loadJSONFormatter,
  },
  {
    path: 'jwt-decoder',
    label: 'JWT 解析',
    element: withSuspense(<JWTDecoder />, 'JWT 解析器'),
    preload: loadJWTDecoder,
  },
];

const externalTools = [
  { name: 'CyberChef', href: 'https://gchq.github.io/CyberChef/' },
  { name: 'JWT.io', href: 'https://jwt.io/' },
  { name: 'Regex101', href: 'https://regex101.com/' },
  { name: 'JSON Formatter', href: 'https://jsonformatter.org/' },
];

const defaultPath = toolRoutes[0]!.path;

function Layout() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      toolRoutes.forEach((route) => route.preload?.());
    }, 800);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">工具集</div>
        <nav className="nav">
          {toolRoutes.map(({ path, label, preload }) => (
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
          ))}
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
