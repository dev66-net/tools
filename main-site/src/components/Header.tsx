import React, { useState } from 'react';
import { Locale, getAlternatePath } from '../i18n';

interface HeaderProps {
  currentLocale: Locale;
  onLanguageChange: (locale: Locale) => void;
  translations: any;
}

export default function Header({ currentLocale, onLanguageChange, translations }: HeaderProps) {
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const handleLanguageChange = (locale: Locale) => {
    onLanguageChange(locale);
    setIsLangDropdownOpen(false);

    // 更新URL
    const currentPath = window.location.pathname;
    const newPath = getAlternatePath(currentPath, locale);

    if (currentPath !== newPath) {
      window.location.replace(newPath);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <a href="/" className="brand">
            Dev66
          </a>

          <nav className="nav-links">
            <a href="#tools" className="nav-link">
              {translations.tools}
            </a>
            <a href="#about" className="nav-link">
              {translations.navAbout}
            </a>

            <div className="language-selector">
              <button
                className="language-button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                aria-label="Select language"
              >
                <span>🌐</span>
                <span>{currentLocale === 'zh-cn' ? '中文' : 'EN'}</span>
                <span>▼</span>
              </button>

              {isLangDropdownOpen && (
                <div className="language-dropdown">
                  <button
                    className={`language-option ${currentLocale === 'en' ? 'active' : ''}`}
                    onClick={() => handleLanguageChange('en')}
                  >
                    English
                  </button>
                  <button
                    className={`language-option ${currentLocale === 'zh-cn' ? 'active' : ''}`}
                    onClick={() => handleLanguageChange('zh-cn')}
                  >
                    简体中文
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      <style jsx>{`
        .language-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          overflow: hidden;
        }

        .language-option {
          display: block;
          width: 100%;
          padding: 0.75rem 1rem;
          border: none;
          background: transparent;
          text-align: left;
          cursor: pointer;
          font-size: 0.875rem;
          color: #64748b;
          transition: background-color 0.2s;
        }

        .language-option:hover {
          background-color: #f8fafc;
        }

        .language-option.active {
          background-color: #eff6ff;
          color: #3b82f6;
          font-weight: 500;
        }
      `}</style>
    </header>
  );
}