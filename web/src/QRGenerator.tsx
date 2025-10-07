import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useI18n } from './i18n/index';

type QRGeneratorCopy = {
  title: string;
  description: string;
  form: {
    inputLabel: string;
    placeholder: string;
    autoGenerateLabel: string;
    submitLabel: string;
    errors: {
      general: string;
      empty: string;
    };
  };
  sections: {
    guide: {
      title: string;
      description: string;
      steps: string[];
      hint: string;
    };
  };
};

export default function QRGenerator() {
  const [formValue, setFormValue] = useState<string>('');
  const [qrValue, setQrValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [autoGenerate, setAutoGenerate] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { translations } = useI18n();
  const copy = translations.tools.qrGenerator.page as QRGeneratorCopy;

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
        setError(copy.form.errors.general);
      });
  }, [copy.form.errors.general, qrValue]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (autoGenerate) {
      return;
    }

    const trimmed = formValue.trim();
    if (!trimmed) {
      setError(copy.form.errors.empty);
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
      <h1>{copy.title}</h1>
      <p className="card-description">{copy.description}</p>
      <form onSubmit={handleSubmit} className="form" autoComplete="off">
        <label htmlFor="url-input">{copy.form.inputLabel}</label>
        <input
          id="url-input"
          type="text"
          value={formValue}
          onChange={handleInputChange}
          placeholder={copy.form.placeholder}
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
          {copy.form.autoGenerateLabel}
        </label>
        <button type="submit" disabled={autoGenerate}>
          {copy.form.submitLabel}
        </button>
      </form>
      <div className={`qr-output${qrValue ? '' : ' empty'}`}>
        <canvas ref={canvasRef} width="256" height="256" />
      </div>
      <section className="section">
        <header className="section-header">
          <h2>{copy.sections.guide.title}</h2>
          <p>{copy.sections.guide.description}</p>
        </header>
        <ol>
          {copy.sections.guide.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="hint">{copy.sections.guide.hint}</p>
      </section>
    </main>
  );
}
