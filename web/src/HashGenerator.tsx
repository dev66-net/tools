import { ChangeEvent, useEffect, useMemo, useState } from 'react';
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
        { name: 'SHA-1', hex: '', base64: '', error: '当前环境不支持 Web Crypto Subtle API。' },
        { name: 'SHA-256', hex: '', base64: '', error: '当前环境不支持 Web Crypto Subtle API。' },
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
        const message = (error as Error).message || '摘要计算失败。';
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
  }, [source]);

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
      <h1>哈希计算器：在线生成 MD5 与 SHA 摘要</h1>
      <p className="card-description">
        输入任意文本即可计算 MD5、SHA-1、SHA-256 等常见散列，支持复制 Hex 与 Base64 结果，便于校验文件或接口签名。
      </p>
      <section className="section">
        <label htmlFor="hash-input">待计算文本</label>
        <textarea
          id="hash-input"
          rows={6}
          value={source}
          onChange={handleChange}
          placeholder="输入或粘贴需要计算哈希值的文本"
        />
        <div className="hint">UTF-8 字节长度：{byteLength}</div>
        <div className="actions">
          <button type="button" className="secondary" onClick={() => setSource('')} disabled={!source}>
            清空输入
          </button>
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>摘要结果</h2>
        </header>
        {rows.length === 0 ? <p className="hint">输入文本后将自动计算。</p> : null}
        <div className="hash-table">
          <div className="hash-table-header">
            <span>算法</span>
            <span>Hex</span>
            <span>Base64</span>
          </div>
          {rows.map((row) => (
            <div key={row.name} className="hash-table-row">
              <span className="hash-name">{row.name}</span>
              <span className="hash-value">
                {row.error ? (
                  <span className="error">{row.error}</span>
                ) : row.pending ? (
                  <span className="hint">计算中…</span>
                ) : (
                  <>
                    <code>{row.hex}</code>
                    <button
                      type="button"
                      className="link"
                      onClick={() => handleCopy(row, 'hex')}
                      disabled={!row.hex}
                    >
                      {copiedKey === `${row.name}-hex` ? '已复制' : '复制'}
                    </button>
                  </>
                )}
              </span>
              <span className="hash-value">
                {row.error ? null : row.pending ? (
                  <span className="hint">计算中…</span>
                ) : (
                  <>
                    <code>{row.base64}</code>
                    <button
                      type="button"
                      className="link"
                      onClick={() => handleCopy(row, 'base64')}
                      disabled={!row.base64}
                    >
                      {copiedKey === `${row.name}-base64` ? '已复制' : '复制'}
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
          <h2>哈希校验提示</h2>
          <p>对比 Hex 或 Base64 摘要即可验证内容是否被篡改。</p>
        </header>
        <ul>
          <li>复制 Hex 摘要用于对照下载页或接口返回的签名，确认文件完整性。</li>
          <li>Base64 摘要常用于 HTTP 头或数据库字段，点击“复制”即可粘贴到调试工具。</li>
          <li>处理大文本时哈希计算可能稍有延迟，请耐心等待提示变为“已复制”。</li>
        </ul>
        <p className="hint">工具在浏览器本地计算哈希，可用于处理包含密钥或敏感配置的内容。</p>
      </section>
    </main>
  );
}
