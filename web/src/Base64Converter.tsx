import { ChangeEvent, useMemo, useState } from 'react';
import { bytesToSpacedHex, bytesToUtf8, utf8ToBytes } from './utils/bytes.ts';
import { useI18n } from './i18n/index';

type Base64Variant = 'standard' | 'standard-no-pad' | 'url' | 'url-no-pad';

type EncodeResult = {
  output: string;
  byteLength: number;
};

type DecodeResult = {
  text: string;
  hex: string;
  variant: DecodedVariant | null;
  addedPadding: number;
  error: string;
};

type DecodedVariant = 'standard' | 'standard-no-pad' | 'url' | 'url-no-pad';

type Base64ConverterCopy = {
  title: string;
  description: string;
  encode: {
    title: string;
    description: string;
    inputLabel: string;
    placeholder: string;
    variantLabel: string;
    variants: Record<Base64Variant, { label: string; hint: string }>;
    byteLengthLabel: string;
    resultLabel: string;
    resultPlaceholder: string;
    buttons: {
      copy: string;
      copied: string;
      clearInput: string;
    };
  };
  decode: {
    title: string;
    description: string;
    inputLabel: string;
    placeholder: string;
    errors: {
      invalidCharacter: string;
      invalidLength: string;
      decodeFailed: string;
    };
    status: {
      waiting: string;
      identified: string;
      addedPadding: string;
    };
    resultLabel: string;
    resultPlaceholder: string;
    hexLabel: string;
    buttons: {
      copy: string;
      copied: string;
      clearInput: string;
    };
    variantLabels: Record<DecodedVariant, string>;
  };
  section: {
    title: string;
    description: string;
    bullets: string[];
    hint: string;
  };
};

const base64VariantOrder: Base64Variant[] = ['standard', 'standard-no-pad', 'url', 'url-no-pad'];

const EMPTY_DECODE_RESULT: DecodeResult = {
  text: '',
  hex: '',
  variant: null,
  addedPadding: 0,
  error: '',
};

const chunkSize = 0x8000;

function bytesToBase64(bytes: Uint8Array): string {
  if (bytes.length === 0) {
    return '';
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const sub = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...sub);
  }
  return btoa(binary);
}

function normalizeVariant(base64: string, variant: Base64Variant): string {
  let output = base64;
  if (variant === 'standard-no-pad' || variant === 'url-no-pad') {
    output = output.replace(/=+$/u, '');
  }
  if (variant === 'url' || variant === 'url-no-pad') {
    output = output.replace(/\+/g, '-').replace(/\//g, '_');
  }
  return output;
}

function encodeBase64(input: string, variant: Base64Variant): EncodeResult {
  if (!input) {
    return { output: '', byteLength: 0 };
  }
  const bytes = utf8ToBytes(input);
  const base64 = bytesToBase64(bytes);
  const normalized = normalizeVariant(base64, variant);
  return { output: normalized, byteLength: bytes.length };
}

function decodeBase64(
  input: string,
  messages: {
    invalidCharacter: string;
    invalidLength: string;
    decodeFailed: string;
  }
): DecodeResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ...EMPTY_DECODE_RESULT };
  }
  const compact = trimmed.replace(/\s+/g, '');
  if (/[^0-9a-zA-Z\-_/+=]/u.test(compact)) {
    return {
      ...EMPTY_DECODE_RESULT,
      error: messages.invalidCharacter,
    };
  }

  const isUrl = /[-_]/.test(compact);
  const hasPadding = compact.endsWith('=');

  let normalized = isUrl ? compact.replace(/-/g, '+').replace(/_/g, '/') : compact;
  const remainder = normalized.length % 4;
  let addedPadding = 0;
  if (remainder === 1) {
    return {
      ...EMPTY_DECODE_RESULT,
      error: messages.invalidLength,
    };
  }
  if (remainder > 0) {
    addedPadding = 4 - remainder;
    normalized += '='.repeat(addedPadding);
  }

  try {
    const binary = atob(normalized);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      buffer[i] = binary.charCodeAt(i);
    }
    const text = bytesToUtf8(buffer);
    const variant: DecodedVariant = isUrl
      ? hasPadding || addedPadding > 0
        ? 'url'
        : 'url-no-pad'
      : hasPadding || addedPadding > 0
        ? 'standard'
        : 'standard-no-pad';

    return {
      text,
      hex: bytesToSpacedHex(buffer, { uppercase: true, groupSize: 1, separator: ' ' }),
      variant,
      addedPadding,
      error: '',
    };
  } catch (error) {
    console.error('Failed to decode Base64', error);
    return {
      ...EMPTY_DECODE_RESULT,
      error: messages.decodeFailed,
    };
  }
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) {
    return false;
  }
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    console.warn('Clipboard write failed, fallback to execCommand', error);
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const succeeded = document.execCommand('copy');
    document.body.removeChild(textarea);
    return succeeded;
  } catch (error) {
    console.error('Fallback clipboard write failed', error);
  }
  return false;
}

export default function Base64Converter() {
  const { translations } = useI18n();
  const copy = translations.tools.base64Converter.page as Base64ConverterCopy;
  const [encodeInput, setEncodeInput] = useState('');
  const [variant, setVariant] = useState<Base64Variant>('standard');
  const [decodeInput, setDecodeInput] = useState('');
  const [encodeCopied, setEncodeCopied] = useState(false);
  const [decodeCopied, setDecodeCopied] = useState(false);

  const variantOptions = useMemo(
    () =>
      base64VariantOrder.map((value) => ({
        value,
        label: copy.encode.variants[value].label,
        hint: copy.encode.variants[value].hint,
      })),
    [copy.encode.variants]
  );

  const encodeResult = useMemo(() => encodeBase64(encodeInput, variant), [encodeInput, variant]);
  const decodeErrors = copy.decode.errors;
  const decodeResult = useMemo(() => decodeBase64(decodeInput, decodeErrors), [decodeErrors, decodeInput]);

  const handleEncodeChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setEncodeInput(event.target.value);
    setEncodeCopied(false);
  };

  const handleVariantChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setVariant(event.target.value as Base64Variant);
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
      window.setTimeout(() => setEncodeCopied(false), 1600);
    }
  };

  const handleCopyDecode = async () => {
    const success = await copyToClipboard(decodeResult.text);
    setDecodeCopied(success);
    if (success) {
      window.setTimeout(() => setDecodeCopied(false), 1600);
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
        <label htmlFor="base64-encode-input">{copy.encode.inputLabel}</label>
        <textarea
          id="base64-encode-input"
          value={encodeInput}
          onChange={handleEncodeChange}
          rows={5}
          placeholder={copy.encode.placeholder}
        />
        <div className="form-inline">
          <label htmlFor="base64-variant">{copy.encode.variantLabel}</label>
          <select id="base64-variant" value={variant} onChange={handleVariantChange}>
            {variantOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} — {option.hint}
              </option>
            ))}
          </select>
          <span className="hint">
            {copy.encode.byteLengthLabel.replace('{count}', String(encodeResult.byteLength))}
          </span>
        </div>
        <label htmlFor="base64-encode-output">{copy.encode.resultLabel}</label>
        <textarea
          id="base64-encode-output"
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
            {copy.encode.buttons.clearInput}
          </button>
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>{copy.decode.title}</h2>
          <p>{copy.decode.description}</p>
        </header>
        <label htmlFor="base64-decode-input">{copy.decode.inputLabel}</label>
        <textarea
          id="base64-decode-input"
          value={decodeInput}
          onChange={handleDecodeChange}
          rows={6}
          placeholder={copy.decode.placeholder}
        />
        {decodeResult.error ? (
          <p className="error">{decodeResult.error}</p>
        ) : (
          <p className="hint">
            {decodeResult.variant
              ? copy.decode.status.identified.replace(
                  '{variant}',
                  copy.decode.variantLabels[decodeResult.variant]
                )
              : copy.decode.status.waiting}
            {decodeResult.addedPadding > 0
              ? copy.decode.status.addedPadding.replace('{count}', String(decodeResult.addedPadding))
              : ''}
          </p>
        )}
        <label htmlFor="base64-decoded-text">{copy.decode.resultLabel}</label>
        <textarea
          id="base64-decoded-text"
          value={decodeResult.text}
          readOnly
          rows={5}
          placeholder={copy.decode.resultPlaceholder}
        />
        <div className="decoded-hex">
          <span className="hint">{copy.decode.hexLabel}</span>
          <pre>{decodeResult.hex || '—'}</pre>
        </div>
        <div className="actions">
          <button type="button" className="secondary" onClick={handleCopyDecode} disabled={!decodeResult.text}>
            {decodeCopied ? copy.decode.buttons.copied : copy.decode.buttons.copy}
          </button>
          <button type="button" className="secondary" onClick={() => setDecodeInput('')}>
            {copy.decode.buttons.clearInput}
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
