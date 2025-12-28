import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLocation } from 'react-router-dom';
import mermaid from 'mermaid';
import { useI18n } from './i18n/index';
import MarkdownEditor from './components/MarkdownEditor';

const PRINT_STORAGE_KEY = 'markdown-renderer:print-payload';

type MdastNode = {
  type: string;
  value?: string;
  children?: MdastNode[];
  [key: string]: unknown;
};

type PrintPayload = {
  source: string;
  useGfm: boolean;
  timestamp: number;
};

type MermaidDiagramProps = {
  code: string;
  ariaLabel: string;
  errorMessage: string;
  onRender?: () => void;
};

let mermaidInitialized = false;

function ensureMermaid() {
  if (mermaidInitialized) {
    return;
  }
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
  mermaidInitialized = true;
}

function readPrintPayload(): PrintPayload | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(PRINT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<PrintPayload>;
    if (typeof parsed.source !== 'string') {
      return null;
    }

    return {
      source: parsed.source,
      useGfm: typeof parsed.useGfm === 'boolean' ? parsed.useGfm : true,
      timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
    } satisfies PrintPayload;
  } catch (error) {
    return null;
  }
}

function countMermaidBlocks(markdown: string): number {
  if (!markdown) {
    return 0;
  }
  return (markdown.match(/```mermaid[\s\S]*?```/g) ?? []).length;
}

function remarkLongDashHr() {
  const transformNode = (node: MdastNode, parent: MdastNode | null, index: number | null) => {
    if (!node) {
      return;
    }

    if (node.type === 'paragraph' && parent && typeof index === 'number') {
      const child = node.children?.[0];
      if (
        node.children?.length === 1 &&
        child?.type === 'text' &&
        typeof child.value === 'string' &&
        /^⸻+$/.test(child.value.replace(/[\s\u00a0]+/g, ''))
      ) {
        parent.children?.splice(index, 1, { type: 'thematicBreak' });
        return;
      }
    }

    node.children?.forEach((child, childIndex) => {
      transformNode(child, node, childIndex);
    });
  };

  return (tree: MdastNode) => {
    transformNode(tree, null, null);
  };
}

function MermaidDiagram({ code, ariaLabel, errorMessage, onRender }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const diagramIdRef = useRef<string>();
  const [error, setError] = useState<Error | null>(null);

  if (!diagramIdRef.current) {
    diagramIdRef.current = `mermaid-${Math.random().toString(36).slice(2, 11)}`;
  }

  const sanitizedCode = useMemo(() => code.trim(), [code]);

  useEffect(() => {
    if (!sanitizedCode) {
      onRender?.();
      return;
    }

    ensureMermaid();
    let cancelled = false;

    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(diagramIdRef.current!, sanitizedCode);
        if (cancelled) {
          return;
        }
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
        setError(null);
        onRender?.();
      } catch (renderError) {
        if (cancelled) {
          return;
        }
        setError(renderError instanceof Error ? renderError : new Error(errorMessage));
        onRender?.();
      }
    };

    void renderDiagram();

    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [onRender, sanitizedCode]);

  if (error) {
    return (
      <pre>
        <code>{code}</code>
      </pre>
    );
  }

  return <div ref={containerRef} className="markdown-mermaid" role="img" aria-label={ariaLabel} />;
}

// Optimized preview panel component
const PreviewPanel = memo(({
  content,
  remarkPlugins,
  markdownComponents,
  copy
}: {
  content: string;
  remarkPlugins: Array<unknown>;
  markdownComponents: Components;
  copy: MarkdownRendererCopy;
}) => {
  return (
    <div className="markdown-preview" aria-live="polite">
      {content ? (
        <ReactMarkdown remarkPlugins={remarkPlugins} components={markdownComponents}>
          {content}
        </ReactMarkdown>
      ) : (
        <p className="markdown-empty">{copy.preview.empty}</p>
      )}
    </div>
  );
});

PreviewPanel.displayName = 'PreviewPanel';

const printStyles = `
  :root {
    color-scheme: light;
  }
  body {
    margin: 0;
    padding: 32px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #111827;
    background: #ffffff;
  }
  h1, h2, h3, h4, h5, h6 {
    color: #111827;
    margin-top: 1.5em;
  }
  h1:first-child {
    margin-top: 0;
  }
  p, li {
    line-height: 1.65;
  }
  pre {
    background: #1f2937;
    color: #f9fafb;
    padding: 12px 16px;
    border-radius: 12px;
    overflow: auto;
  }
  code {
    font-family: SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  }
  code:not(pre code) {
    background: rgba(15, 23, 42, 0.08);
    padding: 0.15em 0.4em;
    border-radius: 6px;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1.5rem 0;
    font-size: 0.95rem;
  }
  th, td {
    border: 1px solid #d1d5db;
    padding: 10px 12px;
    text-align: left;
  }
  blockquote {
    margin: 1.4rem 0;
    padding-left: 1.2rem;
    border-left: 4px solid #3b82f6;
    color: #4b5563;
  }
  ul, ol {
    padding-left: 1.5rem;
  }
  a {
    color: #2563eb;
  }
`;

export default function MarkdownRenderer() {
  const { translations } = useI18n();
  const copy = translations.tools.markdownRenderer.page as MarkdownRendererCopy;
  const location = useLocation();
  const isPrintMode = useMemo(() => {
    const params = new URLSearchParams(location.search);
    if (!params.has('print')) {
      return false;
    }
    const value = params.get('print');
    if (value === null || value.length === 0) {
      return true;
    }
    const normalized = value.trim().toLowerCase();
    return normalized !== '0' && normalized !== 'false' && normalized !== 'no';
  }, [location.search]);

  const printPayload = useMemo(() => (isPrintMode ? readPrintPayload() : null), [isPrintMode]);

  const sampleMarkdown = copy.sample;

  const [source, setSource] = useState<string>(() => {
    if (isPrintMode) {
      return printPayload?.source ?? '';
    }
    return sampleMarkdown;
  });
  const [useGfm, setUseGfm] = useState<boolean>(() => {
    if (isPrintMode) {
      return printPayload?.useGfm ?? true;
    }
    return true;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const remarkPlugins = useMemo(() => {
    const plugins = [] as Array<unknown>;
    if (useGfm) {
      plugins.push(remarkGfm);
    }
    plugins.push(remarkLongDashHr);
    return plugins;
  }, [useGfm]);
  const trimmedSource = source.trim();
  const hasContent = trimmedSource.length > 0;
  const mermaidBlockCount = useMemo(() => countMermaidBlocks(trimmedSource), [trimmedSource]);
  const mermaidProgressRef = useRef<{ total: number; completed: number }>({ total: 0, completed: 0 });
  const [printReady, setPrintReady] = useState(() => !isPrintMode || mermaidBlockCount === 0);

  useEffect(() => {
    if (!isPrintMode) {
      return;
    }

    if (printPayload) {
      setSource(printPayload.source);
      setUseGfm(printPayload.useGfm);
    }

    window.localStorage.removeItem(PRINT_STORAGE_KEY);
  }, [isPrintMode, printPayload]);

  useEffect(() => {
    if (!isPrintMode) {
      return;
    }

    document.body.classList.add('print-mode');
    return () => {
      document.body.classList.remove('print-mode');
    };
  }, [isPrintMode]);

  useEffect(() => {
    if (!isPrintMode) {
      setPrintReady(true);
      mermaidProgressRef.current = { total: 0, completed: 0 };
      return;
    }

    mermaidProgressRef.current = { total: mermaidBlockCount, completed: 0 };
    setPrintReady(mermaidBlockCount === 0);
  }, [isPrintMode, mermaidBlockCount]);

  useEffect(() => {
    if (!isPrintMode || !hasContent || !printReady) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.print();
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isPrintMode, hasContent, printReady]);

  const handleMermaidRender = useCallback(() => {
    if (!isPrintMode) {
      return;
    }

    const state = mermaidProgressRef.current;
    if (state.total === 0) {
      setPrintReady(true);
      return;
    }

    state.completed += 1;
    if (state.completed >= state.total) {
      setPrintReady(true);
    }
  }, [isPrintMode]);

  const markdownComponents = useMemo(
    () =>
      ({
        a: ({ node, ...props }) => (
          <a {...props} target={props.target ?? '_blank'} rel="noopener noreferrer">
            {props.children}
          </a>
        ),
        table: ({ node, ...props }) => <table {...props} />,
        th: ({ node, ...props }) => <th {...props} scope={props.scope ?? 'col'} />,
        code: ({ node, inline, className, children, ...props }) => {
          const text = String(children ?? '');
          const match = /language-([a-z0-9]+)/i.exec(className ?? '');

          if (!inline && match?.[1] === 'mermaid') {
            return (
              <MermaidDiagram
                code={text}
                ariaLabel={copy.mermaid.ariaLabel}
                errorMessage={copy.mermaid.renderError}
                onRender={handleMermaidRender}
              />
            );
          }

          if (!inline && match) {
            return (
              <pre className={className ?? undefined}>
                <code {...props}>{text}</code>
              </pre>
            );
          }

          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }) satisfies Components,
    [copy.mermaid.ariaLabel, copy.mermaid.renderError, handleMermaidRender]
  );

  const handleSourceChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setSource(event.target.value);
  }, []);

  const handleFillSample = useCallback(() => {
    setSource(sampleMarkdown);
  }, [sampleMarkdown]);

  const handleClear = useCallback(() => {
    setSource('');
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handlePrint = useCallback(() => {
    if (!hasContent) {
      return;
    }

    const payload: PrintPayload = {
      source,
      useGfm,
      timestamp: Date.now(),
    };

    let storageReady = false;
    try {
      window.localStorage.setItem(PRINT_STORAGE_KEY, JSON.stringify(payload));
      storageReady = true;
    } catch (error) {
      storageReady = false;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('print', '1');

    const features = 'noopener,noreferrer,width=900,height=600';
    const printWindow = window.open(url.toString(), '_blank', features);
    if (!printWindow) {
      if (!storageReady && previewRef.current) {
        const fallbackWindow = window.open('', '_blank', features);
        if (fallbackWindow) {
          const html = previewRef.current.innerHTML;
          fallbackWindow.document.write(
            `<!doctype html><html><head><meta charset="utf-8" /><title>${copy.printFallback.windowTitle}</title><style>${printStyles}</style></head><body>${html}</body></html>`
          );
          fallbackWindow.document.close();
          fallbackWindow.focus();
          fallbackWindow.print();
          fallbackWindow.close();
          return;
        }
      }

      window.print();
      return;
    }

    printWindow.focus();
  }, [copy.printFallback.windowTitle, hasContent, source, useGfm]);

  if (isPrintMode) {
    return (
      <main className="markdown-print" aria-labelledby="markdown-print-title">
        <h1 id="markdown-print-title" className="visually-hidden">
          {copy.printView.heading}
        </h1>
        <div ref={previewRef} className="markdown-preview markdown-preview--print" aria-live="polite">
          {hasContent ? (
            <ReactMarkdown remarkPlugins={remarkPlugins} components={markdownComponents}>
              {source}
            </ReactMarkdown>
          ) : (
            <p className="markdown-empty">{copy.printView.empty}</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className={`card markdown-card ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      <h1>{copy.title}</h1>
      <p className="card-description">{copy.description}</p>

      <section className="section">
        <div className="markdown-grid">
          <div className="markdown-panel">
            <header className="markdown-panel-header">
              <div>
                <h2>{copy.input.title}</h2>
                <p>{copy.input.description}</p>
              </div>
              <span className="markdown-count">
                {hasContent
                  ? copy.input.charCount.template.replace('{count}', String(source.length))
                  : copy.input.charCount.empty}
              </span>
            </header>
            <div ref={editorRef}>
              <MarkdownEditor
                value={source}
                onChange={setSource}
                placeholder={copy.input.placeholder}
                minHeight={120}
                theme="auto"
              />
            </div>
            <div className="markdown-toolbar">
              <label className="markdown-checkbox">
                <input
                  type="checkbox"
                  checked={useGfm}
                  onChange={(event) => setUseGfm(event.target.checked)}
                />
                {copy.input.gfmLabel}
              </label>
              <div className="markdown-toolbar-actions">
                <button type="button" className="secondary" onClick={handleFillSample}>
                  {copy.input.buttons.sample}
                </button>
                <button type="button" className="secondary" onClick={handleClear} disabled={!source}>
                  {copy.input.buttons.clear}
                </button>
              </div>
            </div>
          </div>

          <div className="markdown-panel">
            <header className="markdown-panel-header">
              <div>
                <h2>{copy.preview.title}</h2>
                <p>{copy.preview.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={!hasContent}
                  aria-label={copy.preview.printAriaLabel}
                >
                  {copy.preview.printButton}
                </button>
                <button
                  type="button"
                  className="fullscreen-button"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "退出全屏" : "全屏"}
                  title={isFullscreen ? "退出全屏 (ESC)" : "全屏预览"}
                >
                  {isFullscreen ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                    </svg>
                  )}
                </button>
              </div>
            </header>
            <div ref={previewRef}>
              <PreviewPanel
                content={hasContent ? source : ''}
                remarkPlugins={remarkPlugins}
                markdownComponents={markdownComponents}
                copy={copy}
              />
            </div>
          </div>
        </div>
      </section>
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
    </main>
  );
}

type MarkdownRendererCopy = {
  title: string;
  description: string;
  sample: string;
  input: {
    title: string;
    description: string;
    placeholder: string;
    ariaLabel: string;
    charCount: {
      template: string;
      empty: string;
    };
    gfmLabel: string;
    buttons: {
      sample: string;
      clear: string;
    };
  };
  preview: {
    title: string;
    description: string;
    empty: string;
    printButton: string;
    printAriaLabel: string;
  };
  printView: {
    heading: string;
    windowTitle: string;
    empty: string;
  };
  printFallback: {
    windowTitle: string;
  };
  mermaid: {
    ariaLabel: string;
    renderError: string;
  };
  section: {
    title: string;
    description: string;
    bullets: string[];
    hint: string;
  };
};
