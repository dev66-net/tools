import type { ToolCopy } from '../../../i18n/types';

const qrScanner: ToolCopy = {
  meta: {
    label: 'QR Code Scanner',
    pageTitle: 'QR Code Scanner | Decode QR Images in Your Browser - tools.dev66.net',
    description:
      'Upload, paste or drag-and-drop a QR code image to decode URLs, text and commands. Automatic rotation cleanup helps with blurry captures.',
    keywords: [
      'qr code scanner',
      'qr decoder',
      'online qr reader',
      'decode qr image',
      'scan qr code',
      'parse qr code',
      'qr tool',
      'developer tools',
    ],
    fallbackLabel: 'QR scanner',
    executionNote: 'Decoding happens locally; no images or results are uploaded.',
  },
  page: {
    title: 'QR Code Scanner: Upload or Paste a QR Image',
    description:
      'Paste, drag or upload a QR image and extract the embedded link, text or command with automatic rotation correction.',
    dropzone: {
      instruction: 'Paste an image here, or drag and drop / choose a local file',
      chooseButton: 'Choose image',
      status: 'Decoding…',
    },
    sources: {
      pastedImage: 'Pasted image',
    },
    previewLabel: 'Preview',
    previewAlt: 'QR code preview',
    result: {
      heading: 'Decoded result',
      placeholder: 'Decoded content will appear here',
      copyButtonLabel: 'Copy result',
    },
    errors: {
      notImage: 'Please choose an image file',
      decodeFailed: 'Could not decode the QR code: {name}',
      generic: 'Decoding failed. Please try again.',
      copy: 'Copy failed',
      canvasUnavailable: 'Processing canvas is unavailable',
      contextUnavailable: 'Unable to get drawing context',
      fileRead: 'Could not read the file. Please try again.',
      fileReadGeneric: 'File reading failed. Please try again.',
    },
    tips: {
      title: 'QR scanning tips',
      description: 'Keep the QR code sharp and centered to improve decoding accuracy.',
      bullets: [
        'You can paste screenshots directly or scan with your phone and send the image to this page.',
        'If the code is rotated or skewed, retry—the scanner will attempt multiple correction angles.',
        'Verify the decoded content before executing commands or visiting unfamiliar URLs.',
      ],
    },
  },
};

export default qrScanner;
