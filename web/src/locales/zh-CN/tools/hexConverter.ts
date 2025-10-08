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
  page: {
    title: 'Hex 转换器：文本与十六进制互转',
    description:
      '支持文本与十六进制双向转换，可调大小写、分组与字节统计，帮助排查二进制内容与网络报文。',
    encode: {
      title: '文本转 Hex',
      description: '输入内容将按 UTF-8 编码为字节，并转换为十六进制字符串。',
      inputLabel: '原始文本',
      placeholder: '需要转换的文本',
      uppercaseLabel: '使用大写字符',
      groupingLabel: '分组方式',
      groupingOptions: {
        none: '无分隔（紧凑）',
        byte: '按字节添加空格',
        word: '每两个字节添加空格',
      },
      byteCountLabel: '字节数：{count}',
      resultLabel: 'Hex 输出',
      resultPlaceholder: '十六进制结果将显示在这里',
      buttons: {
        copy: '复制 Hex',
        copied: '已复制',
        clear: '清空输入',
      },
    },
    decode: {
      title: 'Hex 转文本',
      description: '支持包含空格、换行或 0x 前缀的 Hex 字符串，转换前会自动清理格式。',
      inputLabel: 'Hex 字符串',
      placeholder: '例如：48656c6c6f 或 48 65 6c 6c 6f',
      errors: {
        invalidCharacters: '未检测到有效的十六进制字符。',
        decodeFailed: '无法解析该十六进制字符串，请确认格式是否正确。',
      },
      byteCountLabel: '字节数：{count}',
      byteCountEmpty: '—',
      resultLabel: '解码文本',
      resultPlaceholder: '解码后的文本将显示在这里',
      normalizedLabel: '标准化 Hex：',
      buttons: {
        copy: '复制文本',
        copied: '已复制',
        clear: '清空输入',
      },
    },
    section: {
      title: '十六进制排查技巧',
      description: '结合标准化输出与字节统计，可快速识别编码格式或数据截断问题。',
      bullets: [
        '关注“字节数”即可确认文件大小，便于对比上传或接口参数的二进制长度。',
        '切换分组规则可生成 0xAB、ABCD 等常见格式，方便粘贴到代码或协议说明。',
        '若解码失败，请先移除分隔符或确认字符数量为偶数，再尝试重新解析。',
      ],
      hint: '工具完全在浏览器内运行，适合在内网或离线环境处理敏感日志与报文。',
    },
  },
};

export default hexConverter;
