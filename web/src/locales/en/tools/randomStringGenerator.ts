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
  page: {},
};

export default randomStringGenerator;
