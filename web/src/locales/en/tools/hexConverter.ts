import type { ToolCopy } from '../../../i18n/types';

const hexConverter: ToolCopy = {
  meta: {
    label: 'Hex Converter',
    pageTitle: 'Hex Converter | Convert Between Text and Hexadecimal - tools.dev66.net',
    description:
      'Convert text to and from hexadecimal with delimiter, casing and byte-length options—ideal for inspecting binaries and debugging network payloads.',
    keywords: [
      'hex converter',
      'hex encode',
      'hex decode',
      'hex tool',
      'hex viewer',
      'hex to text',
      'byte inspector',
      'developer tools',
    ],
    fallbackLabel: 'Hex converter',
    executionNote: 'Text and hex conversions run locally so logs and packets stay private.',
  },
  page: {
    title: 'Hex Converter: Convert Between Text and Hex',
    description:
      'Convert text to and from hexadecimal with casing, grouping and byte-count controls—ideal for inspecting binary payloads and debugging network traces.',
    encode: {
      title: 'Text to Hex',
      description: 'Input is encoded as UTF-8 bytes and rendered as hexadecimal.',
      inputLabel: 'Source text',
      placeholder: 'Paste the text you want to convert',
      uppercaseLabel: 'Use uppercase letters',
      groupingLabel: 'Grouping',
      groupingOptions: {
        none: 'No separator (compact)',
        byte: 'Space every byte',
        word: 'Space every two bytes',
      },
      byteCountLabel: 'Bytes: {count}',
      resultLabel: 'Hex output',
      resultPlaceholder: 'Hex-encoded content appears here',
      buttons: {
        copy: 'Copy hex',
        copied: 'Copied',
        clear: 'Clear input',
      },
    },
    decode: {
      title: 'Hex to Text',
      description: 'Accepts hex strings with spaces, newlines or 0x prefixes and normalises them before decoding.',
      inputLabel: 'Hex string',
      placeholder: 'e.g. 48656c6c6f or 48 65 6c 6c 6f',
      errors: {
        invalidCharacters: 'No valid hexadecimal characters detected.',
        decodeFailed: 'Could not decode this hex string. Please verify the content.',
      },
      byteCountLabel: 'Bytes: {count}',
      byteCountEmpty: '—',
      resultLabel: 'Decoded text',
      resultPlaceholder: 'Decoded text appears here',
      normalizedLabel: 'Normalized hex:',
      buttons: {
        copy: 'Copy text',
        copied: 'Copied',
        clear: 'Clear input',
      },
    },
    section: {
      title: 'Troubleshoot Hex Payloads',
      description: 'Use the normalised output and byte statistics to identify encoding formats or truncation issues quickly.',
      bullets: [
        'Check the “Bytes” value to confirm payload sizes when comparing uploads or API parameters.',
        'Switch grouping to produce formats like 0xAB or ABCD that can be pasted into source code or specs.',
        'If decoding fails, remove separators or verify the length is even before retrying.',
      ],
      hint: 'Runs entirely in your browser so sensitive logs and packets stay offline.',
    },
  },
};

export default hexConverter;
