import type { ToolCopy } from '../../../i18n/types';

const jwtDecoder: ToolCopy = {
  meta: {
    label: 'JWT 解码器',
    pageTitle: 'JWT 解码器｜在线解析与校验 JSON Web Token - tools.dev66.net',
    description:
      'JWT 解码器即时解析 Header、Payload 与 Signature，支持 HS256 本地校验并展示过期时间，帮助排查授权与登录问题。',
    keywords: [
      'JWT 解码',
      'JWT 解析',
      'JSON Web Token',
      'HS256 校验',
      'Token 调试',
      '身份验证',
      'OAuth 调试',
      '在线工具',
    ],
    fallbackLabel: 'JWT 解析工具',
    executionNote: 'JWT 的解码与可选 HS256 校验均在本地执行，不会泄露凭证。',
  },
  page: {
    title: 'JWT 解码器：在线解析与校验',
    description:
      '粘贴 JSON Web Token 即可查看 Header 与 Payload 结构，支持输入共享密钥校验 HS256 签名与过期时间，快速定位授权问题。',
    input: {
      title: 'JWT 内容',
      description: '粘贴或输入完整的 JWT。工具会自动解析。',
      placeholder: 'eyJhbGciOi...',
      buttons: {
        sample: '填充示例',
        clear: '清空',
      },
      statuses: {
        empty: '等待输入',
        invalid: '无效 JWT',
        valid: '结构有效',
      },
    },
    secret: {
      title: '签名密钥（可选）',
      placeholder: '输入用于签名的共享密钥',
      hintLabel: '示例密钥：',
      buttons: {
        useSample: '使用示例密钥',
        clear: '清空密钥',
      },
    },
    verificationBadges: {
      idle: '未校验',
      checking: '校验中…',
      valid: '签名有效',
      invalid: '签名无效',
      unsupported: '算法不支持',
      error: '校验失败',
    },
    verificationMessages: {
      checking: '正在使用 HS256 校验签名…',
      unsupported: '当前算法为 {alg}，暂仅支持 HS256 验证。',
      webCryptoUnavailable: '当前浏览器不支持 Web Crypto API，无法校验签名。',
      signatureValid: '签名校验通过。',
      signatureInvalid: '签名不匹配，请确认密钥是否正确。',
      signatureError: '签名验证失败。',
    },
    errors: {
      base64: 'Base64Url 解码失败',
      parts: 'JWT 必须包含 header、payload、signature 三部分。',
      parse: '解析失败，请检查 JWT 是否有效。',
    },
    result: {
      title: '解码结果',
      description: '查看 JWT Header 与 Payload 的结构化内容。',
      headerTitle: 'Decoded Header',
      payloadTitle: 'Decoded Payload',
      signatureTitle: 'Signature',
      placeholder: '输入 JWT 后展示解码内容。',
      algLabel: 'alg',
      unknownAlg: '未知',
      expLabel: 'exp',
    },
    section: {
      title: 'JWT 调试建议',
      description: '排查登录态或接口授权问题时，可结合密钥校验快速定位异常。',
      bullets: [
        '复制生产环境的 Token 时注意隐藏敏感字段，建议在安全的沙箱或本地环境中操作。',
        '若签名校验失败，优先确认算法（alg）与密钥是否匹配，再比对 exp、iat 等时间字段。',
        '可使用示例 Token 与密钥熟悉流程，再对接真实业务 Token，避免直接在生产环境测试。',
      ],
      hint: '本工具不会上传任何 Token 数据，适合在调试阶段验证自定义声明或快速定位授权异常。',
    },
  },
};

export default jwtDecoder;
