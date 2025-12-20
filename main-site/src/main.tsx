import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Locale } from './i18n';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);

  // 从全局变量获取初始语言（由HTML模板注入）
  const initialLocale = (window as any).__INITIAL_LOCALE__ as Locale;

  root.render(<App initialLocale={initialLocale} />);
}