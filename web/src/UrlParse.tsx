import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useI18n } from './i18n/index';

type QueryParam = {
  key: string;
  value: string;
};

type UrlDetails = {
  scheme: string;
  username: string;
  password: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  query: string;
  hash: string;
  origin: string;
  addedScheme: boolean;
};

type NormalizedUrl = {
  url: URL;
  addedScheme: boolean;
};

type UrlParserCopy = {
  title: string;
  description: string;
  form: {
    label: string;
    placeholder: string;
    emptyPrompt: string;
    parseError: string;
    noteAutoScheme: string;
  };
  details: {
    title: string;
    labels: {
      scheme: string;
      host: string;
      hostname: string;
      port: string;
      pathname: string;
      query: string;
      hash: string;
      username: string;
      password: string;
      origin: string;
    };
    empty: string;
    maskedPassword: string;
    defaultPath: string;
  };
  query: {
    title: string;
    empty: string;
    unnamed: string;
    emptyValue: string;
    copy: string;
    copied: string;
  };
  transform: {
    title: string;
  };
  encode: {
    title: string;
    sourceLabel: string;
    sourcePlaceholder: string;
    resultLabel: string;
    resultPlaceholder: string;
    copy: string;
    copied: string;
  };
  decode: {
    title: string;
    sourceLabel: string;
    sourcePlaceholder: string;
    resultLabel: string;
    resultPlaceholder: string;
    error: string;
    copy: string;
    copied: string;
  };
  tips: {
    title: string;
    description: string;
    bullets: string[];
    hint: string;
  };
};

const inferUrl = (rawValue: string): NormalizedUrl | null => {
  try {
    const direct = new URL(rawValue);
    return { url: direct, addedScheme: false };
  } catch {}

  try {
    const prefixed = new URL(`https://${rawValue}`);
    return { url: prefixed, addedScheme: true };
  } catch {}

  return null;
};

const buildDetails = ({ url, addedScheme }: NormalizedUrl): UrlDetails => ({
  scheme: url.protocol.replace(/:$/, ''),
  username: url.username,
  password: url.password,
  host: url.host,
  hostname: url.hostname,
  port: url.port,
  pathname: url.pathname || '/',
  query: url.search.startsWith('?') ? url.search.slice(1) : '',
  hash: url.hash.startsWith('#') ? url.hash.slice(1) : '',
  origin: url.origin,
  addedScheme,
});

const extractQueryParams = (url: URL): QueryParam[] =>
  Array.from(url.searchParams.entries(), ([key, value]) => ({ key, value }));

const copyToClipboard = async (text: string) => {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

export default function UrlParse() {
  const [inputValue, setInputValue] = useState<string>('');
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  const [details, setDetails] = useState<UrlDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string>('');
  const [encodeSource, setEncodeSource] = useState<string>('');
  const [encodeResult, setEncodeResult] = useState<string>('');
  const [decodeSource, setDecodeSource] = useState<string>('');
  const [decodeResult, setDecodeResult] = useState<string>('');
  const [decodeError, setDecodeError] = useState<string>('');
  const copyTimeoutRef = useRef<number | null>(null);
  const { translations } = useI18n();
  const copy = translations.tools.urlParser.page as UrlParserCopy;

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const clearCopyState = () => {
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
    setCopiedId('');
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    parseValue(value);
  };

  const handleCopy = async (value: string, identifier: string) => {
    try {
      await copyToClipboard(value);
      setCopiedId(identifier);
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedId('');
        copyTimeoutRef.current = null;
      }, 2000);
    } catch (copyError) {
      console.error('Failed to copy value', copyError);
    }
  };

  const handleEncodeChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setEncodeSource(value);
    clearCopyState();
    try {
      setEncodeResult(value ? encodeURIComponent(value) : '');
    } catch (encodeError) {
      console.error('Failed to encode value', encodeError);
      setEncodeResult('');
    }
  };

  const handleDecodeChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setDecodeSource(value);
    clearCopyState();
    if (!value) {
      setDecodeResult('');
      setDecodeError('');
      return;
    }

    try {
      setDecodeResult(decodeURIComponent(value));
      setDecodeError('');
    } catch (decodeFailure) {
      console.warn('Failed to decode value', decodeFailure);
      setDecodeResult('');
      setDecodeError(copy.decode.error);
    }
  };

  const parseValue = (rawValue: string) => {
    clearCopyState();

    const trimmed = rawValue.trim();
    if (!trimmed) {
      setDetails(null);
      setQueryParams([]);
      setError('');
      setNote('');
      return;
    }

    const normalized = inferUrl(trimmed);
    if (!normalized) {
      setDetails(null);
      setQueryParams([]);
      setError(copy.form.parseError);
      setNote('');
      return;
    }

    const urlDetails = buildDetails(normalized);
    const params = extractQueryParams(normalized.url);

    setDetails(urlDetails);
    setQueryParams(params);
    setError('');
    setNote(urlDetails.addedScheme ? copy.form.noteAutoScheme : '');
  };

  const renderDetails = () => {
    if (!details) {
      return null;
    }

    const fields: Array<{ key: keyof UrlDetails; label: string; value: string }> = [
      {
        key: 'scheme',
        label: copy.details.labels.scheme,
        value: details.scheme || copy.details.empty,
      },
      {
        key: 'host',
        label: copy.details.labels.host,
        value: details.host || copy.details.empty,
      },
      {
        key: 'hostname',
        label: copy.details.labels.hostname,
        value: details.hostname || copy.details.empty,
      },
      {
        key: 'port',
        label: copy.details.labels.port,
        value: details.port || copy.details.empty,
      },
      {
        key: 'pathname',
        label: copy.details.labels.pathname,
        value: details.pathname || copy.details.defaultPath,
      },
      {
        key: 'query',
        label: copy.details.labels.query,
        value: details.query ? `?${details.query}` : copy.details.empty,
      },
      {
        key: 'hash',
        label: copy.details.labels.hash,
        value: details.hash ? `#${details.hash}` : copy.details.empty,
      },
      {
        key: 'username',
        label: copy.details.labels.username,
        value: details.username || copy.details.empty,
      },
      {
        key: 'password',
        label: copy.details.labels.password,
        value: details.password ? copy.details.maskedPassword : copy.details.empty,
      },
      {
        key: 'origin',
        label: copy.details.labels.origin,
        value: details.origin || copy.details.empty,
      },
    ];

    return (
      <section className="url-details">
        <h2>{copy.details.title}</h2>
        <dl className="url-detail-grid">
          {fields.map((field) => (
            <div key={field.key} className="url-detail">
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  };

  return (
    <main className="card">
      <h1>{copy.title}</h1>
      <p className="card-description">{copy.description}</p>
      <form className="form" autoComplete="off" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="url-parser-input">{copy.form.label}</label>
        <input
          id="url-parser-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={copy.form.placeholder}
        />
      </form>
      {error && <p className="form-error">{error}</p>}
      {!error && note && <p className="form-note">{note}</p>}
      {!error && !details && !inputValue.trim() && <p className="query-empty">{copy.form.emptyPrompt}</p>}
      {details && (
        <>
          {renderDetails()}
          {queryParams.length > 0 ? (
            <section className="query-params">
              <h2>{copy.query.title}</h2>
              <ul className="query-param-list">
                {queryParams.map((param, index) => {
                  const identifier = `${param.key}-${index}`;
                  const buttonLabel = copiedId === identifier ? copy.query.copied : copy.query.copy;
                  return (
                    <li key={identifier} className="query-param">
                      <div className="query-param-header">
                        <span className="query-param-key">{param.key || copy.query.unnamed}</span>
                        <button
                          type="button"
                          className={`copy-button${copiedId === identifier ? ' copied' : ''}`}
                          onClick={() => handleCopy(param.value, identifier)}
                        >
                          {buttonLabel}
                        </button>
                      </div>
                      <div className="query-param-value">{param.value || copy.query.emptyValue}</div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : (
            <p className="query-empty">{copy.query.empty}</p>
          )}
        </>
      )}
      <section className="transform-tools">
        <h2>{copy.transform.title}</h2>
        <div className="transform-grid">
          <article className="transform-card">
            <header className="transform-header">
              <h3>{copy.encode.title}</h3>
            </header>
            <label className="transform-label" htmlFor="url-encode-input">
              {copy.encode.sourceLabel}
            </label>
            <textarea
              id="url-encode-input"
              className="transform-textarea"
              placeholder={copy.encode.sourcePlaceholder}
              value={encodeSource}
              onChange={handleEncodeChange}
            />
            <label className="transform-label" htmlFor="url-encode-output">
              {copy.encode.resultLabel}
            </label>
            <textarea
              id="url-encode-output"
              className="transform-textarea"
              value={encodeResult}
              readOnly
              placeholder={copy.encode.resultPlaceholder}
            />
            {encodeResult && (
              <div className="transform-actions">
                <button
                  type="button"
                  className={`copy-button${copiedId === 'encode' ? ' copied' : ''}`}
                  onClick={() => handleCopy(encodeResult, 'encode')}
                >
                  {copiedId === 'encode' ? copy.encode.copied : copy.encode.copy}
                </button>
              </div>
            )}
          </article>
          <article className="transform-card">
            <header className="transform-header">
              <h3>{copy.decode.title}</h3>
            </header>
            <label className="transform-label" htmlFor="url-decode-input">
              {copy.decode.sourceLabel}
            </label>
            <textarea
              id="url-decode-input"
              className="transform-textarea"
              placeholder={copy.decode.sourcePlaceholder}
              value={decodeSource}
              onChange={handleDecodeChange}
            />
            <label className="transform-label" htmlFor="url-decode-output">
              {copy.decode.resultLabel}
            </label>
            <textarea
              id="url-decode-output"
              className={`transform-textarea${decodeError ? ' has-error' : ''}`}
              value={decodeResult}
              readOnly
              placeholder={copy.decode.resultPlaceholder}
            />
            {decodeResult && !decodeError && (
              <div className="transform-actions">
                <button
                  type="button"
                  className={`copy-button${copiedId === 'decode' ? ' copied' : ''}`}
                  onClick={() => handleCopy(decodeResult, 'decode')}
                >
                  {copiedId === 'decode' ? copy.decode.copied : copy.decode.copy}
                </button>
              </div>
            )}
            {decodeError && <p className="transform-error">{decodeError}</p>}
          </article>
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>{copy.tips.title}</h2>
          <p>{copy.tips.description}</p>
        </header>
        <ul>
          {copy.tips.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <p className="hint">{copy.tips.hint}</p>
      </section>
    </main>
  );
}
