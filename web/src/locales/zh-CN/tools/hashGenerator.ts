import type { ToolCopy } from '../../../i18n/types';

const hashGenerator: ToolCopy = {
  meta: {
    label: '哈希计算器',
    pageTitle: '哈希计算器｜在线生成 MD5 与 SHA 摘要 - tools.dev66.net',
    description:
      '哈希计算器支持 MD5、SHA-1、SHA-256 等常见算法，自动统计大小写形式并可导出 Base64，用于校验文件与 API 签名。',
    keywords: [
      '哈希计算',
      'MD5 在线',
      'SHA256 在线',
      '哈希摘要',
      '散列函数',
      '哈希校验',
      '摘要生成',
      '哈希工具',
    ],
    fallbackLabel: '哈希工具',
    executionNote: '使用 Web Crypto API 在本地生成摘要，适合校验敏感文件或报文。',
  },
  page: {},
};

export default hashGenerator;
