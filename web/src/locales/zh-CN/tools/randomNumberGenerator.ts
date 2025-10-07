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
  page: {},
};

export default randomNumberGenerator;
