import React, { useState } from 'react';
import { getAllToolsInfo, getToolsByCategory, ToolCategory, toolCategories } from '../data/tools';
import { Locale } from '../i18n';
import ToolCard from './ToolCard';

interface ToolGridProps {
  locale: Locale;
  translations: any;
}

export default function ToolGrid({ locale, translations }: ToolGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const allTools = getAllToolsInfo();
  const filteredTools = selectedCategory
    ? getToolsByCategory(selectedCategory)
    : allTools;

  return (
    <>
      <div className="category-tabs">
        <button
          className={`category-tab ${!selectedCategory ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          <span>🔧</span>
          <span>{translations.categories.all}</span>
        </button>

        {toolCategories.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span>{category.icon}</span>
            <span>{category.name[locale]}</span>
          </button>
        ))}
      </div>

      <div id="tools" className="tools-grid">
        {filteredTools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            locale={locale}
            translations={translations}
          />
        ))}
      </div>
    </>
  );
}