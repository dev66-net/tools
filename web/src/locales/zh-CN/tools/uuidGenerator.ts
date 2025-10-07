import type { ToolCopy } from '../../../i18n/types';

const uuidGenerator: ToolCopy = {
  meta: {
    label: 'UUID 生成器',
    pageTitle: 'UUID 生成器｜在线创建 v1/v4/v5 UUID - tools.dev66.net',
    description:
      'UUID 生成器可生成时间序列 v1、随机 v4 及基于命名空间的 v5 UUID，支持批量输出与格式选项，适合标识资源与请求。',
    keywords: [
      'UUID 生成',
      'UUID v4',
      'UUID v1',
      'UUID v5',
      '随机 UUID',
      '命名空间 UUID',
      'UUID 工具',
      '唯一标识符',
    ],
    fallbackLabel: 'UUID 工具',
    executionNote: 'UUID 算法在浏览器端实现，可离线批量生成标识符。',
  },
  page: {},
};

export default uuidGenerator;
