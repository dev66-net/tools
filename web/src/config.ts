// Repository and source code configuration
export const REPO_CONFIG = {
  url: 'https://github.com/dev66-net/tools',
  branch: 'main',
} as const;

// Tool ID to source file mapping
export const TOOL_SOURCE_FILES: Record<string, string> = {
  'qr-generator': 'web/src/QRGenerator.tsx',
  'qr-scanner': 'web/src/QRScanner.tsx',
  'url-parser': 'web/src/UrlParse.tsx',
  'json-formatter': 'web/src/JSONFormatter.tsx',
  'markdown-renderer': 'web/src/MarkdownRenderer.tsx',
  'jwt-decoder': 'web/src/JWTDecoder.tsx',
  'base64-converter': 'web/src/Base64Converter.tsx',
  'hex-converter': 'web/src/HexConverter.tsx',
  'escape-decoder': 'web/src/EscapeDecoder.tsx',
  'hash-calculator': 'web/src/HashGenerator.tsx',
  'uuid-generator': 'web/src/UUIDGenerator.tsx',
  'random-number-generator': 'web/src/RandomNumberGenerator.tsx',
  'random-string-generator': 'web/src/RandomStringGenerator.tsx',
  'block-puzzle-solver': 'web/src/BlockPuzzleSolver.tsx',
  'zip-online': 'web/src/ZipTool.tsx',
} as const;

/**
 * Get the GitHub source URL for a tool
 * @param toolId - The tool identifier
 * @returns Full GitHub URL to the source file, or null if not found
 */
export function getToolSourceUrl(toolId: string): string | null {
  const sourceFile = TOOL_SOURCE_FILES[toolId];
  if (!sourceFile) {
    return null;
  }
  return `${REPO_CONFIG.url}/blob/${REPO_CONFIG.branch}/${sourceFile}`;
}
