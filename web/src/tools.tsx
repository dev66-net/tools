import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

export type ToolId =
  | 'qrGenerator'
  | 'qrScanner'
  | 'urlParser'
  | 'jsonFormatter'
  | 'markdownRenderer'
  | 'jwtDecoder'
  | 'base64Converter'
  | 'hexConverter'
  | 'escapeDecoder'
  | 'hashGenerator'
  | 'uuidGenerator'
  | 'randomNumberGenerator'
  | 'randomStringGenerator'
  | 'blockPuzzleSolver'
  | 'zipTool'
  | 'rubiksCubeSolver'
  | 'subtitleFormatter';

export type ToolDefinition = {
  id: ToolId;
  slug: string;
  executionMode: 'browser' | 'remote';
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

const loadBlockPuzzleSolver = () => import('./BlockPuzzleSolver.tsx');
const BlockPuzzleSolver = lazy(loadBlockPuzzleSolver);

const loadZipTool = () => import('./ZipTool.tsx');
const ZipTool = lazy(loadZipTool);

const loadRubiksCubeSolver = () => import('./RubiksCubeSolver.tsx');
const RubiksCubeSolver = lazy(loadRubiksCubeSolver);

const loadSubtitleFormatter = () => import('./SubtitleFormatter.tsx');
const SubtitleFormatter = lazy(loadSubtitleFormatter);

export const tools: ToolDefinition[] = [
  {
    id: 'qrGenerator',
    slug: 'qr-generator',
    executionMode: 'browser',
    Component: QRGenerator,
    preload: loadQRGenerator,
  },
  {
    id: 'qrScanner',
    slug: 'qr-scanner',
    executionMode: 'browser',
    Component: QRScanner,
    preload: loadQRScanner,
  },
  {
    id: 'urlParser',
    slug: 'url-parser',
    executionMode: 'browser',
    Component: UrlParse,
    preload: loadUrlParse,
  },
  {
    id: 'jsonFormatter',
    slug: 'json-formatter',
    executionMode: 'browser',
    Component: JSONFormatter,
    preload: loadJSONFormatter,
  },
  {
    id: 'markdownRenderer',
    slug: 'markdown-renderer',
    executionMode: 'browser',
    Component: MarkdownRenderer,
    preload: loadMarkdownRenderer,
  },
  {
    id: 'jwtDecoder',
    slug: 'jwt-decoder',
    executionMode: 'browser',
    Component: JWTDecoder,
    preload: loadJWTDecoder,
  },
  {
    id: 'base64Converter',
    slug: 'base64-converter',
    executionMode: 'browser',
    Component: Base64Converter,
    preload: loadBase64Converter,
  },
  {
    id: 'hexConverter',
    slug: 'hex-converter',
    executionMode: 'browser',
    Component: HexConverter,
    preload: loadHexConverter,
  },
  {
    id: 'escapeDecoder',
    slug: 'escape-decoder',
    executionMode: 'browser',
    Component: EscapeDecoder,
    preload: loadEscapeDecoder,
  },
  {
    id: 'hashGenerator',
    slug: 'hash-calculator',
    executionMode: 'browser',
    Component: HashGenerator,
    preload: loadHashGenerator,
  },
  {
    id: 'uuidGenerator',
    slug: 'uuid-generator',
    executionMode: 'browser',
    Component: UUIDGenerator,
    preload: loadUUIDGenerator,
  },
  {
    id: 'randomNumberGenerator',
    slug: 'random-number-generator',
    executionMode: 'browser',
    Component: RandomNumberGenerator,
    preload: loadRandomNumberGenerator,
  },
  {
    id: 'randomStringGenerator',
    slug: 'random-string-generator',
    executionMode: 'browser',
    Component: RandomStringGenerator,
    preload: loadRandomStringGenerator,
  },
  {
    id: 'blockPuzzleSolver',
    slug: 'block-puzzle-solver',
    executionMode: 'browser',
    Component: BlockPuzzleSolver,
    preload: loadBlockPuzzleSolver,
  },
  {
    id: 'zipTool',
    slug: 'zip-online',
    executionMode: 'browser',
    Component: ZipTool,
    preload: loadZipTool,
  },
  {
    id: 'subtitleFormatter',
    slug: 'subtitle-formatter',
    executionMode: 'browser',
    Component: SubtitleFormatter,
    preload: loadSubtitleFormatter,
  },
  // {
  //   id: 'rubiksCubeSolver',
  //   slug: 'rubiks-cube-solver',
  //   executionMode: 'browser',
  //   Component: RubiksCubeSolver,
  //   preload: loadRubiksCubeSolver,
  // },
];

export default tools;
