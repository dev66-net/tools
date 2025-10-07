import type { ToolCopy } from '../../../i18n/types';

const base64Converter: ToolCopy = {
  meta: {
    label: 'Base64 编解码器',
    pageTitle: 'Base64 编解码器｜支持标准与 URL Safe Base64 - tools.dev66.net',
    description:
      'Base64 编解码器支持标准与 URL Safe 变体，自动识别补位，提供十六进制查看与复制功能，适合排查接口数据和附件内容。',
    keywords: [
      'Base64 编码',
      'Base64 解码',
      'URL Safe Base64',
      'Base64 转换',
      'Base64 工具',
      'Base64 在线',
      'Base64 校验',
      'Base64 变体',
    ],
    fallbackLabel: 'Base64 编解码工具',
    executionNote: 'Base64 转换使用浏览器内建 API，适合处理私有文本与二进制片段。',
  },
  page: {
    title: 'Base64 编解码器：支持标准与 URL Safe',
    description:
      '将文本编码为 Base64 或解码现有字符串，自动识别 URL Safe 变体并展示十六进制视图，全程在浏览器本地完成。',
    encode: {
      title: 'Base64 编码',
      description: '输入文本后自动使用 UTF-8 编码为二进制，再转换为 Base64。',
      inputLabel: '原始文本',
      placeholder: '输入要编码的文本',
      variantLabel: '输出格式',
      variants: {
        standard: { label: '标准 Base64', hint: '使用 + / 字符，包含补位 = 号' },
        'standard-no-pad': { label: '标准（无补位）', hint: '使用 + / 字符，不输出尾部 =' },
        url: { label: 'URL Safe', hint: '使用 - _ 字符，包含补位 =' },
        'url-no-pad': { label: 'URL Safe（无补位）', hint: '使用 - _ 字符，不输出尾部 =' },
      },
      byteLengthLabel: '字节数：{count}',
      resultLabel: '编码结果',
      resultPlaceholder: '编码结果会显示在这里',
      buttons: {
        copy: '复制编码',
        copied: '已复制',
        clearInput: '清空输入',
      },
    },
    decode: {
      title: 'Base64 解码',
      description: '自动识别标准或 URL Safe 变体，必要时补齐缺失的 “=” 补位。',
      inputLabel: 'Base64 字符串',
      placeholder: '粘贴或输入 Base64 编码文本',
      errors: {
        invalidCharacter: '检测到非法字符，请确认输入是否为 Base64 编码内容。',
        invalidLength: '长度不符合 Base64 要求，缺失的字符数量无法补齐。',
        decodeFailed: '无法解码该 Base64 字符串，请确认内容是否正确。',
      },
      status: {
        waiting: '等待输入',
        identified: '已识别为：{variant}',
        addedPadding: '（已自动补全 {count} 个 =）',
      },
      resultLabel: '解码文本',
      resultPlaceholder: '解码后的纯文本',
      hexLabel: '十六进制：',
      buttons: {
        copy: '复制文本',
        copied: '已复制',
        clearInput: '清空输入',
      },
      variantLabels: {
        standard: '标准 Base64',
        'standard-no-pad': '标准 Base64（自动补齐）',
        url: 'URL Safe Base64',
        'url-no-pad': 'URL Safe Base64（自动补齐）',
      },
    },
    section: {
      title: 'Base64 使用技巧',
      description: '结合十六进制与补位提示，快速判断数据来源并校验传输格式。',
      bullets: [
        '在调试接口响应时，可粘贴 Base64 字段并对照十六进制输出判断文件类型。',
        'URL Safe 变体常见于 JWT、URL 参数，工具会自动转换字符，无需手工替换。',
        '若遇到长度错误，查看提示的补位数量，确认上游是否缺少 “=”。',
      ],
      hint: '所有转换操作均在本地执行，可放心处理包含令牌或私密信息的内容。',
    },
  },
};

export default base64Converter;
