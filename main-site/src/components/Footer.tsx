import React from 'react';
import { Locale } from '../i18n';

interface FooterProps {
  locale: Locale;
  translations: any;
}

export default function Footer({ locale, translations }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <p>
            {translations.footer.copyright}
            {' • '}
            <a
              href="https://tools.dev66.net"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              {translations.tools}
            </a>
            {' • '}
            {translations.footer.poweredBy}
          </p>
        </div>
      </div>
    </footer>
  );
}