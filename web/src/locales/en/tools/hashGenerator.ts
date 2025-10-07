import type { ToolCopy } from '../../../i18n/types';

const hashGenerator: ToolCopy = {
  meta: {
    label: 'Hash Calculator',
    pageTitle: 'Hash Calculator | Generate MD5 and SHA Digests Online - tools.dev66.net',
    description:
      'Compute MD5, SHA-1, SHA-256 and more. View uppercase, lowercase and Base64 outputs for file checksums and API signatures.',
    keywords: [
      'hash calculator',
      'md5 online',
      'sha256 online',
      'hash digest',
      'hash verification',
      'checksum generator',
      'hash tool',
      'developer tools',
    ],
    fallbackLabel: 'Hash calculator',
    executionNote: 'Uses the Web Crypto API locally so sensitive files never upload.',
  },
  page: {},
};

export default hashGenerator;
