import { ChangeEvent, useState } from 'react';
import { randomIntInclusive, supportsCryptoRandom } from './utils/random.ts';

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

export default function RandomNumberGenerator() {
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('1');
  const [preferCrypto, setPreferCrypto] = useState<boolean>(supportsCryptoRandom());
  const [results, setResults] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [usedCrypto, setUsedCrypto] = useState<boolean>(false);
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const handleGenerate = () => {
    setError('');
    setCopyState('idle');
    const minValue = Number(min);
    const maxValue = Number(max);
    const countValue = Number(count);

    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
      setError('请输入有效的上下界。');
      return;
    }
    if (Number.isNaN(countValue) || countValue < 1) {
      setError('生成数量必须大于等于 1。');
      return;
    }
    if (countValue > MAX_COUNT) {
      setError(`一次最多生成 ${MAX_COUNT} 个随机数。`);
      return;
    }

    const lower = Math.ceil(minValue);
    const upper = Math.floor(maxValue);
    if (upper < lower) {
      setError('上界必须大于或等于下界。');
      return;
    }

    const output: number[] = [];
    let cryptoUsed = false;
    try {
      for (let i = 0; i < countValue; i += 1) {
        const { value, usedCrypto: used } = randomIntInclusive(lower, upper, preferCrypto);
        output.push(value);
        cryptoUsed = cryptoUsed || used;
      }
      setResults(output);
      setUsedCrypto(cryptoUsed);
    } catch (generateError) {
      setError((generateError as Error).message || '随机数生成失败。');
      setResults([]);
      setUsedCrypto(false);
    }
  };

  const handleCopy = async () => {
    if (results.length === 0) {
      return;
    }
    const success = await copyToClipboard(results.join(', '));
    if (success) {
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1500);
    }
  };

  return (
    <main className="card">
      <h1>随机数生成器：生成安全随机整数</h1>
      <p className="card-description">
        设定上下限与数量后即可生成随机整数，并可优先启用加密安全随机源，满足抽奖、测试数据等多种场景。
      </p>
      <section className="section">
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="rng-min">最小值</label>
            <input
              id="rng-min"
              type="number"
              value={min}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setMin(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="rng-max">最大值</label>
            <input
              id="rng-max"
              type="number"
              value={max}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setMax(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="rng-count">数量</label>
            <input
              id="rng-count"
              type="number"
              value={count}
              min={1}
              max={MAX_COUNT}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setCount(event.target.value)}
            />
          </div>
        </div>
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
            生成随机数
          </button>
          <button type="button" className="secondary" onClick={handleCopy} disabled={results.length === 0}>
            {copyState === 'copied' ? '已复制' : '复制结果'}
          </button>
        </div>
        {results.length > 0 ? (
          <>
            <p className="hint">
              {preferCrypto
                ? usedCrypto
                  ? '已使用加密安全随机源生成结果。'
                  : '未检测到加密安全随机源，已回退至 Math.random()。'
                : '已使用 Math.random() 生成结果。'}
            </p>
            <div className="random-results">
              {results.map((value, index) => (
                <span key={`${value}-${index}`} className="random-chip">
                  {value}
                </span>
              ))}
            </div>
          </>
        ) : null}
      </section>
      <section className="section">
        <header className="section-header">
          <h2>随机数应用建议</h2>
          <p>根据用途选择合适的随机源与数量，确保结果可信且易于复现。</p>
        </header>
        <ul>
          <li>启用“加密安全随机源”可用于抽奖、验证码等需要防预测的场景。</li>
          <li>批量输出后可点击“复制结果”一次性粘贴到电子表格或测试脚本。</li>
          <li>如果需要可重复的结果，建议记录生成参数并在外部脚本中固定随机种子。</li>
        </ul>
        <p className="hint">浏览器环境无法获取硬件噪声，仅依赖 Web Crypto 或 Math.random() 完成随机生成。</p>
      </section>
    </main>
  );
}
