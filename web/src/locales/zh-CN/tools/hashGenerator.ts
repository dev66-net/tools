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
  page: {
    title: '哈希计算器：在线生成 MD5 与 SHA 摘要',
    description:
      '在浏览器内计算 MD5、SHA-1、SHA-256 等常见摘要，可复制 Hex 与 Base64 结果用于校验下载、接口或签名。',
    input: {
      label: '待计算文本',
      placeholder: '输入或粘贴需要计算摘要的文本',
      byteLength: 'UTF-8 字节长度：{count}',
      clear: '清空输入',
    },
    results: {
      title: '摘要结果',
      emptyHint: '输入文本后将自动计算。',
      columns: {
        algorithm: '算法',
        hex: 'Hex',
        base64: 'Base64',
      },
      buttons: {
        copy: '复制',
        copied: '已复制',
      },
      status: {
        pending: '计算中…',
      },
      errors: {
        unsupported: '当前环境不支持 Web Crypto Subtle API。',
        generic: '摘要计算失败，请稍后重试。',
      },
    },
    section: {
      title: '哈希校验提示',
      description: '对比 Hex 或 Base64 摘要即可确认文件或报文是否被篡改。',
      bullets: [
        '使用 Hex 摘要对照下载页或接口返回的签名，确认文件完整性。',
        'Base64 摘要常用于 HTTP 头或数据库字段，点击“复制”即可粘贴到调试工具。',
        '处理大文本时计算可能稍有延迟，请等待按钮变为“已复制”后再继续操作。',
      ],
      hint: '工具在浏览器本地计算哈希，适合处理包含密钥或敏感配置的内容。',
    },
  },
};

export default hashGenerator;
