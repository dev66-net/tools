import { ChangeEvent, useState } from 'react';
import { useI18n } from './i18n/index';
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

type RandomStringGeneratorCopy = {
  title: string;
  description: string;
  form: {
    lengthLabel: string;
    countLabel: string;
    includeLowercase: string;
    includeUppercase: string;
    includeDigits: string;
    includeSymbols: string;
    customLabel: string;
    customPlaceholder: string;
    preferCryptoLabel: string;
    buttons: {
      generate: string;
      copy: string;
      copied: string;
    };
    errors: {
      invalidLength: string;
      maxLength: string;
      invalidCount: string;
      maxCount: string;
      emptyPool: string;
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

export default function RandomStringGenerator() {
  const { translations } = useI18n();
  const copy = translations.tools.randomStringGenerator.page as RandomStringGeneratorCopy;
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
      setError(copy.form.errors.invalidLength);
      return;
    }
    if (lengthValue > MAX_LENGTH) {
      setError(copy.form.errors.maxLength.replace('{count}', String(MAX_LENGTH)));
      return;
    }
    if (!Number.isFinite(countValue) || countValue < 1) {
      setError(copy.form.errors.invalidCount);
      return;
    }
    if (countValue > MAX_COUNT) {
      setError(copy.form.errors.maxCount.replace('{count}', String(MAX_COUNT)));
      return;
    }

    const pool = buildPool();
    if (!pool) {
      setError(copy.form.errors.emptyPool);
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
      setError((generateError as Error).message || copy.form.errors.generic);
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
      <h1>{copy.title}</h1>
      <p className="card-description">{copy.description}</p>
      <section className="section">
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="rsg-length">{copy.form.lengthLabel}</label>
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
            <label htmlFor="rsg-count">{copy.form.countLabel}</label>
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
            {copy.form.includeLowercase}
          </label>
          <label>
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setIncludeUppercase(event.target.checked)}
            />
            {copy.form.includeUppercase}
          </label>
          <label>
            <input
              type="checkbox"
              checked={includeDigits}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setIncludeDigits(event.target.checked)}
            />
            {copy.form.includeDigits}
          </label>
          <label>
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setIncludeSymbols(event.target.checked)}
            />
            {copy.form.includeSymbols}
          </label>
        </div>
        <label htmlFor="rsg-custom">{copy.form.customLabel}</label>
        <input
          id="rsg-custom"
          type="text"
          value={customChars}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setCustomChars(event.target.value)}
          placeholder={copy.form.customPlaceholder}
        />
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
            {copy.form.buttons.generate}
          </button>
          <button type="button" className="secondary" onClick={handleCopy} disabled={results.length === 0}>
            {copyState === 'copied' ? copy.form.buttons.copied : copy.form.buttons.copy}
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
