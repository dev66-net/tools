import type { Translations } from '../../i18n/types';
import home from './home';
import languageMenu from './languageMenu';
import layout from './layout';
import site from './site';
import tools from './tools';

const zhCN: Translations = {
  locale: 'zh-CN',
  languageName: '简体中文',
  site,
  layout,
  languageMenu,
  home,
  tools,
};

export default zhCN;
