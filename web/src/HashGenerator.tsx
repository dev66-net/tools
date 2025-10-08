import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useI18n } from './i18n/index';
import { bytesToHex, utf8ToBytes } from './utils/bytes.ts';
import { md5Bytes } from './utils/hash.ts';

type HashRow = {
  name: 'MD5' | 'SHA-1' | 'SHA-256';
  hex: string;
  base64: string;
  error?: string;
  pending?: boolean;
};

type CopyKey = `${HashRow['name']}-${'hex' | 'base64'}`;

const algorithms: HashRow['name'][] = ['MD5', 'SHA-1', 'SHA-256'];

const subtle = typeof globalThis !== 'undefined' ? globalThis.crypto?.subtle : undefined;

const chunkSize = 0x8000;

function bytesToBase64(bytes: Uint8Array): string {
  if (bytes.length === 0) {
    return '';
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

type HashGeneratorCopy = {
  title: string;
  description: string;
  input: {
    label: string;
    placeholder: string;
    byteLength: string;
    clear: string;
  };
  results: {
    title: string;
    emptyHint: string;
    columns: {
      algorithm: string;
      hex: string;
      base64: string;
    };
    buttons: {
      copy: string;
      copied: string;
    };
    status: {
      pending: string;
    };
    errors: {
      unsupported: string;
      generic: string;
    };
  };
  section: {
    title: string;
    description: string;
    bullets: string[];
    hint: string;
  };
};

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn('Clipboard write failed, fallback to execCommand', error);
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch (fallbackError) {
    console.error('Fallback clipboard write failed', fallbackError);
    return false;
  }
}

export default function HashGenerator() {
  const { translations } = useI18n();
  const copy = translations.tools.hashGenerator.page as HashGeneratorCopy;
  const [source, setSource] = useState('');
  const [rows, setRows] = useState<HashRow[]>([]);
  const [copiedKey, setCopiedKey] = useState<CopyKey | ''>('');

  useEffect(() => {
    let cancelled = false;

    if (!source) {
      setRows([]);
      return () => {
        cancelled = true;
      };
    }

    const bytes = utf8ToBytes(source);
    const md5Digest = md5Bytes(bytes);
    const md5Row: HashRow = {
      name: 'MD5',
      hex: bytesToHex(md5Digest),
      base64: bytesToBase64(md5Digest),
    };

    if (!subtle) {
      setRows([
        md5Row,
        { name: 'SHA-1', hex: '', base64: '', error: copy.results.errors.unsupported },
        { name: 'SHA-256', hex: '', base64: '', error: copy.results.errors.unsupported },
      ]);
      return () => {
        cancelled = true;
      };
    }

    setRows([
      md5Row,
      { name: 'SHA-1', hex: '', base64: '', pending: true },
      { name: 'SHA-256', hex: '', base64: '', pending: true },
    ]);

    (async () => {
      try {
        const [sha1Buffer, sha256Buffer] = await Promise.all([
          subtle.digest('SHA-1', bytes),
          subtle.digest('SHA-256', bytes),
        ]);
        if (cancelled) {
          return;
        }
        const sha1 = new Uint8Array(sha1Buffer);
        const sha256 = new Uint8Array(sha256Buffer);
        setRows([
          md5Row,
          { name: 'SHA-1', hex: bytesToHex(sha1), base64: bytesToBase64(sha1) },
          { name: 'SHA-256', hex: bytesToHex(sha256), base64: bytesToBase64(sha256) },
        ]);
      } catch (error) {
        if (cancelled) {
          return;
        }
        const message = (error as Error).message || copy.results.errors.generic;
        setRows([
          md5Row,
          { name: 'SHA-1', hex: '', base64: '', error: message },
          { name: 'SHA-256', hex: '', base64: '', error: message },
        ]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source, copy.results.errors.generic, copy.results.errors.unsupported]);

  const byteLength = useMemo(() => (source ? utf8ToBytes(source).length : 0), [source]);

  const handleCopy = async (row: HashRow, field: 'hex' | 'base64') => {
    const value = row[field];
    if (!value) {
      return;
    }
    const success = await copyToClipboard(value);
    if (success) {
      const key: CopyKey = `${row.name}-${field}`;
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(''), 1500);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setSource(event.target.value);
  };

  return (
    <main className="card">
      <h1>{copy.title}</h1>
      <p className="card-description">{copy.description}</p>
      <section className="section">
        <label htmlFor="hash-input">{copy.input.label}</label>
        <textarea
          id="hash-input"
          rows={6}
          value={source}
          onChange={handleChange}
          placeholder={copy.input.placeholder}
        />
        <div className="hint">{copy.input.byteLength.replace('{count}', String(byteLength))}</div>
        <div className="actions">
          <button type="button" className="secondary" onClick={() => setSource('')} disabled={!source}>
            {copy.input.clear}
          </button>
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>{copy.results.title}</h2>
        </header>
        {rows.length === 0 ? <p className="hint">{copy.results.emptyHint}</p> : null}
        <div className="hash-table">
          <div className="hash-table-header">
            <span>{copy.results.columns.algorithm}</span>
            <span>{copy.results.columns.hex}</span>
            <span>{copy.results.columns.base64}</span>
          </div>
          {rows.map((row) => (
            <div key={row.name} className="hash-table-row">
              <span className="hash-name">{row.name}</span>
              <span className="hash-value">
                {row.error ? (
                  <span className="error">{row.error}</span>
                ) : row.pending ? (
                  <span className="hint">{copy.results.status.pending}</span>
                ) : (
                  <>
                    <code>{row.hex}</code>
                    <button
                      type="button"
                      className="link"
                      onClick={() => handleCopy(row, 'hex')}
                      disabled={!row.hex}
                    >
                      {copiedKey === `${row.name}-hex` ? copy.results.buttons.copied : copy.results.buttons.copy}
                    </button>
                  </>
                )}
              </span>
              <span className="hash-value">
                {row.error ? null : row.pending ? (
                  <span className="hint">{copy.results.status.pending}</span>
                ) : (
                  <>
                    <code>{row.base64}</code>
                    <button
                      type="button"
                      className="link"
                      onClick={() => handleCopy(row, 'base64')}
                      disabled={!row.base64}
                    >
                      {copiedKey === `${row.name}-base64` ? copy.results.buttons.copied : copy.results.buttons.copy}
                    </button>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>{copy.section.title}</h2>
          <p>{copy.section.description}</p>
        </header>
        <ul>
          {copy.section.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <p className="hint">{copy.section.hint}</p>
      </section>
    </main>
  );
}
