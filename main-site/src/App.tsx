import React, { useState, useEffect } from 'react';
import { Locale, locales, getLocale } from './i18n';
import './App.css';

import Header from './components/Header';
import Hero from './components/Hero';
import ToolGrid from './components/ToolGrid';
import Footer from './components/Footer';

interface AppProps {
  initialLocale?: Locale;
}

function App({ initialLocale }: AppProps) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(initialLocale || 'en');

  // 从URL路径获取初始语言（仅在客户端）
  useEffect(() => {
    if (!initialLocale && typeof window !== 'undefined') {
      const pathLocale = getLocale(window.location.pathname);
      setCurrentLocale(pathLocale);
    }
  }, [initialLocale]);

  const translations = locales[currentLocale];

  // 更新页面元信息（仅在客户端）
  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.title = translations.title;

    // 更新 meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', translations.description);
    }

    // 更新 meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', translations.keywords);
    }

    // 更新语言标签
    document.documentElement.lang = currentLocale === 'zh-cn' ? 'zh-CN' : 'en';
  }, [currentLocale, translations]);

  return (
    <div className="app">
      <Header
        currentLocale={currentLocale}
        onLanguageChange={setCurrentLocale}
        translations={translations}
      />

      <main>
        <Hero locale={currentLocale} translations={translations} />

        <section className="section">
          <div className="container">
            <ToolGrid locale={currentLocale} translations={translations} />
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="about" id="about">
              <h2 className="about-title">{translations.about.title}</h2>
              <p className="about-description">
                {translations.about.description1}
                <br /><br />
                {translations.about.description2}
              </p>
              <div className="about-features">
                {translations.about.features.map((feature: string, index: number) => (
                  <div key={index} className="about-feature">
                    ✅ {feature}
                  </div>
                ))}
              </div>
              <div className="about-feedback">
                <p className="about-feedback-title">{translations.about.feedback.title}</p>
                <a
                  href={translations.about.feedback.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-feedback-link"
                >
                  {translations.about.feedback.action}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer locale={currentLocale} translations={translations} />
    </div>
  );
}

export default App;