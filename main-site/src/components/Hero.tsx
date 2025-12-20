import React from 'react';
import { Locale } from '../i18n';

interface HeroProps {
  locale: Locale;
  translations: any;
}

export default function Hero({ locale, translations }: HeroProps) {
  const scrollToTools = () => {
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      <div className="container">
        <h1 className="hero-title">{translations.hero.title}</h1>
        <p className="hero-subtitle">{translations.hero.subtitle}</p>
        <p className="hero-description">{translations.hero.description}</p>
        <button className="hero-cta" onClick={scrollToTools}>
          {translations.hero.cta}
        </button>
      </div>
    </section>
  );
}