import { useEffect, useMemo, useState } from 'react';

const sampleToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFyg3nM1GM6H9FNFUR0f3wh7SmaqJp-QV30';

const sampleSecret = 'a-string-secret-at-least-256-bits-long';

type DecodeStatus =
  | { kind: 'empty' }
  | {
      kind: 'decoded';
      header: Record<string, unknown>;
      payload: Record<string, unknown>;
      encodedHeader: string;
      encodedPayload: string;
      encodedSignature: string;
    }
  | { kind: 'invalid'; message: string };

type VerificationState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'valid'; message: string }
  | { status: 'invalid'; message: string }
  | { status: 'unsupported'; message: string }
  | { status: 'error'; message: string };

const textEncoder = new TextEncoder();

function normalizeBase64(input: string): string {
  const paddedLength = (4 - (input.length % 4)) % 4;
  const padding = '='.repeat(paddedLength);
  return input.replace(/-/g, '+').replace(/_/g, '/') + padding;
}

function decodeBase64Url(part: string): string {
  const normalized = normalizeBase64(part);
  try {
    return atob(normalized);
  } catch {
    throw new Error('Base64Url 解码失败');
  }
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export default function JWTDecoder() {
  const [tokenInput, setTokenInput] = useState<string>(sampleToken);
  const [secret, setSecret] = useState<string>('');
  const [verification, setVerification] = useState<VerificationState>({ status: 'idle' });

  const decodeStatus = useMemo<DecodeStatus>(() => {
    const trimmed = tokenInput.trim();
    if (!trimmed) {
      return { kind: 'empty' };
    }

    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      return { kind: 'invalid', message: 'JWT 必须包含 header、payload、signature 三部分。' };
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    try {
      const decodedHeader = decodeBase64Url(encodedHeader);
      const decodedPayload = decodeBase64Url(encodedPayload);

      const header = JSON.parse(decodedHeader) as Record<string, unknown>;
      const payload = JSON.parse(decodedPayload) as Record<string, unknown>;

      return {
        kind: 'decoded',
        header,
        payload,
        encodedHeader,
        encodedPayload,
        encodedSignature,
      };
    } catch (error) {
      if (error instanceof Error) {
        return { kind: 'invalid', message: error.message };
      }
      return { kind: 'invalid', message: '解析失败，请检查 JWT 是否有效。' };
    }
  }, [tokenInput]);

  useEffect(() => {
    let cancelled = false;

    if (decodeStatus.kind !== 'decoded') {
      setVerification({ status: 'idle' });
      return () => {
        cancelled = true;
      };
    }

    if (!secret.trim()) {
      setVerification({ status: 'idle' });
      return () => {
        cancelled = true;
      };
    }

    const algorithm = typeof decodeStatus.header.alg === 'string' ? decodeStatus.header.alg : '';
    if (algorithm !== 'HS256') {
      setVerification({
        status: 'unsupported',
        message: `当前算法为 ${algorithm || '未知'}，暂仅支持 HS256 验证。`,
      });
      return () => {
        cancelled = true;
      };
    }

    if (!window.crypto?.subtle) {
      setVerification({ status: 'error', message: '当前浏览器不支持 Web Crypto API，无法校验签名。' });
      return () => {
        cancelled = true;
      };
    }

    setVerification({ status: 'checking' });

    const verifySignature = async () => {
      try {
        const key = await crypto.subtle.importKey(
          'raw',
          textEncoder.encode(secret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );

        const data = `${decodeStatus.encodedHeader}.${decodeStatus.encodedPayload}`;
        const signatureBuffer = await crypto.subtle.sign('HMAC', key, textEncoder.encode(data));
        const computedSignature = base64UrlEncode(new Uint8Array(signatureBuffer));

        if (!cancelled) {
          if (computedSignature === decodeStatus.encodedSignature) {
            setVerification({ status: 'valid', message: '签名校验通过。' });
          } else {
            setVerification({ status: 'invalid', message: '签名不匹配，请确认密钥是否正确。' });
          }
        }
      } catch (error) {
        if (!cancelled) {
          setVerification({ status: 'error', message: (error as Error).message || '签名验证失败。' });
        }
      }
    };

    void verifySignature();

    return () => {
      cancelled = true;
    };
  }, [decodeStatus, secret]);

  const renderStatusBadge = () => {
    if (decodeStatus.kind === 'empty') {
      return <span className="jwt-status neutral">等待输入</span>;
    }

    if (decodeStatus.kind === 'invalid') {
      return <span className="jwt-status danger">无效 JWT</span>;
    }

    return <span className="jwt-status success">结构有效</span>;
  };

  const verificationBadge = () => {
    switch (verification.status) {
      case 'idle':
        return <span className="jwt-status neutral">未校验</span>;
      case 'checking':
        return <span className="jwt-status info">校验中…</span>;
      case 'valid':
        return <span className="jwt-status success">签名有效</span>;
      case 'invalid':
        return <span className="jwt-status danger">签名无效</span>;
      case 'unsupported':
        return <span className="jwt-status warning">算法不支持</span>;
      case 'error':
        return <span className="jwt-status danger">校验失败</span>;
      default:
        return null;
    }
  };

  const verificationMessage = useMemo(() => {
    switch (verification.status) {
      case 'checking':
        return { tone: 'info', text: '正在使用 HS256 校验签名…' };
      case 'valid':
        return { tone: 'success', text: verification.message };
      case 'invalid':
        return { tone: 'danger', text: verification.message };
      case 'unsupported':
        return { tone: 'warning', text: verification.message };
      case 'error':
        return { tone: 'danger', text: verification.message };
      default:
        return null;
    }
  }, [verification]);

  return (
    <div className="jwt-wrapper">
      <header className="jwt-header">
        <h1>JWT 解析器</h1>
        <p>解码 JSON Web Token，查看 Header 与 Payload，并可选输入密钥验证 HS256 签名。</p>
      </header>
      <div className="jwt-columns">
        <section className="jwt-panel">
          <header className="jwt-panel-header">
            <div>
              <h2>JWT 内容</h2>
              <p>粘贴或输入完整的 JWT。工具会自动解析。</p>
            </div>
            {renderStatusBadge()}
          </header>
          <textarea
            className="jwt-textarea"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            placeholder="eyJhbGciOi..."
            spellCheck={false}
          />
          <div className="jwt-actions">
            <button type="button" className="secondary" onClick={() => setTokenInput(sampleToken)}>
              填充示例
            </button>
            <button type="button" className="secondary" onClick={() => setTokenInput('')}>
              清空
            </button>
          </div>
          <div className="jwt-secret">
            <div className="jwt-secret-header">
              <h2>签名密钥（可选）</h2>
              {verificationBadge()}
            </div>
            <input
              type="text"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              placeholder="输入用于签名的共享密钥"
            />
            <div className="jwt-secret-hint">示例密钥：{sampleSecret}</div>
            <div className="jwt-actions">
              <button type="button" className="secondary" onClick={() => setSecret(sampleSecret)}>
                使用示例密钥
              </button>
              <button type="button" className="secondary" onClick={() => setSecret('')}>
                清空密钥
              </button>
            </div>
            {verificationMessage ? (
              <p className={`jwt-message ${verificationMessage.tone}`}>{verificationMessage.text}</p>
            ) : null}
          </div>
          {decodeStatus.kind === 'invalid' ? <p className="jwt-message danger">{decodeStatus.message}</p> : null}
        </section>
        <section className="jwt-panel">
          <header className="jwt-panel-header">
            <div>
              <h2>解码结果</h2>
              <p>查看 JWT Header 与 Payload 的结构化内容。</p>
            </div>
          </header>
          <div className="jwt-result">
            <div className="jwt-result-section">
              <div className="jwt-result-header">
                <h3>Decoded Header</h3>
                {decodeStatus.kind === 'decoded' && (
                  <span className="jwt-tag">alg: {String(decodeStatus.header.alg || '未知')}</span>
                )}
              </div>
              <pre className="jwt-json">{JSON.stringify(decodeStatus.kind === 'decoded' ? decodeStatus.header : {}, null, 2)}</pre>
            </div>
            <div className="jwt-result-section">
              <div className="jwt-result-header">
                <h3>Decoded Payload</h3>
                {decodeStatus.kind === 'decoded' && decodeStatus.payload.exp !== undefined ? (
                  <span className="jwt-tag">exp: {String(decodeStatus.payload.exp)}</span>
                ) : null}
              </div>
              <pre className="jwt-json">{JSON.stringify(decodeStatus.kind === 'decoded' ? decodeStatus.payload : {}, null, 2)}</pre>
            </div>
            {decodeStatus.kind === 'decoded' ? (
              <div className="jwt-result-section">
                <div className="jwt-result-header">
                  <h3>Signature</h3>
                  {verificationBadge()}
                </div>
                <pre className="jwt-json jwt-signature">{decodeStatus.encodedSignature}</pre>
              </div>
            ) : null}
            {decodeStatus.kind === 'empty' ? (
              <div className="jwt-placeholder">输入 JWT 后展示解码内容。</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
