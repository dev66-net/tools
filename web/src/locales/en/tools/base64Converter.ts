import type { ToolCopy } from '../../../i18n/types';

const base64Converter: ToolCopy = {
  meta: {
    label: 'Base64 Converter',
    pageTitle: 'Base64 Converter | Encode and Decode Standard or URL Safe Base64 - tools.dev66.net',
    description:
      'Work with standard or URL-safe Base64, auto-detect padding, and inspect bytes in hex. Great for investigating API payloads and attachments.',
    keywords: [
      'base64 converter',
      'base64 encode',
      'base64 decode',
      'url safe base64',
      'base64 tool',
      'online base64',
      'base64 validator',
      'developer tools',
    ],
    fallbackLabel: 'Base64 converter',
    executionNote: 'Conversion uses built-in browser APIs so private blobs stay local.',
  },
  page: {
    title: 'Base64 Converter: Encode and Decode Online',
    description:
      'Convert text to Base64 or decode existing strings, detect URL-safe variants, and inspect the bytes in hex without leaving the browser.',
    encode: {
      title: 'Base64 encode',
      description: 'Enter text and it will be encoded with UTF-8 before converting to Base64.',
      inputLabel: 'Source text',
      placeholder: 'Enter text to encode',
      variantLabel: 'Output variant',
      variants: {
        standard: { label: 'Standard Base64', hint: 'Uses + / characters and includes padding = signs' },
        'standard-no-pad': { label: 'Standard (no padding)', hint: 'Uses + / characters without trailing =' },
        url: { label: 'URL Safe', hint: 'Uses - _ characters and includes padding =' },
        'url-no-pad': { label: 'URL Safe (no padding)', hint: 'Uses - _ characters without trailing =' },
      },
      byteLengthLabel: 'Bytes: {count}',
      resultLabel: 'Encoded result',
      resultPlaceholder: 'Encoded content appears here',
      buttons: {
        copy: 'Copy encoded',
        copied: 'Copied',
        clearInput: 'Clear input',
      },
    },
    decode: {
      title: 'Base64 decode',
      description: 'Detects standard or URL-safe variants automatically and adds missing padding when required.',
      inputLabel: 'Base64 string',
      placeholder: 'Paste Base64 text here',
      errors: {
        invalidCharacter: 'Invalid characters detected. Please provide a valid Base64 string.',
        invalidLength: 'Length is not valid Base64 and cannot be fixed automatically.',
        decodeFailed: 'Failed to decode this Base64 string. Please verify the content.',
      },
      status: {
        waiting: 'Waiting for input',
        identified: 'Detected: {variant}',
        addedPadding: '(Automatically added {count} “=” characters)',
      },
      resultLabel: 'Decoded text',
      resultPlaceholder: 'Decoded plain text appears here',
      hexLabel: 'Hex view:',
      buttons: {
        copy: 'Copy text',
        copied: 'Copied',
        clearInput: 'Clear input',
      },
      variantLabels: {
        standard: 'Standard Base64',
        'standard-no-pad': 'Standard Base64 (auto padding)',
        url: 'URL Safe Base64',
        'url-no-pad': 'URL Safe Base64 (auto padding)',
      },
    },
    section: {
      title: 'Base64 tips',
      description: 'Use padding hints and hex output to understand payloads quickly.',
      bullets: [
        'Paste API responses to inspect Base64 fields and confirm file types via the hex preview.',
        'URL-safe variants are common in JWTs and query strings—the tool normalises characters for you.',
        'If decoding fails due to missing padding, check the hint to see how many “=” characters were required.',
      ],
      hint: 'All conversions run locally, so you can handle tokens or attachments without uploading them.',
    },
  },
};

export default base64Converter;
