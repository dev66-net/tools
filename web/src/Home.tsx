import { Link } from 'react-router-dom';
import { buildPathForLocale, useI18n } from './i18n/index';

type BulletFragment = { type: 'text'; value: string } | { type: 'code'; value: string };

function parseBullet(text: string): BulletFragment[] {
  const fragments: BulletFragment[] = [];
  const matcher = /\[\[([^\]]+)\]\]/gu;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(text)) !== null) {
    const [fullMatch, codeValue] = match;
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      fragments.push({ type: 'text', value: text.slice(lastIndex, matchIndex) });
    }
    fragments.push({ type: 'code', value: codeValue });
    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < text.length) {
    fragments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  if (fragments.length === 0) {
    return [{ type: 'text', value: text }];
  }

  return fragments;
}

export default function Home() {
  const { locale, translations } = useI18n();
  const { home } = translations;
  const ctaHref = buildPathForLocale(locale, home.cta.linkSlug);

  return (
    <main className="card">
      <h1>{home.heroTitle}</h1>
      <p className="card-description">{home.heroDescription}</p>
      {home.sections.map((section) => (
        <section key={section.title} className="section">
          <header className="section-header">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </header>
          <ul>
            {section.bullets.map((bullet) => {
              const fragments = parseBullet(bullet);
              return (
                <li key={bullet}>
                  {fragments.map((fragment, index) =>
                    fragment.type === 'code' ? (
                      <code key={`code-${index}`}>{fragment.value}</code>
                    ) : (
                      <span key={`text-${index}`}>{fragment.value}</span>
                    )
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <section className="section">
        <p className="hint">
          {home.cta.text}
          <Link to={{ pathname: ctaHref }}>{home.cta.linkLabel}</Link>
        </p>
      </section>
    </main>
  );
}
