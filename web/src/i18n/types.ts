export type LocaleCode = 'en' | 'zh-CN';

export type ToolMetaCopy = {
  label: string;
  pageTitle: string;
  description: string;
  keywords: string[];
  fallbackLabel: string;
  executionNote: string;
};

export type ToolCopy<TPage extends Record<string, unknown> = Record<string, unknown>> = {
  meta: ToolMetaCopy;
  page: TPage;
};

export type LayoutCopy = {
  menuButtonLabel: string;
  menuButtonAriaLabel: string;
  brandName: string;
  closeMenuAriaLabel: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  homeNavLabel: string;
  noSearchResult: string;
  externalToolsTitle: string;
  executionModeLabel: string;
  executionModeBrowser: string;
  executionModeRemote: string;
  executionNoteDefault: string;
  loadingLabel: string;
  backToHomeLabel: string;
  backToHomeHref: string;
  githubLinkTitle: string;
};

export type SiteCopy = {
  mainTitle: string;
  description: string;
  keywords: string[];
};

export type HomeSection = {
  title: string;
  description: string;
  bullets: string[];
};

export type HomeCopy = {
  heroTitle: string;
  heroDescription: string;
  sections: HomeSection[];
  cta: {
    text: string;
    linkLabel: string;
    linkSlug: string;
  };
  issueLink: {
    text: string;
    linkLabel: string;
    href: string;
  };
};

export type LanguageMenuCopy = {
  label: string;
  options: Record<LocaleCode, string>;
};

export type Translations = {
  locale: LocaleCode;
  languageName: string;
  site: SiteCopy;
  layout: LayoutCopy;
  languageMenu: LanguageMenuCopy;
  home: HomeCopy;
  tools: Record<string, ToolCopy>;
};
