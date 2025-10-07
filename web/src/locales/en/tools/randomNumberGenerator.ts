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
  page: {},
};

export default randomNumberGenerator;
