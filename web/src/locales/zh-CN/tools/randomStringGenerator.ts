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
  page: {
    title: '随机字符串生成器：自定义字符集批量生成',
    description:
      '组合多种字符集或自定义符号，一键批量生成随机字符串，并可启用加密安全随机源用于密码、Token 或测试数据。',
    form: {
      lengthLabel: '长度',
      countLabel: '数量',
      includeLowercase: '小写字母',
      includeUppercase: '大写字母',
      includeDigits: '数字',
      includeSymbols: '特殊符号',
      customLabel: '自定义字符',
      customPlaceholder: '可选，例如中文字符或额外符号',
      preferCryptoLabel: '优先使用加密安全的随机源',
      buttons: {
        generate: '生成字符串',
        copy: '复制全部',
        copied: '已复制',
      },
      errors: {
        invalidLength: '长度必须为正整数。',
        maxLength: '最大长度为 {count}。',
        invalidCount: '数量必须为正整数。',
        maxCount: '一次最多生成 {count} 条。',
        emptyPool: '请至少选择一种字符类型或输入自定义字符。',
        generic: '生成随机字符串失败，请重试。',
      },
    },
    results: {
      cryptoUsed: '已使用加密安全随机源生成。',
      cryptoFallback: '未检测到加密安全随机源，已回退至 Math.random()。',
      mathUsed: '已使用 Math.random() 生成。',
    },
    guidance: {
      title: '构建安全可靠的随机字符串',
      description: '根据目标场景调整字符集与长度，既保证复杂度又方便记忆或复制。',
      bullets: [
        '生成密码时建议同时勾选大小写、数字与符号，并开启加密安全随机源。',
        '用于测试数据时，可通过自定义字符添加中文或特定前缀，模拟真实输入。',
        '批量生成的结果支持一键复制，粘贴到脚本或 CSV 即可完成数据准备。',
      ],
      hint: '浏览器内生成无需联网，适合企业内网或离线环境快速制作凭证与测试样本。',
    },
  },
};

export default randomStringGenerator;
