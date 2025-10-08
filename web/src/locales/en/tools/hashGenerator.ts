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
  page: {
    title: 'Hash Calculator: Generate MD5 and SHA Digests',
    description:
      'Compute MD5, SHA-1 and SHA-256 digests entirely in the browser. Copy hex or Base64 output to verify downloads, API payloads or signatures.',
    input: {
      label: 'Text to hash',
      placeholder: 'Paste or type the content that needs a digest',
      byteLength: 'UTF-8 bytes: {count}',
      clear: 'Clear input',
    },
    results: {
      title: 'Digest results',
      emptyHint: 'Enter text above to generate hashes automatically.',
      columns: {
        algorithm: 'Algorithm',
        hex: 'Hex',
        base64: 'Base64',
      },
      buttons: {
        copy: 'Copy',
        copied: 'Copied',
      },
      status: {
        pending: 'Calculating…',
      },
      errors: {
        unsupported: 'Web Crypto Subtle API is not available in this environment.',
        generic: 'Digest calculation failed. Please try again.',
      },
    },
    section: {
      title: 'Hash Verification Tips',
      description: 'Compare the hex or Base64 digest to confirm whether files or payloads were modified.',
      bullets: [
        'Use the hex digest to match download checksums or API signatures and confirm integrity.',
        'Base64 output is convenient for HTTP headers or database fields—copy it directly into your tooling.',
        'Large inputs may take a moment to process; wait until the button shows “Copied” before moving on.',
      ],
      hint: 'All hashing happens locally so secrets and configuration never leave your browser.',
    },
  },
};

export default hashGenerator;
