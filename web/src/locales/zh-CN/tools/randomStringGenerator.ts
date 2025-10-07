import type { ToolCopy } from '../../../i18n/types';

const randomStringGenerator: ToolCopy = {
  meta: {
    label: '随机字符串生成器',
    pageTitle: '随机字符串生成器｜自定义字符集批量生成密码 - tools.dev66.net',
    description:
      '随机字符串生成器支持多字符集组合、长度设置、批量输出与安全随机源，可用于生成密码、Token 与测试数据。',
    keywords: [
      '随机字符串',
      '密码生成器',
      '随机文本',
      '随机 Token',
      '随机 ID',
      '字符串生成',
      '批量生成',
      '安全随机',
    ],
    fallbackLabel: '随机字符串工具',
    executionNote: '字符串在浏览器本地组合，结合 Web Crypto 提供安全随机性。',
  },
  page: {},
};

export default randomStringGenerator;
