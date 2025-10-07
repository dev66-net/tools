import { useEffect, useMemo, useState } from 'react';
import { useI18n } from './i18n/index';

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

function decodeBase64Url(part: string, errorMessage: string): string {
  const normalized = normalizeBase64(part);
  try {
    return atob(normalized);
  } catch {
    throw new Error(errorMessage);
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
  const { translations } = useI18n();
  const copy = translations.tools.jwtDecoder.page as JwtDecoderCopy;

  const decodeStatus = useMemo<DecodeStatus>(() => {
    const trimmed = tokenInput.trim();
    if (!trimmed) {
      return { kind: 'empty' };
    }

    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      return { kind: 'invalid', message: copy.errors.parts };
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    try {
      const decodedHeader = decodeBase64Url(encodedHeader, copy.errors.base64);
      const decodedPayload = decodeBase64Url(encodedPayload, copy.errors.base64);

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
      return { kind: 'invalid', message: copy.errors.parse };
    }
  }, [copy.errors.base64, copy.errors.parse, copy.errors.parts, tokenInput]);

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
        message: copy.verificationMessages.unsupported.replace(
          '{alg}',
          algorithm || copy.result.unknownAlg
        ),
      });
      return () => {
        cancelled = true;
      };
    }

    if (!window.crypto?.subtle) {
      setVerification({ status: 'error', message: copy.verificationMessages.webCryptoUnavailable });
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
            setVerification({ status: 'valid', message: copy.verificationMessages.signatureValid });
          } else {
            setVerification({ status: 'invalid', message: copy.verificationMessages.signatureInvalid });
          }
        }
      } catch (error) {
        if (!cancelled) {
          setVerification({
            status: 'error',
            message: (error as Error).message || copy.verificationMessages.signatureError,
          });
        }
      }
    };

    void verifySignature();

    return () => {
      cancelled = true;
    };
  }, [copy.result.unknownAlg, copy.verificationMessages.signatureError, copy.verificationMessages.signatureInvalid, copy.verificationMessages.signatureValid, copy.verificationMessages.unsupported, copy.verificationMessages.webCryptoUnavailable, decodeStatus, secret]);

  const renderStatusBadge = () => {
    if (decodeStatus.kind === 'empty') {
      return <span className="jwt-status neutral">{copy.input.statuses.empty}</span>;
    }

    if (decodeStatus.kind === 'invalid') {
      return <span className="jwt-status danger">{copy.input.statuses.invalid}</span>;
    }

    return <span className="jwt-status success">{copy.input.statuses.valid}</span>;
  };

  const verificationBadge = () => {
    switch (verification.status) {
      case 'idle':
        return <span className="jwt-status neutral">{copy.verificationBadges.idle}</span>;
      case 'checking':
        return <span className="jwt-status info">{copy.verificationBadges.checking}</span>;
      case 'valid':
        return <span className="jwt-status success">{copy.verificationBadges.valid}</span>;
      case 'invalid':
        return <span className="jwt-status danger">{copy.verificationBadges.invalid}</span>;
      case 'unsupported':
        return <span className="jwt-status warning">{copy.verificationBadges.unsupported}</span>;
      case 'error':
        return <span className="jwt-status danger">{copy.verificationBadges.error}</span>;
      default:
        return null;
    }
  };

  const verificationMessage = useMemo(() => {
    switch (verification.status) {
      case 'checking':
        return { tone: 'info', text: copy.verificationMessages.checking };
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
  }, [copy.verificationMessages.checking, verification]);

  return (
    <div className="jwt-wrapper">
      <header className="jwt-header">
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </header>
      <div className="jwt-columns">
        <section className="jwt-panel">
          <header className="jwt-panel-header">
            <div>
              <h2>{copy.input.title}</h2>
              <p>{copy.input.description}</p>
            </div>
            {renderStatusBadge()}
          </header>
          <textarea
            className="jwt-textarea"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            placeholder={copy.input.placeholder}
            spellCheck={false}
          />
          <div className="jwt-actions">
            <button type="button" className="secondary" onClick={() => setTokenInput(sampleToken)}>
              {copy.input.buttons.sample}
            </button>
            <button type="button" className="secondary" onClick={() => setTokenInput('')}>
              {copy.input.buttons.clear}
            </button>
          </div>
          <div className="jwt-secret">
            <div className="jwt-secret-header">
              <h2>{copy.secret.title}</h2>
              {verificationBadge()}
            </div>
            <input
              type="text"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              placeholder={copy.secret.placeholder}
            />
            <div className="jwt-secret-hint">
              {copy.secret.hintLabel}
              {sampleSecret}
            </div>
            <div className="jwt-actions">
              <button type="button" className="secondary" onClick={() => setSecret(sampleSecret)}>
                {copy.secret.buttons.useSample}
              </button>
              <button type="button" className="secondary" onClick={() => setSecret('')}>
                {copy.secret.buttons.clear}
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
              <h2>{copy.result.title}</h2>
              <p>{copy.result.description}</p>
            </div>
          </header>
          <div className="jwt-result">
            <div className="jwt-result-section">
              <div className="jwt-result-header">
                <h3>{copy.result.headerTitle}</h3>
                {decodeStatus.kind === 'decoded' && (
                  <span className="jwt-tag">
                    {copy.result.algLabel}: {String(decodeStatus.header.alg || copy.result.unknownAlg)}
                  </span>
                )}
              </div>
              <pre className="jwt-json">{JSON.stringify(decodeStatus.kind === 'decoded' ? decodeStatus.header : {}, null, 2)}</pre>
            </div>
            <div className="jwt-result-section">
              <div className="jwt-result-header">
                <h3>{copy.result.payloadTitle}</h3>
                {decodeStatus.kind === 'decoded' && decodeStatus.payload.exp !== undefined ? (
                  <span className="jwt-tag">{copy.result.expLabel}: {String(decodeStatus.payload.exp)}</span>
                ) : null}
              </div>
              <pre className="jwt-json">{JSON.stringify(decodeStatus.kind === 'decoded' ? decodeStatus.payload : {}, null, 2)}</pre>
            </div>
            {decodeStatus.kind === 'decoded' ? (
              <div className="jwt-result-section">
                <div className="jwt-result-header">
                  <h3>{copy.result.signatureTitle}</h3>
                  {verificationBadge()}
                </div>
                <pre className="jwt-json jwt-signature">{decodeStatus.encodedSignature}</pre>
              </div>
            ) : null}
            {decodeStatus.kind === 'empty' ? (
              <div className="jwt-placeholder">{copy.result.placeholder}</div>
            ) : null}
          </div>
        </section>
      </div>
      <section className="section">
        <header className="section-header">
          <h2>{copy.section.title}</h2>
          <p>{copy.section.description}</p>
        </header>
        <ul>
          {copy.section.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <p className="hint">{copy.section.hint}</p>
      </section>
    </div>
  );
}

type JwtDecoderCopy = {
  title: string;
  description: string;
  input: {
    title: string;
    description: string;
    placeholder: string;
    buttons: {
      sample: string;
      clear: string;
    };
    statuses: {
      empty: string;
      invalid: string;
      valid: string;
    };
  };
  secret: {
    title: string;
    placeholder: string;
    hintLabel: string;
    buttons: {
      useSample: string;
      clear: string;
    };
  };
  verificationBadges: {
    idle: string;
    checking: string;
    valid: string;
    invalid: string;
    unsupported: string;
    error: string;
  };
  verificationMessages: {
    checking: string;
    unsupported: string;
    webCryptoUnavailable: string;
    signatureValid: string;
    signatureInvalid: string;
    signatureError: string;
  };
  errors: {
    base64: string;
    parts: string;
    parse: string;
  };
  result: {
    title: string;
    description: string;
    headerTitle: string;
    payloadTitle: string;
    signatureTitle: string;
    placeholder: string;
    algLabel: string;
    unknownAlg: string;
    expLabel: string;
  };
  section: {
    title: string;
    description: string;
    bullets: string[];
    hint: string;
  };
};
