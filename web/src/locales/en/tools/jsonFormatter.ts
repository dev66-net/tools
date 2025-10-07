import type { ToolCopy } from '../../../i18n/types';

const jsonFormatter: ToolCopy = {
  meta: {
    label: 'JSON Formatter',
    pageTitle: 'JSON Formatter | Pretty Print, Minify and Validate JSON - tools.dev66.net',
    description:
      'Beautify, minify and validate JSON with theme switching, examples and clipboard helpers. Perfect for debugging API payloads and config files.',
    keywords: [
      'json formatter',
      'json validator',
      'json beautify',
      'json minify',
      'json parser',
      'api debugging',
      'online json tool',
      'developer tools',
    ],
    fallbackLabel: 'JSON formatter',
    executionNote: 'Formatting runs locally so request payloads never leave your browser.',
  },
  page: {
    title: 'JSON Formatter: Pretty Print and Minify Online',
    description:
      'Format or minify JSON instantly, detect syntax issues, and switch between light and dark themes for API debugging and log analysis.',
    inputPanel: {
      title: 'Source JSON',
      description: 'Paste your JSON and choose to pretty-print or minify the output.',
      buttons: {
        pretty: 'Pretty print',
        compact: 'Minify',
        sample: 'Load sample',
        clear: 'Clear',
      },
    },
    outputPanel: {
      title: 'Formatted output',
      description: 'Once parsed successfully, the result appears here and can be copied.',
      placeholder: 'Formatted JSON will appear here.',
      buttons: {
        copy: 'Copy result',
        copied: 'Copied',
        clear: 'Clear output',
      },
    },
    statuses: {
      empty: 'Empty input',
      parseError: 'Parse error',
      parseSuccess: 'Parse success',
      waiting: 'Awaiting input',
      formatted: 'Pretty printed',
      minified: 'Minified',
    },
    errors: {
      parseFallback: 'Failed to parse JSON. Please check the structure.',
      copyFallback: 'Unable to copy to clipboard. Please copy manually.',
    },
    tips: {
      title: 'JSON debugging tips',
      description: 'Use formatting, compression and status hints to prepare API samples quickly.',
      bullets: [
        'Use “Load sample” to demonstrate the formatter flow when onboarding teammates.',
        'Switch to “Minify” to generate compact JSON for query strings or to save bandwidth.',
        'When parsing fails, inspect the status badge and error message to spot missing commas or quotes.',
      ],
      hint: 'Everything runs locally in your browser, so you can safely format payloads that contain sensitive fields.',
    },
  },
};

export default jsonFormatter;
