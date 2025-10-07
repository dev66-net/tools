import type { ToolCopy } from '../../../i18n/types';

const escapeDecoder: ToolCopy = {
  meta: {
    label: '转义字符解码器',
    pageTitle: '转义字符解码器｜解析多语言转义字符串 - tools.dev66.net',
    description:
      '转义字符解码器兼容 JSON、JavaScript、Python、Shell 等转义规则，可一键解码和重新编码，帮助排查日志、配置与脚本。',
    keywords: [
      '转义字符解码',
      'escape 解码',
      '字符串转义',
      'JSON 转义',
      'Shell 转义',
      'Python 转义',
      'Unicode 转义',
      '在线工具',
    ],
    fallbackLabel: '转义解码工具',
    executionNote: '字符串解码在浏览器进行，可逐层剥离转义字符，无需上传。',
  },
  page: {},
};

export default escapeDecoder;
