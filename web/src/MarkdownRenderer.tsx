import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLocation } from 'react-router-dom';
import mermaid from 'mermaid';

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

function MermaidDiagram({ code, onRender }: MermaidDiagramProps) {
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
        setError(renderError instanceof Error ? renderError : new Error('无法渲染 Mermaid 图表'));
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

  return <div ref={containerRef} className="markdown-mermaid" role="img" aria-label="Mermaid 图表" />;
}

const sampleMarkdown = `# Markdown 示例

欢迎使用 **Markdown 渲染器**！以下内容涵盖常见语法：

- 列表项
- [链接](https://dev66.net)
- \`行内代码\`

\`\`\`ts
function greet(name: string) {
  return \`你好，\${name}\`;
}
\`\`\`

| 阶段 | 说明 |
| ---- | ---- |
| 规划 | 明确目标 |
| 开发 | 实现功能 |
| 验证 | 手动测试 |

> 支持 GFM 扩展，例如表格与任务列表。

\`\`\`mermaid
sequenceDiagram
  participant User
  participant Renderer
  User->>Renderer: 输入 Markdown
  Renderer-->>User: 展示预览
  User->>Renderer: 点击打印
  Renderer-->>User: 打开打印视图
\`\`\`

- [ ] 待完成事项
- [x] 已完成事项
`;

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
  const previewRef = useRef<HTMLDivElement | null>(null);

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
            return <MermaidDiagram code={text} onRender={handleMermaidRender} />;
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
    [handleMermaidRender]
  );

  const handleSourceChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setSource(event.target.value);
  }, []);

  const handleFillSample = useCallback(() => {
    setSource(sampleMarkdown);
  }, []);

  const handleClear = useCallback(() => {
    setSource('');
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
            `<!doctype html><html><head><meta charset="utf-8" /><title>Markdown 预览打印</title><style>${printStyles}</style></head><body>${html}</body></html>`
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
  }, [hasContent, source, useGfm]);

  if (isPrintMode) {
    return (
      <main className="markdown-print" aria-labelledby="markdown-print-title">
        <h1 id="markdown-print-title" className="visually-hidden">
          Markdown 渲染预览
        </h1>
        <div ref={previewRef} className="markdown-preview markdown-preview--print" aria-live="polite">
          {hasContent ? (
            <ReactMarkdown remarkPlugins={remarkPlugins} components={markdownComponents}>
              {source}
            </ReactMarkdown>
          ) : (
            <p className="markdown-empty">没有可打印的内容。</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="card markdown-card">
      <h1>Markdown 渲染器</h1>
      <p className="card-description">实时渲染 Markdown 内容，支持 GitHub 风格扩展，并可一键打印预览区域。</p>

      <section className="section">
        <div className="markdown-grid">
          <div className="markdown-panel">
            <header className="markdown-panel-header">
              <div>
                <h2>Markdown 输入</h2>
                <p>支持标题、列表、表格、代码块等常用语法。</p>
              </div>
              <span className="markdown-count">{hasContent ? `${source.length} 字符` : '暂无内容'}</span>
            </header>
            <textarea
              id="markdown-source"
              className="markdown-textarea"
              value={source}
              onChange={handleSourceChange}
              placeholder="在此输入 Markdown 内容..."
              aria-label="Markdown 输入区域"
            />
            <div className="markdown-toolbar">
              <label className="markdown-checkbox">
                <input
                  type="checkbox"
                  checked={useGfm}
                  onChange={(event) => setUseGfm(event.target.checked)}
                />
                启用 GFM 扩展（表格、任务列表等）
              </label>
              <div className="markdown-toolbar-actions">
                <button type="button" className="secondary" onClick={handleFillSample}>
                  填充示例
                </button>
                <button type="button" className="secondary" onClick={handleClear} disabled={!source}>
                  清空
                </button>
              </div>
            </div>
          </div>

          <div className="markdown-panel">
            <header className="markdown-panel-header">
              <div>
                <h2>实时预览</h2>
                <p>刷新延迟低于 50ms，所见即所得。</p>
              </div>
              <button
                type="button"
                onClick={handlePrint}
                disabled={!hasContent}
                aria-label="打印 Markdown 预览"
              >
                打印
              </button>
            </header>
            <div ref={previewRef} className="markdown-preview" aria-live="polite">
              {hasContent ? (
                <ReactMarkdown remarkPlugins={remarkPlugins} components={markdownComponents}>
                  {source}
                </ReactMarkdown>
              ) : (
                <p className="markdown-empty">输入 Markdown 内容以查看实时预览。</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
