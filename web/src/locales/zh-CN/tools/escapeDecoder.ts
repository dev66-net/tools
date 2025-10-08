import type { ToolCopy } from '../../../i18n/types';

const escapeDecoder: ToolCopy = {
  meta: {
    label: '转义字符解码器',
    pageTitle: '转义字符解码器｜解析多语言转义字符串 - tools.dev66.net',
    description:
      '转义字符解码器兼容 JSON、JavaScript、Python、Shell 等转义规则，可一键解码和重新编码，帮助排查日志、配置与脚本。',
    keywords: [
      '转义字符解码',
      'escape 解码',
      '字符串转义',
      'JSON 转义',
      'Shell 转义',
      'Python 转义',
      'Unicode 转义',
      '在线工具',
    ],
    fallbackLabel: '转义解码工具',
    executionNote: '字符串解码在浏览器进行，可逐层剥离转义字符，无需上传。',
  },
  page: {
    title: '转义字符解码器：解析多语言转义',
    description:
      '兼容 JSON、JavaScript、Python、Shell 等转义规则，自动识别 Unicode、十六进制与八进制序列，帮助恢复原始文本或代码片段。',
    inputs: {
      modeLabel: '解析模式',
      autoLabel: '自动检测',
      autoDescription: '依次尝试 JSON、JavaScript、Python 与 Shell 语法。',
      modeDescriptionFallback: '请选择解析模式以了解支持范围。',
      valueLabel: '转义字符串',
      placeholder: '例如：\\u4f60\\u597d\\n\\x48\\x65\\x6c\\x6c\\x6f',
    },
    modes: {
      json: {
        label: 'JSON 字符串',
        description: '符合 JSON 标准：允许 \\b \\f \\n \\r \\t \\\" \\/ \\\\ 与 \\uXXXX。',
      },
      javascript: {
        label: 'JavaScript 字符串',
        description: '支持 ES 字符串中的 \\xHH、\\uXXXX、\\u{...}、八进制与常见转义。',
      },
      python: {
        label: 'Python 字符串',
        description: '支持 \\x、\\u、\\U、八进制、\\a 等写法，遵循 Python 3 语义。',
      },
      shell: {
        label: "Shell $'...'",
        description: '模拟 Bash ANSI-C 风格的转义，支持 \\x、\\u、\\U、\\c 等。',
      },
    },
    results: {
      title: '解码结果',
      modeUsed: '使用模式：{mode}',
      outputLabel: '纯文本',
      outputPlaceholder: '解码后的文本将显示在这里',
      jsonLabel: 'JSON 再编码',
      jsonEmpty: '—',
      buttons: {
        copy: '复制文本',
        copied: '已复制',
        clear: '清空输入',
      },
    },
    guidance: {
      title: '常见应用场景',
      description: '调试日志、接口数据或脚本模板时，可结合不同模式快速还原原文。',
      bullets: [
        '先使用“自动检测”识别常见语言，如结果异常可手动切换模式重新解析。',
        '通过“JSON 再编码”快速获得可直接粘贴到代码中的安全字符串表示。',
        '处理多层转义时，可将解码结果再次粘贴到输入区域，逐层剥离。',
      ],
      hint: '工具全部在本地运行，可放心处理包含令牌或敏感信息的文本。',
    },
    messages: {
      errors: {
        unterminatedEscape: '检测到未完成的转义序列，末尾缺少对应字符。',
        hexNotSupported: '当前模式不支持 \\xHH 转义。',
        hexLength: '\\x 后需紧跟两个十六进制字符。',
        unicodeNotSupported: '当前模式不支持 \\u 转义。',
        unicodeBraceMissing: '\\u{...} 缺少右花括号。',
        unicodeBraceInvalid: '\\u{...} 内只能包含十六进制字符。',
        unicodeOutOfRange: 'Unicode 码点超出有效范围。',
        unicodeShortNotSupported: '当前模式不支持 \\uXXXX 形式。',
        unicodeShortLength: '\\u 需要紧跟四个十六进制字符。',
        unicodeLongNotSupported: '当前模式不支持 \\UXXXXXXXX 转义。',
        unicodeLongLength: '\\U 需要紧跟八个十六进制字符。',
        namedUnicodeNotSupported: '当前模式不支持 \\N{...} 命名字符。',
        namedUnicodeMissing: '\\N{} 必须包含有效的名称。',
        controlNotSupported: '当前模式不支持 \\cX 控制字符写法。',
        controlMissing: '\\c 缺少对应的控制字符。',
        octalNotSupported: '检测到八进制转义 \\{value}，但当前模式不支持。',
        unknownEscape: '检测到未支持的转义：\\{value}',
        autoFailed: '未能解析该转义字符串，请尝试手动选择模式。',
      },
      warnings: {
        namedUnicode: '暂未实现命名 Unicode 字符 \\N{{name}}，将原样保留。',
      },
    },
  },
};

export default escapeDecoder;
