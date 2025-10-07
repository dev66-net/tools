import type { ToolCopy } from '../../../i18n/types';

const jwtDecoder: ToolCopy = {
  meta: {
    label: 'JWT Decoder',
    pageTitle: 'JWT Decoder | Inspect and Validate JSON Web Tokens - tools.dev66.net',
    description:
      'Decode JWT headers, payloads and signatures instantly. Optional HS256 verification and expiry highlighting help troubleshoot auth issues.',
    keywords: [
      'jwt decoder',
      'jwt parser',
      'json web token',
      'hs256 verify',
      'token debugging',
      'authentication',
      'oauth debugging',
      'developer tools',
    ],
    fallbackLabel: 'JWT decoder',
    executionNote: 'Tokens are decoded locally and optional HS256 checks never leave the browser.',
  },
  page: {
    title: 'JWT Decoder: Inspect and Verify Tokens',
    description:
      'Paste a JSON Web Token to decode its header and payload, highlight key claims, and optionally verify HS256 signatures with a shared secret.',
    input: {
      title: 'JWT input',
      description: 'Paste or type the full JWT. The tool decodes it automatically.',
      placeholder: 'eyJhbGciOi...',
      buttons: {
        sample: 'Load sample token',
        clear: 'Clear',
      },
      statuses: {
        empty: 'Waiting for input',
        invalid: 'Invalid JWT',
        valid: 'Structure valid',
      },
    },
    secret: {
      title: 'Signature secret (optional)',
      placeholder: 'Enter the shared secret used for signing',
      hintLabel: 'Sample secret:',
      buttons: {
        useSample: 'Use sample secret',
        clear: 'Clear secret',
      },
    },
    verificationBadges: {
      idle: 'Not verified',
      checking: 'Verifying…',
      valid: 'Signature valid',
      invalid: 'Signature invalid',
      unsupported: 'Algorithm unsupported',
      error: 'Verification failed',
    },
    verificationMessages: {
      checking: 'Verifying signature with HS256…',
      unsupported: 'Algorithm is {alg}, currently only HS256 verification is supported.',
      webCryptoUnavailable: 'Web Crypto API is not available in this browser, so the signature cannot be verified.',
      signatureValid: 'Signature verified successfully.',
      signatureInvalid: 'Signature mismatch. Please confirm the shared secret.',
      signatureError: 'Signature verification failed.',
    },
    errors: {
      base64: 'Failed to decode Base64Url content.',
      parts: 'A JWT must contain header, payload and signature separated by dots.',
      parse: 'Failed to parse JWT. Please ensure it is valid.',
    },
    result: {
      title: 'Decoded output',
      description: 'Inspect the structured header and payload of the JWT.',
      headerTitle: 'Decoded header',
      payloadTitle: 'Decoded payload',
      signatureTitle: 'Signature',
      placeholder: 'Provide a JWT to view decoded content.',
      algLabel: 'alg',
      unknownAlg: 'unknown',
      expLabel: 'exp',
    },
    section: {
      title: 'JWT debugging tips',
      description: 'Use signature checks and claim introspection to troubleshoot authentication issues faster.',
      bullets: [
        'Redact sensitive fields before sharing tokens; test inside a safe local environment whenever possible.',
        'If signature verification fails, confirm the algorithm and secret first, then review exp/iat timestamps.',
        'Practice with the sample token and secret before working with production tokens to avoid live incidents.',
      ],
      hint: 'Tokens and secrets stay on this device; nothing is uploaded, making it safe for sensitive credentials.',
    },
  },
};

export default jwtDecoder;
