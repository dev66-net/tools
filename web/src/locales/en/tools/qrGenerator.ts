import type { ToolCopy } from '../../../i18n/types';

const qrGenerator: ToolCopy = {
  meta: {
    label: 'QR Code Generator',
    pageTitle: 'QR Code Generator | Create High-Resolution QR Codes Online - tools.dev66.net',
    description:
      'Generate crisp QR codes for URLs, text, contact cards or Wi-Fi configs. Download a PNG instantly for posters, sharing or campaigns.',
    keywords: [
      'qr code generator',
      'online qr code',
      'create qr code',
      'qr code image',
      'wifi qr code',
      'contact qr code',
      'marketing qr code',
      'developer tools',
    ],
    fallbackLabel: 'QR generator',
    executionNote: 'Everything renders in your browser so links and secrets never leave the device.',
  },
  page: {
    title: 'QR Code Generator: Create High-Resolution QR Codes Online',
    description:
      'Support URLs, text, contact cards or Wi-Fi details, then export a crisp PNG for posters, print or sharing.',
    form: {
      inputLabel: 'Enter content:',
      placeholder: 'https://example.com or any text',
      autoGenerateLabel: 'Auto generate QR code',
      submitLabel: 'Generate QR code',
      errors: {
        general: 'Failed to generate the QR code. Please try again.',
        empty: 'Enter content to encode.',
      },
    },
    sections: {
      guide: {
        title: 'How to create a QR code quickly',
        description: 'Drop in any text, link or data, choose automatic preview and obtain a high-resolution QR instantly.',
        steps: [
          'Paste a URL, phone number, Wi-Fi profile or custom text into the input field.',
          'Keep “Auto generate QR code” enabled for live preview, or disable it and click the button when ready.',
          'Right-click or long-press the QR image to save a PNG for posters, business cards or campaign assets.',
        ],
        hint: 'Always test-scan large prints to verify the final content before distributing.',
      },
    },
  },
};

export default qrGenerator;
