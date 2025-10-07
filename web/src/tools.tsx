import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

export type ToolDefinition = {
  path: string;
  label: string;
  description: string;
  keywords: string[];
  fallbackLabel: string;
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
    path: 'generator',
    label: '二维码生成',
    description: '将文本或链接转为二维码图片',
    keywords: ['erweima', 'shengcheng', 'qr', 'generator', '生成二维码', '二维码工具'],
    fallbackLabel: '二维码生成工具',
    Component: QRGenerator,
    preload: loadQRGenerator,
  },
  {
    path: 'scanner',
    label: '二维码识别',
    description: '使用摄像头或截图识别二维码内容',
    keywords: ['erweima', 'shibie', 'scanner', 'decode', '解析二维码', '识别器'],
    fallbackLabel: '二维码识别工具',
    Component: QRScanner,
    preload: loadQRScanner,
  },
  {
    path: 'url-parser',
    label: 'URL 解析',
    description: '解析 URL 结构与查询参数',
    keywords: ['url', 'jiexi', 'parse', '参数', '链接分析', 'url工具'],
    fallbackLabel: 'URL 解析器',
    Component: UrlParse,
    preload: loadUrlParse,
  },
  {
    path: 'json-formatter',
    label: 'JSON 格式化',
    description: '格式化、压缩 JSON 并校验语法',
    keywords: ['json', 'geshihua', 'formatter', 'beautify', '格式化器', 'json工具'],
    fallbackLabel: 'JSON 格式化工具',
    Component: JSONFormatter,
    preload: loadJSONFormatter,
  },
  {
    path: 'markdown-renderer',
    label: 'Markdown 渲染',
    description: '输入 Markdown 并查看实时预览，支持 GitHub 扩展与打印输出',
    keywords: ['markdown', 'md', 'preview', 'yulan', '打印', 'gfm'],
    fallbackLabel: 'Markdown 渲染工具',
    Component: MarkdownRenderer,
    preload: loadMarkdownRenderer,
  },
  {
    path: 'jwt-decoder',
    label: 'JWT 解析',
    description: '解析与校验 JWT Token 内容',
    keywords: ['jwt', 'token', 'jiexi', 'decode', '授权', '身份验证'],
    fallbackLabel: 'JWT 解析器',
    Component: JWTDecoder,
    preload: loadJWTDecoder,
  },
  {
    path: 'base64',
    label: 'Base64 工具',
    description: '支持标准与 URL Safe Base64 的编码、解码与类型识别',
    keywords: ['base64', 'encode', 'decode', 'url-safe', '编码', '解码'],
    fallbackLabel: 'Base64 编解码',
    Component: Base64Converter,
    preload: loadBase64Converter,
  },
  {
    path: 'hex',
    label: 'Hex 编码',
    description: '文本与十六进制之间双向转换，支持大小写与分隔选项',
    keywords: ['hex', '十六进制', '编码', '解码', 'bytes'],
    fallbackLabel: 'Hex 转换器',
    Component: HexConverter,
    preload: loadHexConverter,
  },
  {
    path: 'escape',
    label: '转义解码',
    description: '解析 JSON / JavaScript / Python / Shell 的转义字符串',
    keywords: ['escape', '转义', 'decode', '字符串', 'shell', 'python', 'javascript'],
    fallbackLabel: '转义解码器',
    Component: EscapeDecoder,
    preload: loadEscapeDecoder,
  },
  {
    path: 'hash',
    label: '哈希计算',
    description: '计算 MD5、SHA-1、SHA-256 等常见摘要',
    keywords: ['hash', 'md5', 'sha1', 'sha256', '摘要', '散列'],
    fallbackLabel: '哈希工具',
    Component: HashGenerator,
    preload: loadHashGenerator,
  },
  {
    path: 'uuid',
    label: 'UUID 生成',
    description: '生成 UUID v1/v4/v5，支持自定义命名空间',
    keywords: ['uuid', 'v4', 'v5', 'v1', 'random', '名称'],
    fallbackLabel: 'UUID 工具',
    Component: UUIDGenerator,
    preload: loadUUIDGenerator,
  },
  {
    path: 'random-number',
    label: '随机数生成',
    description: '生成指定范围的随机整数，可选择加密安全随机源',
    keywords: ['random', 'number', '随机数', 'crypto', '整数'],
    fallbackLabel: '随机数工具',
    Component: RandomNumberGenerator,
    preload: loadRandomNumberGenerator,
  },
  {
    path: 'random-string',
    label: '随机字符串',
    description: '组合字符集生成随机字符串，支持批量输出',
    keywords: ['random', 'string', '密码', '随机字符串', 'crypto'],
    fallbackLabel: '随机字符串工具',
    Component: RandomStringGenerator,
    preload: loadRandomStringGenerator,
  },
];

export default tools;
