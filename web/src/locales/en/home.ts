import type { HomeCopy } from '../../i18n/types';

const home: HomeCopy = {
  heroTitle: 'tools.dev66.net Developer Toolkit',
  heroDescription:
    'A collection of everyday utilities for QR codes, encoders, formatters and validators. Everything executes locally in the browser so you can handle development, testing and ops tasks with confidence.',
  sections: [
    {
      title: 'Why use this site',
      description: 'Lightweight utilities built for engineers with a focus on privacy, safety and speed.',
      bullets: [
        'Comprehensive coverage for QR generation/scan, JSON/URL/codecs, hashing and random data generation scenarios.',
        'No login or installation required—open the page and start working on a new machine or temporary environment.',
        'All logic runs locally in the browser so your inputs are never uploaded, ideal for sensitive payloads.',
        'Consistent UI patterns and keyboard hints reduce the friction of switching between different sites.',
      ],
    },
    {
      title: 'Usage tips',
      description: 'Bookmark frequently used tools from the sidebar or your browser for quick access.',
      bullets: [
        'Missing a feature? File an issue or PR in the repository and we will prioritize it.',
        'If you encounter build or cache glitches, clear site data in browser DevTools and reload.',
        'Before deploying to Cloudflare Workers, run [[pnpm build:web]] to confirm the production build succeeds.',
      ],
    },
  ],
  cta: {
    text: 'Ready to dive in? ',
    linkLabel: 'Start with the QR code generator',
    linkSlug: 'qr-generator',
  },
};

export default home;
