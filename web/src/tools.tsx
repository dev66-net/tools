import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

export type ToolDefinition = {
  path: string;
  label: string;
  pageTitle: string;
  description: string;
  keywords: string[];
  fallbackLabel: string;
  executionMode: 'browser' | 'remote';
  executionNote: string;
  Component: LazyExoticComponent<ComponentType>;
  preload: () => Promise<{ default: ComponentType }>;
};

const loadQRGenerator = () => import('./QRGenerator.tsx');
const QRGenerator = lazy(loadQRGenerator);

const loadQRScanner = () => import('./QRScanner.tsx');
const QRScanner = lazy(loadQRScanner);

const loadUrlParse = () => import('./UrlParse.tsx');
const UrlParse = lazy(loadUrlParse);

const loadJSONFormatter = () => import('./JSONFormatter.tsx');
const JSONFormatter = lazy(loadJSONFormatter);

const loadMarkdownRenderer = () => import('./MarkdownRenderer.tsx');
const MarkdownRenderer = lazy(loadMarkdownRenderer);

const loadJWTDecoder = () => import('./JWTDecoder.tsx');
const JWTDecoder = lazy(loadJWTDecoder);

const loadBase64Converter = () => import('./Base64Converter.tsx');
const Base64Converter = lazy(loadBase64Converter);

const loadHexConverter = () => import('./HexConverter.tsx');
const HexConverter = lazy(loadHexConverter);

const loadEscapeDecoder = () => import('./EscapeDecoder.tsx');
const EscapeDecoder = lazy(loadEscapeDecoder);

const loadHashGenerator = () => import('./HashGenerator.tsx');
const HashGenerator = lazy(loadHashGenerator);

const loadUUIDGenerator = () => import('./UUIDGenerator.tsx');
const UUIDGenerator = lazy(loadUUIDGenerator);

const loadRandomNumberGenerator = () => import('./RandomNumberGenerator.tsx');
const RandomNumberGenerator = lazy(loadRandomNumberGenerator);

const loadRandomStringGenerator = () => import('./RandomStringGenerator.tsx');
const RandomStringGenerator = lazy(loadRandomStringGenerator);

export const tools: ToolDefinition[] = [
  {
    path: 'qr-generator.html',
    label: '二维码生成器',
    pageTitle: '二维码生成器｜在线创建高分辨率二维码 - tools.dev66.net',
    description:
      '在线二维码生成器支持链接、文本、名片和 Wi-Fi 等内容，一键生成高清二维码并可下载 PNG 图片，适合海报、分享与营销场景。',
    keywords: [
      '二维码生成器',
      '在线二维码',
      '二维码制作',
      'QR code generator',
      '生成二维码图片',
      'Wi-Fi 二维码',
      '名片二维码',
      '营销二维码',
    ],
    fallbackLabel: '二维码生成工具',
    executionMode: 'browser',
    executionNote: '浏览器本地计算，输入内容仅保留在设备中，可用于处理敏感链接。',
    Component: QRGenerator,
    preload: loadQRGenerator,
  },
  {
    path: 'qr-scanner.html',
    label: '二维码识别器',
    pageTitle: '二维码识别器｜上传图片解析 QR Code - tools.dev66.net',
    description:
      '二维码识别器支持拖拽、粘贴或上传图片，自动识别二维码内容，支持旋转校正和模糊补偿，适合校验二维码和提取链接。',
    keywords: [
      '二维码识别',
      '二维码解析',
      'QR code scanner',
      '二维码提取',
      '上传二维码',
      '在线扫码',
      '二维码解码',
      '二维码工具',
    ],
    fallbackLabel: '二维码识别工具',
    executionMode: 'browser',
    executionNote: '浏览器本地解码图片像素，不会上传图像或识别结果。',
    Component: QRScanner,
    preload: loadQRScanner,
  },
  {
    path: 'url-parser.html',
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
    executionMode: 'browser',
    executionNote: '浏览器本地解析 URL 结构，安全分析私有或测试链接。',
    Component: UrlParse,
    preload: loadUrlParse,
  },
  {
    path: 'json-formatter.html',
    label: 'JSON 格式化',
    pageTitle: 'JSON 格式化器｜在线格式化与压缩 JSON - tools.dev66.net',
    description:
      'JSON 格式化器支持美化、压缩、语法校验与主题切换，并提供示例与复制功能，适合调试 API 返回与配置文件。',
    keywords: [
      'JSON 格式化',
      'JSON 校验',
      'JSON 压缩',
      'JSON beautify',
      'JSON minify',
      'JSON parser',
      'API 调试',
      '在线工具',
    ],
    fallbackLabel: 'JSON 格式化工具',
    executionMode: 'browser',
    executionNote: '浏览器本地解析与格式化 JSON，不会发送数据至网络。',
    Component: JSONFormatter,
    preload: loadJSONFormatter,
  },
  {
    path: 'markdown-renderer.html',
    label: 'Markdown 渲染器',
    pageTitle: 'Markdown 渲染器｜在线预览并导出 Markdown - tools.dev66.net',
    description:
      'Markdown 渲染器支持 GitHub 风格语法、实时双栏预览、主题切换与打印导出，适合撰写文档、README 与会议纪要。',
    keywords: [
      'Markdown 渲染',
      'Markdown 预览',
      '在线 Markdown',
      'GitHub Markdown',
      'Markdown 导出',
      'Markdown 编辑',
      'Markdown 打印',
      'Markdown 工具',
    ],
    fallbackLabel: 'Markdown 渲染工具',
    executionMode: 'browser',
    executionNote: 'Markdown 在浏览器本地渲染，可离线预览及打印敏感文档。',
    Component: MarkdownRenderer,
    preload: loadMarkdownRenderer,
  },
  {
    path: 'jwt-decoder.html',
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
    executionMode: 'browser',
    executionNote: 'JWT 的解码与可选 HS256 校验均在本地执行，不会泄露凭证。',
    Component: JWTDecoder,
    preload: loadJWTDecoder,
  },
  {
    path: 'base64-converter.html',
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
    executionMode: 'browser',
    executionNote: 'Base64 转换使用浏览器内建 API，适合处理私有文本与二进制片段。',
    Component: Base64Converter,
    preload: loadBase64Converter,
  },
  {
    path: 'hex-converter.html',
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
    executionMode: 'browser',
    executionNote: '十六进制与文本转换在浏览器端完成，可放心分析日志与报文。',
    Component: HexConverter,
    preload: loadHexConverter,
  },
  {
    path: 'escape-decoder.html',
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
    executionMode: 'browser',
    executionNote: '字符串解码在浏览器进行，可逐层剥离转义字符，无需上传。',
    Component: EscapeDecoder,
    preload: loadEscapeDecoder,
  },
  {
    path: 'hash-calculator.html',
    label: '哈希计算器',
    pageTitle: '哈希计算器｜在线生成 MD5 与 SHA 摘要 - tools.dev66.net',
    description:
      '哈希计算器支持 MD5、SHA-1、SHA-256 等常见算法，自动统计大小写形式并可导出 Base64，用于校验文件与 API 签名。',
    keywords: [
      '哈希计算',
      'MD5 在线',
      'SHA256 在线',
      '哈希摘要',
      '散列函数',
      '哈希校验',
      '摘要生成',
      '哈希工具',
    ],
    fallbackLabel: '哈希工具',
    executionMode: 'browser',
    executionNote: '使用 Web Crypto API 在本地生成摘要，适合校验敏感文件或报文。',
    Component: HashGenerator,
    preload: loadHashGenerator,
  },
  {
    path: 'uuid-generator.html',
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
    executionMode: 'browser',
    executionNote: 'UUID 算法在浏览器端实现，可离线批量生成标识符。',
    Component: UUIDGenerator,
    preload: loadUUIDGenerator,
  },
  {
    path: 'random-number-generator.html',
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
    executionMode: 'browser',
    executionNote: '优先使用浏览器内的 Web Crypto 生成随机数，不依赖外部服务。',
    Component: RandomNumberGenerator,
    preload: loadRandomNumberGenerator,
  },
  {
    path: 'random-string-generator.html',
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
    executionMode: 'browser',
    executionNote: '字符串在浏览器本地组合，结合 Web Crypto 提供安全随机性。',
    Component: RandomStringGenerator,
    preload: loadRandomStringGenerator,
  },
];

export default tools;
