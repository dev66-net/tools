import type { ToolCopy } from '../../../i18n/types';

const randomNumberGenerator: ToolCopy = {
  meta: {
    label: '随机数生成器',
    pageTitle: '随机数生成器｜生成指定范围的安全随机整数 - tools.dev66.net',
    description:
      '随机数生成器支持设定范围、批量数量与加密强度随机源，适合抽奖、测试数据与验证码候选。',
    keywords: [
      '随机数生成',
      '随机整数',
      'Crypto 随机',
      '随机工具',
      '在线随机',
      '随机抽样',
      '随机范围',
      '随机批量',
    ],
    fallbackLabel: '随机数工具',
    executionNote: '优先使用浏览器内的 Web Crypto 生成随机数，不依赖外部服务。',
  },
  page: {
    title: '随机数生成器：生成安全随机整数',
    description:
      '设定上下限与数量即可生成随机整数，可优先启用加密强度随机源，满足抽奖、测试数据与验证码等场景。',
    form: {
      minLabel: '最小值',
      maxLabel: '最大值',
      countLabel: '数量',
      generate: '生成随机数',
      copy: '复制结果',
      copied: '已复制',
      preferCryptoLabel: '优先使用加密安全的随机源',
      errors: {
        invalidBounds: '请输入有效的上下界。',
        invalidCount: '生成数量必须大于等于 1。',
        maxCount: '一次最多生成 {count} 个随机数。',
        invertedRange: '上界必须大于或等于下界。',
        generic: '随机数生成失败，请重试。',
      },
    },
    results: {
      cryptoUsed: '已使用加密安全随机源生成结果。',
      cryptoFallback: '未检测到加密安全随机源，已回退至 Math.random()。',
      mathUsed: '已使用 Math.random() 生成结果。',
    },
    guidance: {
      title: '随机数应用建议',
      description: '根据用途选择合适的随机源与数量，确保结果可信且易于复现。',
      bullets: [
        '启用“加密安全随机源”可用于抽奖、验证码等需要防预测的场景。',
        '批量输出后可点击“复制结果”一次性粘贴到电子表格或测试脚本。',
        '若需要可重复的结果，建议记录生成参数并在外部脚本中固定随机种子。',
      ],
      hint: '浏览器环境无法获取硬件噪声，仅依赖 Web Crypto 或 Math.random() 完成随机生成。',
    },
  },
};

export default randomNumberGenerator;
