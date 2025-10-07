import { useCallback, useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json as jsonLang } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { githubLight } from '@uiw/codemirror-theme-github';

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

export default function JSONFormatter() {
  const [source, setSource] = useState<string>(sampleJson);
  const [formatted, setFormatted] = useState<string>('');
  const [status, setStatus] = useState<FormatState>('idle');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [mode, setMode] = useState<FormatMode>('pretty');
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
        setError((formatError as Error).message ?? 'JSON 解析失败，请检查输入内容。');
        setCopied(false);
      }
    },
    []
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
      setError((copyError as Error).message ?? '无法复制到剪贴板，请手动复制。');
    }
  };

  const inputStatus: StatusMeta = useMemo(() => {
    if (!source.trim()) {
      return { tone: 'neutral', label: '空输入' };
    }
    if (status === 'error') {
      return { tone: 'danger', label: '解析错误' };
    }
    if (status === 'formatted' || status === 'minified') {
      return { tone: 'success', label: '解析成功' };
    }
    return { tone: 'info', label: '等待处理' };
  }, [source, status]);

  const outputStatus: StatusMeta = useMemo(() => {
    switch (status) {
      case 'formatted':
        return { tone: 'success', label: '已格式化' };
      case 'minified':
        return { tone: 'warning', label: '已压缩' };
      case 'error':
        return { tone: 'danger', label: '解析错误' };
      default:
        return { tone: 'neutral', label: '等待处理' };
    }
  }, [status]);

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
        <h1>JSON 格式化器：在线美化与压缩</h1>
        <p>快速格式化或压缩 JSON 文本，自动检测语法错误并支持深浅色主题，适合调试 API、配置文件与日志。</p>
      </header>
      <div className="json-columns">
        <section className="json-panel">
          <header className="json-panel-header">
            <div>
              <h2>原始输入</h2>
              <p>粘贴 JSON 内容，点击按钮格式化或压缩。</p>
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
              格式化
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setMode('compact')}
              disabled={!source.trim() || mode === 'compact'}
            >
              压缩
            </button>
            <button type="button" className="secondary" onClick={() => setSource(sampleJson)}>
              填充示例
            </button>
            <button type="button" className="secondary" onClick={() => setSource('')}>
              清空
            </button>
          </div>
        </section>
        <section className="json-panel">
          <header className="json-panel-header">
            <div>
              <h2>格式化输出</h2>
              <p>成功解析后会显示在此处，可复制到剪贴板。</p>
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
              <div className="json-placeholder">格式化结果会显示在这里。</div>
            )}
          </div>
          <div className="json-actions">
            <button type="button" onClick={handleCopy} disabled={!formatted}>
              {copied ? '已复制' : '复制结果'}
            </button>
            <button type="button" className="secondary" onClick={() => setFormatted('')} disabled={!formatted}>
              清空结果
            </button>
          </div>
        </section>
      </div>
      <section className="section">
        <header className="section-header">
          <h2>JSON 调试小贴士</h2>
          <p>借助格式化结果和状态提示，可以快速定位字段错误并准备 API 示例。</p>
        </header>
        <ul>
          <li>使用“填充示例”快速演示格式化流程，便于向团队成员展示使用方法。</li>
          <li>切换至“压缩”模式可以得到最短的 JSON 串，适合嵌入查询参数或节省带宽。</li>
          <li>遇到解析失败时查看状态与错误信息，通常能精准定位缺失的逗号或引号。</li>
        </ul>
        <p className="hint">本工具完全在浏览器中运行，不会上传数据，可放心格式化包含敏感信息的响应。</p>
      </section>
    </div>
  );
}
