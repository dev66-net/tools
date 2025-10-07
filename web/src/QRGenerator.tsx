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
      <h1>二维码生成器：在线创建高清 QR Code</h1>
      <p className="card-description">
        在线二维码生成器支持链接、文本、名片和 Wi-Fi 等内容，一键生成高清二维码并可下载 PNG 图片，适合海报、打印与分享场景。
      </p>
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
      <section className="section">
        <header className="section-header">
          <h2>如何快速生成二维码</h2>
          <p>输入任意文本、链接或数据，选择是否自动生成并立即获取高分辨率二维码。</p>
        </header>
        <ol>
          <li>在输入框粘贴网址、手机号、Wi-Fi 配置或自定义文本。</li>
          <li>保持“自动生成二维码”开启可实时预览，关闭后可在编辑完毕时手动点击按钮。</li>
          <li>右键或长按二维码即可保存 PNG 图片，用于海报、名片或宣传物料。</li>
        </ol>
        <p className="hint">建议在生成大型宣传物料前进行扫码测试，确保文本内容准确无误。</p>
      </section>
    </main>
  );
}
