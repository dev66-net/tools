import type { ToolCopy } from '../../../i18n/types';

const hexConverter: ToolCopy = {
  meta: {
    label: 'Hex 转换器',
    pageTitle: 'Hex 转换器｜文本与十六进制双向转换 - tools.dev66.net',
    description:
      'Hex 转换器支持文本与十六进制互转，包含大小写、分隔符、字节长度统计等选项，便于分析二进制与调试网络报文。',
    keywords: [
      '十六进制转换',
      'Hex 编码',
      'Hex 解码',
      'Hex 工具',
      '十六进制文本',
      'Hex viewer',
      'Hex to text',
      '字节分析',
    ],
    fallbackLabel: '十六进制工具',
    executionNote: '十六进制与文本转换在浏览器端完成，可放心分析日志与报文。',
  },
  page: {},
};

export default hexConverter;
