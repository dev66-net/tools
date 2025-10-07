import type { ToolCopy } from '../../../i18n/types';

const urlParser: ToolCopy = {
  meta: {
    label: 'URL 解析器',
    pageTitle: 'URL 解析器｜分解链接结构与查询参数 - tools.dev66.net',
    description:
      'URL 解析器实时分解协议、域名、路径和查询参数，支持自动补全 https 前缀以及编码/解码工具，方便排查跳转与签名问题。',
    keywords: [
      'URL 解析',
      '链接分析',
      '查询参数',
      'URL decode',
      'URL encode',
      '跳转排查',
      '链接调试',
      '在线工具',
    ],
    fallbackLabel: 'URL 解析工具',
    executionNote: '浏览器本地解析 URL 结构，安全分析私有或测试链接。',
  },
  page: {
    title: 'URL 解析器：分解链接结构与参数',
    description:
      'URL 解析器实时拆解协议、域名、路径与查询参数，并内置 URL 编解码工具，适合排查跳转、签名与重定向问题。',
    form: {
      label: '请输入 URL：',
      placeholder: 'https://example.com/path?foo=bar&baz=qux',
      emptyPrompt: '请输入待解析的 URL',
      parseError: '无法解析该 URL，请确认格式是否正确。',
      noteAutoScheme: '已自动补全 https:// 前缀以便解析。',
    },
    details: {
      title: 'URL 详情',
      labels: {
        scheme: '协议',
        host: '主机',
        hostname: '域名',
        port: '端口',
        pathname: '路径',
        query: '查询字符串',
        hash: '哈希',
        username: '用户名',
        password: '密码',
        origin: '来源',
      },
      empty: '（无）',
      maskedPassword: '••••••',
      defaultPath: '/',
    },
    query: {
      title: '查询参数',
      empty: '该 URL 不包含查询参数',
      unnamed: '(未命名参数)',
      emptyValue: '(空字符串)',
      copy: '复制值',
      copied: '已复制',
    },
    transform: {
      title: 'URL 编解码',
    },
    encode: {
      title: 'URL Encode',
      sourceLabel: '原始文本',
      sourcePlaceholder: '任意文本，将自动转换为 URL 编码',
      resultLabel: '编码结果',
      resultPlaceholder: '编码结果会显示在这里',
      copy: '复制结果',
      copied: '已复制',
    },
    decode: {
      title: 'URL Decode',
      sourceLabel: 'URL 编码文本',
      sourcePlaceholder: '输入 URL 编码内容，会尝试自动解码',
      resultLabel: '解码结果',
      resultPlaceholder: '解码结果会显示在这里',
      error: '解码失败，请确认输入是否为有效的 URL 编码。',
      copy: '复制结果',
      copied: '已复制',
    },
    tips: {
      title: 'URL 调试建议',
      description: '结合查询参数与编码工具，可以快速验证接口回调、OAuth 跳转或日志中的可疑链接。',
      bullets: [
        '若输入缺少协议，工具会自动补全 https:// 方便解析，可在“协议”栏确认真实协议。',
        '点击查询参数右侧的复制按钮即可复制值，便于调试签名或粘贴到 Postman、cURL。',
        '对疑似被编码多次的字符串，可先使用 URL Decode 工具逐次解码再观察结果。',
      ],
      hint: '处理敏感链接时请注意隐藏令牌或签名参数，避免在分享截图时泄露信息。',
    },
  },
};

export default urlParser;
