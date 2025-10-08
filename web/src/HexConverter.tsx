import { ChangeEvent, useMemo, useState } from 'react';
import { useI18n } from './i18n/index';
import { bytesToHex, bytesToSpacedHex, bytesToUtf8, hexToBytes, utf8ToBytes } from './utils/bytes.ts';

type HexGrouping = 'none' | 'byte' | 'word';

type HexEncodeResult = {
  output: string;
  byteLength: number;
};

type HexDecodeResult = {
  text: string;
  bytes: number;
  error: string;
  hex: string;
};

type HexDecodeMessages = {
  invalidCharacters: string;
  decodeFailed: string;
};

type HexConverterCopy = {
  title: string;
  description: string;
  encode: {
    title: string;
    description: string;
    inputLabel: string;
    placeholder: string;
    uppercaseLabel: string;
    groupingLabel: string;
    groupingOptions: Record<HexGrouping, string>;
    byteCountLabel: string;
    resultLabel: string;
    resultPlaceholder: string;
    buttons: {
      copy: string;
      copied: string;
      clear: string;
    };
  };
  decode: {
    title: string;
    description: string;
    inputLabel: string;
    placeholder: string;
    errors: HexDecodeMessages;
    byteCountLabel: string;
    byteCountEmpty: string;
    resultLabel: string;
    resultPlaceholder: string;
    normalizedLabel: string;
    buttons: {
      copy: string;
      copied: string;
      clear: string;
    };
  };
  section: {
    title: string;
    description: string;
    bullets: string[];
    hint: string;
  };
};

const groupingValues: HexGrouping[] = ['none', 'byte', 'word'];

const EMPTY_DECODE: HexDecodeResult = {
  text: '',
  bytes: 0,
  error: '',
  hex: '',
};

function applyGrouping(hex: string, grouping: HexGrouping): string {
  if (!hex) {
    return hex;
  }
  switch (grouping) {
    case 'byte': {
      return hex.replace(/.{2}/g, (chunk) => `${chunk} `).trim();
    }
    case 'word': {
      return hex.replace(/(.{4})/g, '$1 ').trim();
    }
    default:
      return hex;
  }
}

function encodeHex(input: string, uppercase: boolean, grouping: HexGrouping): HexEncodeResult {
  if (!input) {
    return { output: '', byteLength: 0 };
  }
  const bytes = utf8ToBytes(input);
  const hex = bytesToHex(bytes, uppercase);
  return {
    output: applyGrouping(hex, grouping),
    byteLength: bytes.length,
  };
}

function sanitizeHexInput(value: string): string {
  return value
    .trim()
    .replace(/0x/gi, '')
    .replace(/[^0-9a-f]/gi, '')
    .toLowerCase();
}

function decodeHex(input: string, messages: HexDecodeMessages): HexDecodeResult {
  if (!input.trim()) {
    return EMPTY_DECODE;
  }
  const sanitized = sanitizeHexInput(input);
  if (!sanitized) {
    return {
      ...EMPTY_DECODE,
      error: messages.invalidCharacters,
    };
  }
  try {
    const bytes = hexToBytes(sanitized);
    return {
      text: bytesToUtf8(bytes),
      bytes: bytes.length,
      error: '',
      hex: bytesToSpacedHex(bytes, { uppercase: true, groupSize: 1, separator: ' ' }),
    };
  } catch (error) {
    console.error('Hex decode failed', error);
    return {
      ...EMPTY_DECODE,
      error: (error as Error).message || messages.decodeFailed,
    };
  }
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (clipboardError) {
    console.warn('Clipboard write failed, fallback to execCommand', clipboardError);
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
  } catch (error) {
    console.error('Fallback clipboard write failed', error);
    return false;
  }
}

export default function HexConverter() {
  const { translations } = useI18n();
  const copy = translations.tools.hexConverter.page as HexConverterCopy;
  const [encodeInput, setEncodeInput] = useState('');
  const [uppercase, setUppercase] = useState(true);
  const [grouping, setGrouping] = useState<HexGrouping>('byte');
  const [decodeInput, setDecodeInput] = useState('');
  const [encodeCopied, setEncodeCopied] = useState(false);
  const [decodeCopied, setDecodeCopied] = useState(false);

  const groupingOptions = useMemo(
    () => groupingValues.map((value) => ({ value, label: copy.encode.groupingOptions[value] })),
    [copy.encode.groupingOptions]
  );

  const encodeResult = useMemo(
    () => encodeHex(encodeInput, uppercase, grouping),
    [encodeInput, uppercase, grouping]
  );
  const decodeResult = useMemo(
    () => decodeHex(decodeInput, copy.decode.errors),
    [decodeInput, copy.decode.errors]
  );

  const handleEncodeChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setEncodeInput(event.target.value);
    setEncodeCopied(false);
  };

  const handleUppercaseToggle = (event: ChangeEvent<HTMLInputElement>) => {
    setUppercase(event.target.checked);
    setEncodeCopied(false);
  };

  const handleGroupingChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setGrouping(event.target.value as HexGrouping);
    setEncodeCopied(false);
  };

  const handleDecodeChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDecodeInput(event.target.value);
    setDecodeCopied(false);
  };

  const handleCopyEncode = async () => {
    const success = await copyToClipboard(encodeResult.output);
    setEncodeCopied(success);
    if (success) {
      window.setTimeout(() => setEncodeCopied(false), 1500);
    }
  };

  const handleCopyDecode = async () => {
    const success = await copyToClipboard(decodeResult.text);
    setDecodeCopied(success);
    if (success) {
      window.setTimeout(() => setDecodeCopied(false), 1500);
    }
  };

  return (
    <main className="card">
      <h1>{copy.title}</h1>
      <p className="card-description">{copy.description}</p>
      <section className="section">
        <header className="section-header">
          <h2>{copy.encode.title}</h2>
          <p>{copy.encode.description}</p>
        </header>
        <label htmlFor="hex-encode-input">{copy.encode.inputLabel}</label>
        <textarea
          id="hex-encode-input"
          value={encodeInput}
          onChange={handleEncodeChange}
          rows={5}
          placeholder={copy.encode.placeholder}
        />
        <div className="form-inline">
          <label>
            <input type="checkbox" checked={uppercase} onChange={handleUppercaseToggle} /> {copy.encode.uppercaseLabel}
          </label>
          <label htmlFor="hex-grouping">{copy.encode.groupingLabel}</label>
          <select id="hex-grouping" value={grouping} onChange={handleGroupingChange}>
            {groupingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="hint">
            {copy.encode.byteCountLabel.replace('{count}', String(encodeResult.byteLength))}
          </span>
        </div>
        <label htmlFor="hex-encode-output">{copy.encode.resultLabel}</label>
        <textarea
          id="hex-encode-output"
          value={encodeResult.output}
          readOnly
          rows={6}
          placeholder={copy.encode.resultPlaceholder}
        />
        <div className="actions">
          <button type="button" className="secondary" onClick={handleCopyEncode} disabled={!encodeResult.output}>
            {encodeCopied ? copy.encode.buttons.copied : copy.encode.buttons.copy}
          </button>
          <button type="button" className="secondary" onClick={() => setEncodeInput('')}>
            {copy.encode.buttons.clear}
          </button>
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>{copy.decode.title}</h2>
          <p>{copy.decode.description}</p>
        </header>
        <label htmlFor="hex-decode-input">{copy.decode.inputLabel}</label>
        <textarea
          id="hex-decode-input"
          value={decodeInput}
          onChange={handleDecodeChange}
          rows={6}
          placeholder={copy.decode.placeholder}
        />
        {decodeResult.error ? (
          <p className="error">{decodeResult.error}</p>
        ) : (
          <p className="hint">
            {copy.decode.byteCountLabel.replace(
              '{count}',
              decodeResult.bytes ? String(decodeResult.bytes) : copy.decode.byteCountEmpty
            )}
          </p>
        )}
        <label htmlFor="hex-decoded-text">{copy.decode.resultLabel}</label>
        <textarea
          id="hex-decoded-text"
          value={decodeResult.text}
          readOnly
          rows={5}
          placeholder={copy.decode.resultPlaceholder}
        />
        <div className="decoded-hex">
          <span className="hint">{copy.decode.normalizedLabel}</span>
          <pre>{decodeResult.hex || '—'}</pre>
        </div>
        <div className="actions">
          <button type="button" className="secondary" onClick={handleCopyDecode} disabled={!decodeResult.text}>
            {decodeCopied ? copy.decode.buttons.copied : copy.decode.buttons.copy}
          </button>
          <button type="button" className="secondary" onClick={() => setDecodeInput('')}>
            {copy.decode.buttons.clear}
          </button>
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
