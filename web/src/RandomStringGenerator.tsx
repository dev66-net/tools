import { ChangeEvent, useState } from 'react';
import { randomIntExclusive, supportsCryptoRandom } from './utils/random.ts';

const baseSets = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?/\\|~`',
};

const MAX_LENGTH = 512;
const MAX_COUNT = 100;

type CopyState = 'idle' | 'copied';

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

export default function RandomStringGenerator() {
  const [length, setLength] = useState('16');
  const [count, setCount] = useState('5');
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeDigits, setIncludeDigits] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [customChars, setCustomChars] = useState('');
  const [preferCrypto, setPreferCrypto] = useState(supportsCryptoRandom());
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [usedCrypto, setUsedCrypto] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const buildPool = (): string => {
    let pool = '';
    if (includeLowercase) {
      pool += baseSets.lowercase;
    }
    if (includeUppercase) {
      pool += baseSets.uppercase;
    }
    if (includeDigits) {
      pool += baseSets.digits;
    }
    if (includeSymbols) {
      pool += baseSets.symbols;
    }
    if (customChars.trim()) {
      pool += Array.from(new Set(customChars.split(''))).join('');
    }
    return pool;
  };

  const handleGenerate = () => {
    setError('');
    setCopyState('idle');
    const lengthValue = Number(length);
    const countValue = Number(count);

    if (!Number.isFinite(lengthValue) || lengthValue < 1) {
      setError('长度必须为正整数。');
      return;
    }
    if (lengthValue > MAX_LENGTH) {
      setError(`最大长度为 ${MAX_LENGTH}。`);
      return;
    }
    if (!Number.isFinite(countValue) || countValue < 1) {
      setError('数量必须为正整数。');
      return;
    }
    if (countValue > MAX_COUNT) {
      setError(`一次最多生成 ${MAX_COUNT} 条。`);
      return;
    }

    const pool = buildPool();
    if (!pool) {
      setError('请至少选择一种字符类型或输入自定义字符。');
      return;
    }

    const output: string[] = [];
    let cryptoUsed = false;
    try {
      for (let i = 0; i < countValue; i += 1) {
        let current = '';
        for (let j = 0; j < lengthValue; j += 1) {
          const { value, usedCrypto: used } = randomIntExclusive(0, pool.length, preferCrypto);
          current += pool[value] ?? '';
          cryptoUsed = cryptoUsed || used;
        }
        output.push(current);
      }
      setResults(output);
      setUsedCrypto(cryptoUsed);
    } catch (generateError) {
      setError((generateError as Error).message || '生成随机字符串失败。');
      setResults([]);
      setUsedCrypto(false);
    }
  };

  const handleCopy = async () => {
    if (results.length === 0) {
      return;
    }
    const success = await copyToClipboard(results.join('\n'));
    if (success) {
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1500);
    }
  };

  return (
    <main className="card">
      <h1>随机字符串生成器</h1>
      <p className="card-description">组合多种字符集快速生成随机字符串，支持批量输出与安全随机源。</p>
      <section className="section">
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="rsg-length">长度</label>
            <input
              id="rsg-length"
              type="number"
              value={length}
              min={1}
              max={MAX_LENGTH}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setLength(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="rsg-count">数量</label>
            <input
              id="rsg-count"
              type="number"
              value={count}
              min={1}
              max={MAX_COUNT}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setCount(event.target.value)}
            />
          </div>
        </div>
        <div className="checkbox-grid">
          <label>
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setIncludeLowercase(event.target.checked)}
            />
            小写字母
          </label>
          <label>
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setIncludeUppercase(event.target.checked)}
            />
            大写字母
          </label>
          <label>
            <input
              type="checkbox"
              checked={includeDigits}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setIncludeDigits(event.target.checked)}
            />
            数字
          </label>
          <label>
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setIncludeSymbols(event.target.checked)}
            />
            特殊符号
          </label>
        </div>
        <label htmlFor="rsg-custom">自定义字符</label>
        <input
          id="rsg-custom"
          type="text"
          value={customChars}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setCustomChars(event.target.value)}
          placeholder="可选，例如中文字符或额外的符号"
        />
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={preferCrypto}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setPreferCrypto(event.target.checked)}
          />
          优先使用加密安全的随机源
        </label>
        {error ? <p className="error">{error}</p> : null}
        <div className="actions">
          <button type="button" className="secondary" onClick={handleGenerate}>
            生成字符串
          </button>
          <button type="button" className="secondary" onClick={handleCopy} disabled={results.length === 0}>
            {copyState === 'copied' ? '已复制' : '复制全部'}
          </button>
        </div>
        {results.length > 0 ? (
          <>
            <p className="hint">
              {preferCrypto
                ? usedCrypto
                  ? '已使用加密安全随机源生成。'
                  : '未检测到加密安全随机源，已回退至 Math.random()。'
                : '已使用 Math.random() 生成。'}
            </p>
            <ol className="string-results">
              {results.map((value, index) => (
                <li key={`${value}-${index}`}>
                  <code>{value}</code>
                </li>
              ))}
            </ol>
          </>
        ) : null}
      </section>
    </main>
  );
}
