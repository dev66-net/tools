import type { ToolCopy } from '../../../i18n/types';

const randomNumberGenerator: ToolCopy = {
  meta: {
    label: 'Random Number Generator',
    pageTitle: 'Random Number Generator | Secure Integers Within a Range - tools.dev66.net',
    description:
      'Generate random integers with configurable ranges, batch counts and cryptographic strength—useful for raffles, test data or verification codes.',
    keywords: [
      'random number generator',
      'random integer',
      'crypto random',
      'random tool',
      'online random',
      'random sampling',
      'number range',
      'developer tools',
    ],
    fallbackLabel: 'Random number tool',
    executionNote: 'Prefers Web Crypto for randomness so no remote entropy is needed.',
  },
  page: {
    title: 'Random Number Generator: Secure Integer Ranges',
    description:
      'Generate random integers within any range, control batch size and prefer Web Crypto for cryptographic strength—ideal for raffles, test data and verification codes.',
    form: {
      minLabel: 'Minimum value',
      maxLabel: 'Maximum value',
      countLabel: 'Quantity',
      generate: 'Generate numbers',
      copy: 'Copy results',
      copied: 'Copied',
      preferCryptoLabel: 'Prefer cryptographically secure source',
      errors: {
        invalidBounds: 'Enter valid numeric bounds.',
        invalidCount: 'Quantity must be at least 1.',
        maxCount: 'You can generate at most {count} numbers at once.',
        invertedRange: 'Maximum value must be greater than or equal to the minimum.',
        generic: 'Failed to generate random numbers. Please retry.',
      },
    },
    results: {
      cryptoUsed: 'Generated with a cryptographically secure random source.',
      cryptoFallback: 'Web Crypto was unavailable; fell back to Math.random().',
      mathUsed: 'Generated with Math.random().',
    },
    guidance: {
      title: 'Usage Suggestions',
      description: 'Pick the right random source and count for each scenario to keep results fair and reproducible.',
      bullets: [
        'Enable the secure source for raffles, verification codes or any case where predictability matters.',
        'Copy the batch results into spreadsheets or scripts to prepare test datasets quickly.',
        'If you need repeatable sequences, record the parameters and control the seed in external scripts.',
      ],
      hint: 'Runs entirely in the browser—no hardware entropy is accessed, only Web Crypto or Math.random().',
    },
  },
};

export default randomNumberGenerator;
