import React from 'react';
import { ToolInfo } from '../data/tools';
import { Locale } from '../i18n';

interface ToolCardProps {
  tool: ToolInfo;
  locale: Locale;
  translations: any;
}

export default function ToolCard({ tool, locale, translations }: ToolCardProps) {
  const toolUrl = `https://tools.dev66.net${locale === 'zh-cn' ? '/zh-cn' : ''}/${tool.slug}`;

  return (
    <a href={toolUrl} className="tool-card" target="_blank" rel="noopener noreferrer">
      <span className="tool-icon">{tool.icon}</span>
      <h3 className="tool-title">{tool.displayName[locale]}</h3>
      <p className="tool-description">{tool.description[locale]}</p>
      <div className="tool-meta">
        <span className="tool-tag">
          {tool.executionMode === 'browser'
            ? translations.toolCard.runInBrowser
            : translations.toolCard.runRemote
          }
        </span>
        <span className="tool-arrow">→</span>
      </div>
    </a>
  );
}