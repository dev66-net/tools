import { ChangeEvent, useState } from 'react';
import { useI18n } from './i18n/index';
import { randomIntInclusive, supportsCryptoRandom } from './utils/random.ts';

const MAX_COUNT = 100;

type CopyState = 'idle' | 'copied';

type RandomNumberGeneratorCopy = {
  title: string;
  description: string;
  form: {
    minLabel: string;
    maxLabel: string;
    countLabel: string;
    generate: string;
    copy: string;
    copied: string;
    preferCryptoLabel: string;
    errors: {
      invalidBounds: string;
      invalidCount: string;
      maxCount: string;
      invertedRange: string;
      generic: string;
    };
  };
  results: {
    cryptoUsed: string;
    cryptoFallback: string;
    mathUsed: string;
  };
  guidance: {
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

export default function RandomNumberGenerator() {
  const { translations } = useI18n();
  const copy = translations.tools.randomNumberGenerator.page as RandomNumberGeneratorCopy;
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
      setError(copy.form.errors.invalidBounds);
      return;
    }
    if (Number.isNaN(countValue) || countValue < 1) {
      setError(copy.form.errors.invalidCount);
      return;
    }
    if (countValue > MAX_COUNT) {
      setError(copy.form.errors.maxCount.replace('{count}', String(MAX_COUNT)));
      return;
    }

    const lower = Math.ceil(minValue);
    const upper = Math.floor(maxValue);
    if (upper < lower) {
      setError(copy.form.errors.invertedRange);
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
      setError((generateError as Error).message || copy.form.errors.generic);
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
      <h1>{copy.title}</h1>
      <p className="card-description">{copy.description}</p>
      <section className="section">
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="rng-min">{copy.form.minLabel}</label>
            <input
              id="rng-min"
              type="number"
              value={min}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setMin(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="rng-max">{copy.form.maxLabel}</label>
            <input
              id="rng-max"
              type="number"
              value={max}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setMax(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="rng-count">{copy.form.countLabel}</label>
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
          {copy.form.preferCryptoLabel}
        </label>
        {error ? <p className="error">{error}</p> : null}
        <div className="actions">
          <button type="button" className="secondary" onClick={handleGenerate}>
            {copy.form.generate}
          </button>
          <button type="button" className="secondary" onClick={handleCopy} disabled={results.length === 0}>
            {copyState === 'copied' ? copy.form.copied : copy.form.copy}
          </button>
        </div>
        {results.length > 0 ? (
          <>
            <p className="hint">
              {preferCrypto
                ? usedCrypto
                  ? copy.results.cryptoUsed
                  : copy.results.cryptoFallback
                : copy.results.mathUsed}
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
          <h2>{copy.guidance.title}</h2>
          <p>{copy.guidance.description}</p>
        </header>
        <ul>
          {copy.guidance.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <p className="hint">{copy.guidance.hint}</p>
      </section>
    </main>
  );
}
