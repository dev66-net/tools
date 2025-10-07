import { ChangeEvent, ClipboardEvent, DragEvent, useCallback, useRef, useState } from 'react';
import jsQR from 'jsqr';

type ProcessSource = {
  file: File;
  name: string;
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

export default function QRScanner() {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

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
            reject(new Error('无法读取文件，请重试'));
          }
        };
        reader.onerror = () => reject(new Error('读取文件失败，请重试'));
        reader.readAsDataURL(file);
      }),
    []
  );

  const drawImageToCanvas = useCallback(async (dataUrl: string) => {
    const image = new Image();
    image.src = dataUrl;
    await image.decode();

    const canvas = canvasRef.current;
    if (!canvas) {
      throw new Error('处理画布不可用');
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('无法获取绘图上下文');
    }

    const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    return ctx.getImageData(0, 0, width, height);
  }, []);

  const processSource = useCallback(
    async ({ file, name }: ProcessSource) => {
      if (!file.type.startsWith('image/')) {
        setError('请选择图片文件');
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
          throw new Error('处理画布不可用');
        }

        const decoded = decodeImageFromCanvas(canvas, imageData);

        if (!decoded) {
          setError(`未能识别二维码：${name}`);
          return;
        }

        setResult(decoded);
      } catch (processingError) {
        const message = processingError instanceof Error ? processingError.message : '识别失败，请重试';
        setError(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [decodeImageFromCanvas, drawImageToCanvas, readFileAsDataUrl]
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
          void processSource({ file, name: '粘贴图片' });
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
      const message = copyError instanceof Error ? copyError.message : '复制失败';
      setError(message);
    }
  };

  return (
    <main className="card">
      <h1>二维码识别器：上传图片或粘贴二维码</h1>
      <p className="card-description">
        二维码识别器支持拖拽、粘贴或上传图片，自动旋转校正模糊二维码，快速提取二维码内的链接、文本或指令内容。
      </p>
      <section className="scanner">
        <div
          className="scan-dropzone"
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          onPaste={handlePaste}
        >
          <p className="scan-instruction">粘贴图片到此区域，或拖拽 / 选择本地图片文件</p>
          <button type="button" className="secondary" onClick={triggerFileDialog} disabled={isProcessing}>
            选择图片
          </button>
          {isProcessing && <p className="scan-status">正在识别中…</p>}
          {error && <p className="form-error">{error}</p>}
        </div>

        {previewUrl && (
          <div className="scan-preview-wrapper">
            <span className="scan-preview-label">预览</span>
            <img src={previewUrl} alt="二维码预览" className="scan-preview" />
          </div>
        )}

        <div className="scan-result">
          <div className="scan-result-header">
            <span>识别结果</span>
            <button type="button" className="icon-button" onClick={handleCopyResult} disabled={!result} aria-label="复制结果">
              {copyIcon}
            </button>
          </div>
          <textarea
            className="scan-result-text"
            value={result}
            readOnly
            placeholder="识别内容会显示在这里"
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
          <h2>二维码识别最佳实践</h2>
          <p>保证图片清晰且二维码占据主体位置，可大幅提升识别成功率。</p>
        </header>
        <ul>
          <li>支持直接粘贴截图或使用手机扫描二维码后发送到电脑再上传处理。</li>
          <li>若遇到旋转或倾斜的二维码，可多次尝试，识别器会自动尝试多角度校正。</li>
          <li>复制结果前请确认内容来源可靠，避免执行未知脚本或访问钓鱼链接。</li>
        </ul>
      </section>
    </main>
  );
}
