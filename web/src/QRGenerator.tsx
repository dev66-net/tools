import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

export default function QRGenerator() {
  const [formValue, setFormValue] = useState<string>('');
  const [qrValue, setQrValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [autoGenerate, setAutoGenerate] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!qrValue) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      return;
    }

    if (!canvasRef.current) {
      return;
    }

    QRCode.toCanvas(canvasRef.current, qrValue, {
      width: 256,
      margin: 1,
      color: {
        dark: '#1f2937',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then(() => {
        setError('');
      })
      .catch(() => {
        setError('二维码生成失败，请重试');
      });
  }, [qrValue]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (autoGenerate) {
      return;
    }

    const trimmed = formValue.trim();
    if (!trimmed) {
      setError('请输入要编码的内容');
      setQrValue('');
      return;
    }

    setQrValue(trimmed);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormValue(value);

    if (!value.trim()) {
      setError('');
      if (autoGenerate) {
        setQrValue('');
      }
      return;
    }

    setError('');

    if (autoGenerate) {
      setQrValue(value.trim());
    }
  };

  return (
    <main className="card">
      <h1>URL 二维码生成器</h1>
      <form onSubmit={handleSubmit} className="form" autoComplete="off">
        <label htmlFor="url-input">请输入内容：</label>
        <input
          id="url-input"
          type="text"
          value={formValue}
          onChange={handleInputChange}
          placeholder="https://example.com 或任意文本"
          required
        />
        {error && <p className="form-error">{error}</p>}
        <label className="auto-toggle">
          <input
            type="checkbox"
            checked={autoGenerate}
            onChange={(event) => {
              const checked = event.target.checked;
              setAutoGenerate(checked);
              if (checked) {
                setQrValue(formValue.trim());
              }
            }}
          />
          自动生成二维码
        </label>
        <button type="submit" disabled={autoGenerate}>
          生成二维码
        </button>
      </form>
      <div className={`qr-output${qrValue ? '' : ' empty'}`}>
        <canvas ref={canvasRef} width="256" height="256" />
      </div>
    </main>
  );
}
