import type { ToolCopy } from '../../../i18n/types';

const randomStringGenerator: ToolCopy = {
  meta: {
    label: 'Random String Generator',
    pageTitle: 'Random String Generator | Custom Character Sets for Passwords - tools.dev66.net',
    description:
      'Combine character sets, control length and batch output with secure randomness to craft passwords, tokens and test identifiers.',
    keywords: [
      'random string generator',
      'password generator',
      'random text',
      'random token',
      'random id',
      'string generator',
      'batch generator',
      'developer tools',
    ],
    fallbackLabel: 'Random string tool',
    executionNote: 'Strings are composed locally with Web Crypto randomness for security.',
  },
  page: {
    title: 'Random String Generator: Custom Character Sets',
    description:
      'Mix lowercase, uppercase, digits, symbols or your own characters to generate batches of random strings—perfect for passwords, tokens and sample data.',
    form: {
      lengthLabel: 'Length',
      countLabel: 'Quantity',
      includeLowercase: 'Lowercase letters',
      includeUppercase: 'Uppercase letters',
      includeDigits: 'Digits',
      includeSymbols: 'Symbols',
      customLabel: 'Custom characters',
      customPlaceholder: 'Optional extras, e.g. Chinese characters or prefixes',
      preferCryptoLabel: 'Prefer cryptographically secure source',
      buttons: {
        generate: 'Generate strings',
        copy: 'Copy all',
        copied: 'Copied',
      },
      errors: {
        invalidLength: 'Length must be a positive integer.',
        maxLength: 'Maximum length is {count}.',
        invalidCount: 'Quantity must be a positive integer.',
        maxCount: 'You can generate at most {count} strings per batch.',
        emptyPool: 'Select at least one character set or enter custom characters.',
        generic: 'Failed to generate random strings. Please retry.',
      },
    },
    results: {
      cryptoUsed: 'Generated with a cryptographically secure random source.',
      cryptoFallback: 'Web Crypto was unavailable; fell back to Math.random().',
      mathUsed: 'Generated with Math.random().',
    },
    guidance: {
      title: 'Build Reliable Random Strings',
      description: 'Tune the character set and length for each use case so strings are strong yet practical.',
      bullets: [
        'For passwords, include upper, lower, digits and symbols while enabling the secure source.',
        'For test data, add custom characters such as Chinese or domain prefixes to mimic real input.',
        'Copy the batch into scripts or CSV files to prepare datasets in seconds.',
      ],
      hint: 'Everything runs locally in your browser—ideal for internal networks or offline environments.',
    },
  },
};

export default randomStringGenerator;
