import { useCallback, useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json as jsonLang } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { githubLight } from '@uiw/codemirror-theme-github';
import { useI18n } from './i18n/index';

const sampleJson = `{
  "name": "John Doe",
  "age": 32,
  "skills": ["TypeScript", "React", "Workers"],
  "profile": {
    "role": "developer",
    "remote": true
  }
}`;

type FormatMode = 'pretty' | 'compact';
type FormatState = 'idle' | 'formatted' | 'minified' | 'error';
type ColorScheme = 'light' | 'dark';

type StatusMeta = {
  tone: 'success' | 'warning' | 'info' | 'danger' | 'neutral';
  label: string;
};

type BasicSetupOptions = {
  foldGutter: boolean;
  highlightActiveLine: boolean;
  highlightActiveLineGutter: boolean;
};

type JsonFormatterCopy = {
  title: string;
  description: string;
  inputPanel: {
    title: string;
    description: string;
    buttons: {
      pretty: string;
      compact: string;
      sample: string;
      clear: string;
    };
  };
  outputPanel: {
    title: string;
    description: string;
    placeholder: string;
    buttons: {
      copy: string;
      copied: string;
      clear: string;
    };
  };
  statuses: {
    empty: string;
    parseError: string;
    parseSuccess: string;
    waiting: string;
    formatted: string;
    minified: string;
  };
  errors: {
    parseFallback: string;
    copyFallback: string;
  };
  tips: {
    title: string;
    description: string;
    bullets: string[];
    hint: string;
  };
};

export default function JSONFormatter() {
  const [source, setSource] = useState<string>(sampleJson);
  const [formatted, setFormatted] = useState<string>('');
  const [status, setStatus] = useState<FormatState>('idle');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [mode, setMode] = useState<FormatMode>('pretty');
  const { translations } = useI18n();
  const copy = translations.tools.jsonFormatter.page as JsonFormatterCopy;
  const { inputPanel, outputPanel, statuses, errors, tips } = copy;
  const [scheme, setScheme] = useState<ColorScheme>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const extensions = useMemo(() => [jsonLang()], []);
  const theme = useMemo(() => (scheme === 'dark' ? oneDark : githubLight), [scheme]);

  const formatWithMode = useCallback(
    (modeToUse: FormatMode, text: string) => {
      const trimmed = text.trim();

      if (!trimmed) {
        setFormatted('');
        setStatus('idle');
        setError('');
        setCopied(false);
        return;
      }

      try {
        const parsed = JSON.parse(trimmed);
        const output = modeToUse === 'pretty' ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);
        setFormatted(output);
        setStatus(modeToUse === 'pretty' ? 'formatted' : 'minified');
        setError('');
        setCopied(false);
      } catch (formatError) {
        setFormatted('');
        setStatus('error');
        setError((formatError as Error).message ?? errors.parseFallback);
        setCopied(false);
      }
    },
    [errors.parseFallback]
  );

  useEffect(() => {
    formatWithMode(mode, source);
  }, [formatWithMode, mode, source]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event: MediaQueryListEvent) => {
      setScheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const handleCopy = async () => {
    if (!formatted) {
      return;
    }

    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (copyError) {
      setStatus('error');
      setError((copyError as Error).message ?? errors.copyFallback);
    }
  };

  const inputStatus: StatusMeta = useMemo(() => {
    if (!source.trim()) {
      return { tone: 'neutral', label: statuses.empty };
    }
    if (status === 'error') {
      return { tone: 'danger', label: statuses.parseError };
    }
    if (status === 'formatted' || status === 'minified') {
      return { tone: 'success', label: statuses.parseSuccess };
    }
    return { tone: 'info', label: statuses.waiting };
  }, [source, status, statuses.empty, statuses.parseError, statuses.parseSuccess, statuses.waiting]);

  const outputStatus: StatusMeta = useMemo(() => {
    switch (status) {
      case 'formatted':
        return { tone: 'success', label: statuses.formatted };
      case 'minified':
        return { tone: 'warning', label: statuses.minified };
      case 'error':
        return { tone: 'danger', label: statuses.parseError };
      default:
        return { tone: 'neutral', label: statuses.waiting };
    }
  }, [status, statuses.formatted, statuses.minified, statuses.parseError, statuses.waiting]);

  const basicSetupEditable: BasicSetupOptions = useMemo(
    () => ({ foldGutter: true, highlightActiveLine: true, highlightActiveLineGutter: true }),
    []
  );

  const basicSetupReadonly: BasicSetupOptions = useMemo(
    () => ({ foldGutter: true, highlightActiveLine: false, highlightActiveLineGutter: false }),
    []
  );

  return (
    <div className="json-wrapper">
      <header className="json-header">
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </header>
      <div className="json-columns">
        <section className="json-panel">
          <header className="json-panel-header">
            <div>
              <h2>{inputPanel.title}</h2>
              <p>{inputPanel.description}</p>
            </div>
            <span className={`json-status ${inputStatus.tone}`}>{inputStatus.label}</span>
          </header>
          <div className="json-editor">
            <CodeMirror
              value={source}
              extensions={extensions}
              theme={theme}
              basicSetup={basicSetupEditable}
              onChange={(value) => setSource(value)}
              height="260px"
            />
          </div>
          {error && status === 'error' ? <p className="json-message danger">{error}</p> : null}
          <div className="json-actions">
            <button
              type="button"
              className="secondary"
              onClick={() => setMode('pretty')}
              disabled={!source.trim() || mode === 'pretty'}
            >
              {inputPanel.buttons.pretty}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setMode('compact')}
              disabled={!source.trim() || mode === 'compact'}
            >
              {inputPanel.buttons.compact}
            </button>
            <button type="button" className="secondary" onClick={() => setSource(sampleJson)}>
              {inputPanel.buttons.sample}
            </button>
            <button type="button" className="secondary" onClick={() => setSource('')}>
              {inputPanel.buttons.clear}
            </button>
          </div>
        </section>
        <section className="json-panel">
          <header className="json-panel-header">
            <div>
              <h2>{outputPanel.title}</h2>
              <p>{outputPanel.description}</p>
            </div>
            <span className={`json-status ${outputStatus.tone}`}>{outputStatus.label}</span>
          </header>
          <div className={`json-editor json-editor--readonly${formatted ? '' : ' json-editor--empty'}`}>
            {formatted ? (
              <CodeMirror
                value={formatted}
                editable={false}
                extensions={extensions}
                theme={theme}
                basicSetup={basicSetupReadonly}
                height="260px"
              />
            ) : (
              <div className="json-placeholder">{outputPanel.placeholder}</div>
            )}
          </div>
          <div className="json-actions">
            <button type="button" onClick={handleCopy} disabled={!formatted}>
              {copied ? outputPanel.buttons.copied : outputPanel.buttons.copy}
            </button>
            <button type="button" className="secondary" onClick={() => setFormatted('')} disabled={!formatted}>
              {outputPanel.buttons.clear}
            </button>
          </div>
        </section>
      </div>
      <section className="section">
        <header className="section-header">
          <h2>{tips.title}</h2>
          <p>{tips.description}</p>
        </header>
        <ul>
          {tips.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <p className="hint">{tips.hint}</p>
      </section>
    </div>
  );
}
