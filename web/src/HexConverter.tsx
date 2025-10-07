import { ChangeEvent, useMemo, useState } from 'react';
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

const groupingOptions: { value: HexGrouping; label: string }[] = [
  { value: 'none', label: '无分隔（紧凑）' },
  { value: 'byte', label: '按字节添加空格' },
  { value: 'word', label: '每两个字节添加空格' },
];

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

function decodeHex(input: string): HexDecodeResult {
  if (!input.trim()) {
    return EMPTY_DECODE;
  }
  const sanitized = sanitizeHexInput(input);
  if (!sanitized) {
    return {
      ...EMPTY_DECODE,
      error: '未检测到有效的十六进制字符。',
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
      error: (error as Error).message || '无法解析该十六进制字符串。',
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
  const [encodeInput, setEncodeInput] = useState('');
  const [uppercase, setUppercase] = useState(true);
  const [grouping, setGrouping] = useState<HexGrouping>('byte');
  const [decodeInput, setDecodeInput] = useState('');
  const [encodeCopied, setEncodeCopied] = useState(false);
  const [decodeCopied, setDecodeCopied] = useState(false);

  const encodeResult = useMemo(() => encodeHex(encodeInput, uppercase, grouping), [encodeInput, uppercase, grouping]);
  const decodeResult = useMemo(() => decodeHex(decodeInput), [decodeInput]);

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
      <h1>Hex 编码 / 解码</h1>
      <p className="card-description">进行文本与十六进制之间的转换，支持大小写与分隔形式的调节。</p>
      <section className="section">
        <header className="section-header">
          <h2>文本转 Hex</h2>
          <p>输入的内容将按 UTF-8 编码为字节，再输出对应的十六进制。</p>
        </header>
        <label htmlFor="hex-encode-input">原始文本</label>
        <textarea
          id="hex-encode-input"
          value={encodeInput}
          onChange={handleEncodeChange}
          rows={5}
          placeholder="需要转换的文本"
        />
        <div className="form-inline">
          <label>
            <input type="checkbox" checked={uppercase} onChange={handleUppercaseToggle} /> 使用大写
          </label>
          <label htmlFor="hex-grouping">分组方式</label>
          <select id="hex-grouping" value={grouping} onChange={handleGroupingChange}>
            {groupingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="hint">字节数：{encodeResult.byteLength}</span>
        </div>
        <label htmlFor="hex-encode-output">Hex 输出</label>
        <textarea id="hex-encode-output" value={encodeResult.output} readOnly rows={6} placeholder="十六进制结果" />
        <div className="actions">
          <button type="button" className="secondary" onClick={handleCopyEncode} disabled={!encodeResult.output}>
            {encodeCopied ? '已复制' : '复制 Hex'}
          </button>
          <button type="button" className="secondary" onClick={() => setEncodeInput('')}>
            清空输入
          </button>
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>Hex 转文本</h2>
          <p>接受含空格、换行、0x 前缀的 Hex 字符串，自动清理后再解码。</p>
        </header>
        <label htmlFor="hex-decode-input">Hex 字符串</label>
        <textarea
          id="hex-decode-input"
          value={decodeInput}
          onChange={handleDecodeChange}
          rows={6}
          placeholder="如：48656c6c6f 或 48 65 6c 6c 6f"
        />
        {decodeResult.error ? (
          <p className="error">{decodeResult.error}</p>
        ) : (
          <p className="hint">字节数：{decodeResult.bytes || '—'}</p>
        )}
        <label htmlFor="hex-decoded-text">解码文本</label>
        <textarea id="hex-decoded-text" value={decodeResult.text} readOnly rows={5} placeholder="解码后的文本" />
        <div className="decoded-hex">
          <span className="hint">标准化 Hex：</span>
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
