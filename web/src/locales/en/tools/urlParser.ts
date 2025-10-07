import type { ToolCopy } from '../../../i18n/types';

const urlParser: ToolCopy = {
  meta: {
    label: 'URL Parser',
    pageTitle: 'URL Parser | Inspect URL Structure and Query Parameters - tools.dev66.net',
    description:
      'Break URLs into protocol, host, path and query parameters in real time. Includes quick encode/decode helpers for debugging redirects and signatures.',
    keywords: [
      'url parser',
      'analyze url',
      'query parameters',
      'url decode',
      'url encode',
      'redirect debug',
      'link debugging',
      'online tool',
    ],
    fallbackLabel: 'URL parser',
    executionNote: 'The URL is parsed within the browser so private links stay private.',
  },
  page: {
    title: 'URL Parser: Inspect Link Structure and Parameters',
    description:
      'Break down the protocol, host, path and query parameters in real time, plus built-in URL encode/decode tools for redirect and signature debugging.',
    form: {
      label: 'Enter a URL:',
      placeholder: 'https://example.com/path?foo=bar&baz=qux',
      emptyPrompt: 'Enter a URL to analyze',
      parseError: 'Could not parse the URL. Please check the format.',
      noteAutoScheme: 'Added https:// automatically to help with parsing.',
    },
    details: {
      title: 'URL details',
      labels: {
        scheme: 'Scheme',
        host: 'Host',
        hostname: 'Hostname',
        port: 'Port',
        pathname: 'Pathname',
        query: 'Query string',
        hash: 'Hash',
        username: 'Username',
        password: 'Password',
        origin: 'Origin',
      },
      empty: '(none)',
      maskedPassword: '••••••',
      defaultPath: '/',
    },
    query: {
      title: 'Query parameters',
      empty: 'No query parameters detected',
      unnamed: '(unnamed parameter)',
      emptyValue: '(empty string)',
      copy: 'Copy value',
      copied: 'Copied',
    },
    transform: {
      title: 'URL encode & decode',
    },
    encode: {
      title: 'URL Encode',
      sourceLabel: 'Original text',
      sourcePlaceholder: 'Any text will be URL-encoded automatically',
      resultLabel: 'Encoded result',
      resultPlaceholder: 'Encoded content will appear here',
      copy: 'Copy result',
      copied: 'Copied',
    },
    decode: {
      title: 'URL Decode',
      sourceLabel: 'URL-encoded text',
      sourcePlaceholder: 'Paste URL-encoded content to decode',
      resultLabel: 'Decoded result',
      resultPlaceholder: 'Decoded content will appear here',
      error: 'Decoding failed. Please ensure the input is valid URL encoding.',
      copy: 'Copy result',
      copied: 'Copied',
    },
    tips: {
      title: 'URL debugging tips',
      description: 'Use the parameter view and encode helpers to validate callback URLs, OAuth redirects or suspicious links in logs.',
      bullets: [
        'If the input lacks a scheme, https:// is added automatically—check the “Scheme” field to confirm the true protocol.',
        'Use the copy buttons beside each parameter to move values into Postman, cURL or signature tools quickly.',
        'When a value appears double-encoded, run it through the URL Decode helper repeatedly to inspect each layer.',
      ],
      hint: 'Mask tokens or signed parameters when sharing screenshots to avoid leaking sensitive information.',
    },
  },
};

export default urlParser;
