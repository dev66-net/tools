import { ChangeEvent, useMemo, useState } from 'react';
import { bytesToSpacedHex, bytesToUtf8, utf8ToBytes } from './utils/bytes.ts';

type Base64Variant = 'standard' | 'standard-no-pad' | 'url' | 'url-no-pad';

type EncodeResult = {
  output: string;
  byteLength: number;
};

type DecodeResult = {
  text: string;
  hex: string;
  variantLabel: string;
  addedPadding: number;
  error: string;
};

const base64VariantOptions: { value: Base64Variant; label: string; hint: string }[] = [
  { value: 'standard', label: '标准 Base64', hint: '使用 + / 字符，包含补位 = 号' },
  { value: 'standard-no-pad', label: '标准（无补位）', hint: '使用 + / 字符，不输出尾部 =' },
  { value: 'url', label: 'URL Safe', hint: '使用 - _ 字符，包含补位 =' },
  { value: 'url-no-pad', label: 'URL Safe（无补位）', hint: '使用 - _ 字符，不输出尾部 =' },
];

const EMPTY_DECODE_RESULT: DecodeResult = {
  text: '',
  hex: '',
  variantLabel: '',
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

function decodeBase64(input: string): DecodeResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return EMPTY_DECODE_RESULT;
  }
  const compact = trimmed.replace(/\s+/g, '');
  if (/[^0-9a-zA-Z\-_/+=]/u.test(compact)) {
    return {
      ...EMPTY_DECODE_RESULT,
      error: '检测到非法字符，请确认输入是否为 Base64 编码内容。',
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
      error: '长度不符合 Base64 要求，缺失的字符数量无法补齐。',
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
    const variantLabel = isUrl
      ? hasPadding || addedPadding > 0
        ? 'URL Safe Base64'
        : 'URL Safe Base64（自动补全 =）'
      : hasPadding || addedPadding > 0
        ? '标准 Base64'
        : '标准 Base64（自动补全 =）';

    return {
      text,
      hex: bytesToSpacedHex(buffer, { uppercase: true, groupSize: 1, separator: ' ' }),
      variantLabel,
      addedPadding,
      error: '',
    };
  } catch (error) {
    console.error('Failed to decode Base64', error);
    return {
      ...EMPTY_DECODE_RESULT,
      error: '无法解码该 Base64 字符串，请确认内容是否正确。',
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
  const [encodeInput, setEncodeInput] = useState('');
  const [variant, setVariant] = useState<Base64Variant>('standard');
  const [decodeInput, setDecodeInput] = useState('');
  const [encodeCopied, setEncodeCopied] = useState(false);
  const [decodeCopied, setDecodeCopied] = useState(false);

  const encodeResult = useMemo(() => encodeBase64(encodeInput, variant), [encodeInput, variant]);
  const decodeResult = useMemo(() => decodeBase64(decodeInput), [decodeInput]);

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
      <h1>Base64 编码 / 解码</h1>
      <p className="card-description">
        支持标准与 URL Safe 变体的 Base64 编码，解码时自动识别类型并补全缺失的补位字符。
      </p>
      <section className="section">
        <header className="section-header">
          <h2>Base64 编码</h2>
          <p>输入文本后自动使用 UTF-8 编码为二进制，再转换为 Base64。</p>
        </header>
        <label htmlFor="base64-encode-input">原始文本</label>
        <textarea
          id="base64-encode-input"
          value={encodeInput}
          onChange={handleEncodeChange}
          rows={5}
          placeholder="输入要编码的文本"
        />
        <div className="form-inline">
          <label htmlFor="base64-variant">输出格式</label>
          <select id="base64-variant" value={variant} onChange={handleVariantChange}>
            {base64VariantOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} — {option.hint}
              </option>
            ))}
          </select>
          <span className="hint">字节数：{encodeResult.byteLength}</span>
        </div>
        <label htmlFor="base64-encode-output">编码结果</label>
        <textarea id="base64-encode-output" value={encodeResult.output} readOnly rows={6} placeholder="编码结果" />
        <div className="actions">
          <button type="button" className="secondary" onClick={handleCopyEncode} disabled={!encodeResult.output}>
            {encodeCopied ? '已复制' : '复制编码'}
          </button>
          <button type="button" className="secondary" onClick={() => setEncodeInput('')}>
            清空输入
          </button>
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>Base64 解码</h2>
          <p>自动识别标准或 URL Safe 变体，必要时补齐缺失的补位。</p>
        </header>
        <label htmlFor="base64-decode-input">Base64 字符串</label>
        <textarea
          id="base64-decode-input"
          value={decodeInput}
          onChange={handleDecodeChange}
          rows={6}
          placeholder="粘贴或输入 Base64 编码文本"
        />
        {decodeResult.error ? (
          <p className="error">{decodeResult.error}</p>
        ) : (
          <p className="hint">
            {decodeResult.variantLabel ? `已识别为：${decodeResult.variantLabel}` : '等待输入'}
            {decodeResult.addedPadding > 0 ? `（已自动补全 ${decodeResult.addedPadding} 个 =）` : ''}
          </p>
        )}
        <label htmlFor="base64-decoded-text">解码文本</label>
        <textarea
          id="base64-decoded-text"
          value={decodeResult.text}
          readOnly
          rows={5}
          placeholder="解码后的纯文本"
        />
        <div className="decoded-hex">
          <span className="hint">十六进制：</span>
          <pre>{decodeResult.hex || '—'}</pre>
        </div>
        <div className="actions">
          <button type="button" className="secondary" onClick={handleCopyDecode} disabled={!decodeResult.text}>
            {decodeCopied ? '已复制' : '复制文本'}
          </button>
          <button type="button" className="secondary" onClick={() => setDecodeInput('')}>
            清空输入
          </button>
        </div>
      </section>
    </main>
  );
}
