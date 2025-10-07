import { ChangeEvent, ClipboardEvent, DragEvent, useCallback, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { useI18n } from './i18n/index';

type ProcessSource = {
  file: File;
  name: string;
};

type QRScannerCopy = {
  title: string;
  description: string;
  dropzone: {
    instruction: string;
    chooseButton: string;
    status: string;
  };
  sources: {
    pastedImage: string;
  };
  previewLabel: string;
  previewAlt: string;
  result: {
    heading: string;
    placeholder: string;
    copyButtonLabel: string;
  };
  errors: {
    notImage: string;
    decodeFailed: string;
    generic: string;
    copy: string;
    canvasUnavailable: string;
    contextUnavailable: string;
    fileRead: string;
    fileReadGeneric: string;
  };
  tips: {
    title: string;
    description: string;
    bullets: string[];
  };
};

const MAX_DIMENSION = 1024;
const ROTATION_ANGLES = [15, -15, 30, -30, 45, -45, 60, -60, 90, -90, 180];

const copyIcon = (
  <svg
    className="copy-icon"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

function formatMessage(template: string, replacements: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/gu, (_, key: string) => replacements[key] ?? '');
}

export default function QRScanner() {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { translations } = useI18n();
  const copy = translations.tools.qrScanner.page as QRScannerCopy;

  const decodeImageFromCanvas = useCallback(
    (canvas: HTMLCanvasElement, baseImageData?: ImageData) => {
      if (!canvas.width || !canvas.height) {
        return null;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return null;
      }

      const initialImageData = baseImageData ?? ctx.getImageData(0, 0, canvas.width, canvas.height);
      const initialCode = jsQR(initialImageData.data, initialImageData.width, initialImageData.height);
      if (initialCode) {
        return initialCode.data.trim();
      }

      const offscreenCanvas = offscreenCanvasRef.current ?? document.createElement('canvas');
      offscreenCanvasRef.current = offscreenCanvas;

      for (const angle of ROTATION_ANGLES) {
        const radians = (angle * Math.PI) / 180;
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));
        const rotatedWidth = Math.ceil(canvas.width * cos + canvas.height * sin);
        const rotatedHeight = Math.ceil(canvas.width * sin + canvas.height * cos);

        offscreenCanvas.width = rotatedWidth;
        offscreenCanvas.height = rotatedHeight;

        const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
        if (!offscreenCtx) {
          return null;
        }

        offscreenCtx.save();
        offscreenCtx.clearRect(0, 0, rotatedWidth, rotatedHeight);
        offscreenCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
        offscreenCtx.rotate(radians);
        offscreenCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
        offscreenCtx.restore();

        const rotatedImageData = offscreenCtx.getImageData(0, 0, rotatedWidth, rotatedHeight);
        const rotatedCode = jsQR(rotatedImageData.data, rotatedImageData.width, rotatedImageData.height);
        if (rotatedCode) {
          return rotatedCode.data.trim();
        }
      }

      return null;
    },
    []
  );

  const readFileAsDataUrl = useCallback(
    (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error(copy.errors.fileRead));
          }
        };
        reader.onerror = () => reject(new Error(copy.errors.fileReadGeneric));
        reader.readAsDataURL(file);
      }),
    [copy.errors.fileRead, copy.errors.fileReadGeneric]
  );

  const drawImageToCanvas = useCallback(
    async (dataUrl: string) => {
      const image = new Image();
      image.src = dataUrl;
      await image.decode();

      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error(copy.errors.canvasUnavailable);
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        throw new Error(copy.errors.contextUnavailable);
      }

      const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      return ctx.getImageData(0, 0, width, height);
    },
    [copy.errors.canvasUnavailable, copy.errors.contextUnavailable]
  );

  const processSource = useCallback(
    async ({ file, name }: ProcessSource) => {
      if (!file.type.startsWith('image/')) {
        setError(copy.errors.notImage);
        return;
      }

      setIsProcessing(true);
      setError('');
      setResult('');

      try {
        const dataUrl = await readFileAsDataUrl(file);
        setPreviewUrl(dataUrl);

        const imageData = await drawImageToCanvas(dataUrl);
        const canvas = canvasRef.current;
        if (!canvas) {
          throw new Error(copy.errors.canvasUnavailable);
        }

        const decoded = decodeImageFromCanvas(canvas, imageData);

        if (!decoded) {
          setError(formatMessage(copy.errors.decodeFailed, { name }));
          return;
        }

        setResult(decoded);
      } catch (processingError) {
        const message = processingError instanceof Error ? processingError.message : '';
        setError(message || copy.errors.generic);
      } finally {
        setIsProcessing(false);
      }
    },
    [copy.errors.canvasUnavailable, copy.errors.decodeFailed, copy.errors.generic, copy.errors.notImage, decodeImageFromCanvas, drawImageToCanvas, readFileAsDataUrl]
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void processSource({ file, name: file.name });
    }
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void processSource({ file, name: file.name });
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData?.items;
    if (!items) {
      return;
    }

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          void processSource({ file, name: copy.sources.pastedImage });
          event.preventDefault();
          break;
        }
      }
    }
  };

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleCopyResult = async () => {
    if (!result) {
      return;
    }
    try {
      await navigator.clipboard.writeText(result);
    } catch (copyError) {
      const message = copyError instanceof Error ? copyError.message : '';
      setError(message || copy.errors.copy);
    }
  };

  return (
    <main className="card">
      <h1>{copy.title}</h1>
      <p className="card-description">{copy.description}</p>
      <section className="scanner">
        <div
          className="scan-dropzone"
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          onPaste={handlePaste}
        >
          <p className="scan-instruction">{copy.dropzone.instruction}</p>
          <button type="button" className="secondary" onClick={triggerFileDialog} disabled={isProcessing}>
            {copy.dropzone.chooseButton}
          </button>
          {isProcessing && <p className="scan-status">{copy.dropzone.status}</p>}
          {error && <p className="form-error">{error}</p>}
        </div>

        {previewUrl && (
          <div className="scan-preview-wrapper">
            <span className="scan-preview-label">{copy.previewLabel}</span>
            <img src={previewUrl} alt={copy.previewAlt} className="scan-preview" />
          </div>
        )}

        <div className="scan-result">
          <div className="scan-result-header">
            <span>{copy.result.heading}</span>
            <button
              type="button"
              className="icon-button"
              onClick={handleCopyResult}
              disabled={!result}
              aria-label={copy.result.copyButtonLabel}
            >
              {copyIcon}
            </button>
          </div>
          <textarea
            className="scan-result-text"
            value={result}
            readOnly
            placeholder={copy.result.placeholder}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden-file-input"
          onChange={handleFileChange}
        />
        <canvas ref={canvasRef} className="hidden-canvas" />
      </section>
      <section className="section">
        <header className="section-header">
          <h2>{copy.tips.title}</h2>
          <p>{copy.tips.description}</p>
        </header>
        <ul>
          {copy.tips.bullets.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
