import type { Translations } from '../../i18n/types';
import home from './home';
import languageMenu from './languageMenu';
import layout from './layout';
import site from './site';
import tools from './tools';

const en: Translations = {
  locale: 'en',
  languageName: 'English',
  site,
  layout,
  languageMenu,
  home,
  tools,
};

export default en;
