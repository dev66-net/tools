import { ChangeEvent, useEffect, useRef, useState } from 'react';

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
      setDecodeError('解码失败，请确认输入是否为有效的 URL 编码。');
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
      setError('无法解析该 URL，请确认格式是否正确。');
      setNote('');
      return;
    }

    const urlDetails = buildDetails(normalized);
    const params = extractQueryParams(normalized.url);

    setDetails(urlDetails);
    setQueryParams(params);
    setError('');
    setNote(urlDetails.addedScheme ? '已自动补全 https:// 前缀以便解析。' : '');
  };

  return (
    <main className="card">
      <h1>URL 解析工具</h1>
      <form className="form" autoComplete="off" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="url-parser-input">请输入 URL：</label>
        <input
          id="url-parser-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="https://example.com/path?foo=bar&baz=qux"
        />
      </form>
      {error && <p className="form-error">{error}</p>}
      {!error && note && <p className="form-note">{note}</p>}
      {!error && !details && !inputValue.trim() && (
        <p className="query-empty">请输入待解析的 URL</p>
      )}
      {details && (
        <>
          <section className="url-details">
            <h2>URL 详情</h2>
            <dl className="url-detail-grid">
              <div className="url-detail">
                <dt>协议</dt>
                <dd>{details.scheme || '（无）'}</dd>
              </div>
              <div className="url-detail">
                <dt>主机</dt>
                <dd>{details.host || '（无）'}</dd>
              </div>
              <div className="url-detail">
                <dt>域名</dt>
                <dd>{details.hostname || '（无）'}</dd>
              </div>
              <div className="url-detail">
                <dt>端口</dt>
                <dd>{details.port || '（无）'}</dd>
              </div>
              <div className="url-detail">
                <dt>路径</dt>
                <dd>{details.pathname || '/'}</dd>
              </div>
              <div className="url-detail">
                <dt>查询字符串</dt>
                <dd>{details.query ? `?${details.query}` : '（无）'}</dd>
              </div>
              <div className="url-detail">
                <dt>哈希</dt>
                <dd>{details.hash ? `#${details.hash}` : '（无）'}</dd>
              </div>
              <div className="url-detail">
                <dt>用户名</dt>
                <dd>{details.username || '（无）'}</dd>
              </div>
              <div className="url-detail">
                <dt>密码</dt>
                <dd>{details.password ? '••••••' : '（无）'}</dd>
              </div>
              <div className="url-detail">
                <dt>来源</dt>
                <dd>{details.origin || '（无）'}</dd>
              </div>
            </dl>
          </section>
          {queryParams.length > 0 ? (
            <section className="query-params">
              <h2>查询参数</h2>
              <ul className="query-param-list">
                {queryParams.map((param, index) => {
                  const identifier = `${param.key}-${index}`;
                  return (
                    <li key={identifier} className="query-param">
                      <div className="query-param-header">
                        <span className="query-param-key">{param.key || '(未命名参数)'}</span>
                        <button
                          type="button"
                          className={`copy-button${copiedId === identifier ? ' copied' : ''}`}
                          onClick={() => handleCopy(param.value, identifier)}
                        >
                          {copiedId === identifier ? '已复制' : '复制值'}
                        </button>
                      </div>
                      <div className="query-param-value">{param.value || '(空字符串)'}</div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : (
            <p className="query-empty">该 URL 不包含查询参数</p>
          )}
        </>
      )}
      <section className="transform-tools">
        <h2>URL 编解码</h2>
        <div className="transform-grid">
          <article className="transform-card">
            <header className="transform-header">
              <h3>URL Encode</h3>
            </header>
            <label className="transform-label" htmlFor="url-encode-input">
              原始文本
            </label>
            <textarea
              id="url-encode-input"
              className="transform-textarea"
              placeholder="任意文本，将自动转换为 URL 编码"
              value={encodeSource}
              onChange={handleEncodeChange}
            />
            <label className="transform-label" htmlFor="url-encode-output">
              编码结果
            </label>
            <textarea
              id="url-encode-output"
              className="transform-textarea"
              value={encodeResult}
              readOnly
              placeholder="编码结果会显示在这里"
            />
            {encodeResult && (
              <div className="transform-actions">
                <button
                  type="button"
                  className={`copy-button${copiedId === 'encode' ? ' copied' : ''}`}
                  onClick={() => handleCopy(encodeResult, 'encode')}
                >
                  {copiedId === 'encode' ? '已复制' : '复制结果'}
                </button>
              </div>
            )}
          </article>
          <article className="transform-card">
            <header className="transform-header">
              <h3>URL Decode</h3>
            </header>
            <label className="transform-label" htmlFor="url-decode-input">
              URL 编码文本
            </label>
            <textarea
              id="url-decode-input"
              className="transform-textarea"
              placeholder="输入 URL 编码内容，会尝试自动解码"
              value={decodeSource}
              onChange={handleDecodeChange}
            />
            <label className="transform-label" htmlFor="url-decode-output">
              解码结果
            </label>
            <textarea
              id="url-decode-output"
              className={`transform-textarea${decodeError ? ' has-error' : ''}`}
              value={decodeResult}
              readOnly
              placeholder="解码结果会显示在这里"
            />
            {decodeResult && !decodeError && (
              <div className="transform-actions">
                <button
                  type="button"
                  className={`copy-button${copiedId === 'decode' ? ' copied' : ''}`}
                  onClick={() => handleCopy(decodeResult, 'decode')}
                >
                  {copiedId === 'decode' ? '已复制' : '复制结果'}
                </button>
              </div>
            )}
            {decodeError && <p className="transform-error">{decodeError}</p>}
          </article>
        </div>
      </section>
    </main>
  );
}
