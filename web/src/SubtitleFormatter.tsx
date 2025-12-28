import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SubtitleEntry, SubtitleParserManager } from './utils/subtitleParsers';
import { useI18n } from './i18n/index';

type SubtitleFormatterCopy = {
  title: string;
  description: string;
  inputPanel: {
    title: string;
    description: string;
    placeholder: string;
    uploadButton: string;
    sampleButton: string;
    clearButton: string;
  };
  outputPanel: {
    title: string;
    description: string;
    placeholder: string;
    copyButton: string;
    copiedButton: string;
    keepTimelineLabel: string;
    previewButton: string;
  };
  preview: {
    title: string;
    closeButton: string;
  };
  status: {
    idle: string;
    detected: string;
    parsed: string;
    error: string;
    processing: string;
  };
  errors: {
    unsupportedFormat: string;
    parseError: string;
    fileReadError: string;
    copyError: string;
  };
  tips: {
    title: string;
    description: string;
    bullets: string[];
    hint: string;
  };
  sample: string;
};

const DEFAULT_SAMPLE = `1
00:00:01,040 --> 00:00:03,920
你怎么看量化投资吉姆西蒙斯的大奖章

2
00:00:03,920 --> 00:00:07,060
基金30年来净收益达39%

3
00:00:07,060 --> 00:00:08,620
这证明他确实有效`;

export default function SubtitleFormatter() {
  const [inputText, setInputText] = useState<string>('');
  const [parsedEntries, setParsedEntries] = useState<SubtitleEntry[]>([]);
  const [detectedFormat, setDetectedFormat] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [keepTimeline, setKeepTimeline] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [columnCount, setColumnCount] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const parserManager = useMemo(() => new SubtitleParserManager(), []);

  const { translations } = useI18n();
  const copy = translations.tools.subtitleFormatter.page as SubtitleFormatterCopy;

  // Auto-parse when input changes
  useEffect(() => {
    const trimmed = inputText.trim();

    if (!trimmed) {
      setParsedEntries([]);
      setDetectedFormat('');
      setError('');
      return;
    }

    try {
      const { parser, entries } = parserManager.parseAuto(trimmed);

      if (!parser) {
        setParsedEntries([]);
        setDetectedFormat('');
        setError(copy.errors.unsupportedFormat);
        return;
      }

      setParsedEntries(entries);
      setDetectedFormat(parser.name.toUpperCase());
      setError('');
    } catch (parseError) {
      setParsedEntries([]);
      setDetectedFormat('');
      const errorMsg = parseError instanceof Error ? parseError.message : copy.errors.parseError;
      setError(errorMsg);
    }
  }, [inputText, parserManager, copy.errors.unsupportedFormat, copy.errors.parseError]);

  // Update column count based on window size
  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth;
      if (width >= 1400) setColumnCount(4);
      else if (width >= 1024) setColumnCount(3);
      else if (width >= 768) setColumnCount(2);
      else setColumnCount(1);
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);

  // Read file as text
  const readFileAsText = useCallback(
    (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error(copy.errors.fileReadError));
          }
        };
        reader.onerror = () => reject(new Error(copy.errors.fileReadError));
        reader.readAsText(file, 'utf-8');
      });
    },
    [copy.errors.fileReadError]
  );

  // Handle file upload
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void processFile(file);
    }
    event.target.value = '';
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError('');
    try {
      const content = await readFileAsText(file);
      setInputText(content);
    } catch (fileError) {
      const errorMsg = fileError instanceof Error ? fileError.message : copy.errors.fileReadError;
      setError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleLoadSample = () => {
    setInputText(copy.sample || DEFAULT_SAMPLE);
  };

  const handleClear = () => {
    setInputText('');
    setParsedEntries([]);
    setDetectedFormat('');
    setError('');
    setCopied(false);
  };

  const handleCopy = async () => {
    if (parsedEntries.length === 0) {
      return;
    }

    const formatted = formatEntriesAsText(parsedEntries);

    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (copyError) {
      const errorMsg = copyError instanceof Error ? copyError.message : copy.errors.copyError;
      setError(errorMsg);
    }
  };

  const formatEntriesAsText = (entries: SubtitleEntry[]): string => {
    if (keepTimeline) {
      return entries
        .map((entry) => {
          const timeRange = entry.endTime ? `${entry.startTime} → ${entry.endTime}` : entry.startTime;
          return `${entry.index}. [${timeRange}]\n   ${entry.text}`;
        })
        .join('\n\n');
    } else {
      return entries.map((entry) => entry.text.trim()).join('\n');
    }
  };

  const formatMessage = (template: string, replacements: Record<string, string | number>): string => {
    return template.replace(/\{(\w+)\}/gu, (_, key: string) => String(replacements[key] ?? ''));
  };

  const statusMessage = useMemo(() => {
    if (isProcessing) {
      return copy.status.processing;
    }
    if (error) {
      return copy.status.error;
    }
    if (!inputText.trim()) {
      return copy.status.idle;
    }
    if (detectedFormat && parsedEntries.length > 0) {
      return formatMessage(copy.status.parsed, { count: parsedEntries.length, format: detectedFormat });
    }
    if (detectedFormat) {
      return formatMessage(copy.status.detected, { format: detectedFormat });
    }
    return copy.status.idle;
  }, [isProcessing, error, inputText, detectedFormat, parsedEntries.length, copy.status]);

  const outputText = useMemo(() => {
    if (parsedEntries.length === 0) {
      return '';
    }
    return formatEntriesAsText(parsedEntries);
  }, [parsedEntries, keepTimeline]);

  // Split entries into columns for preview
  const columnizedEntries = useMemo(() => {
    if (parsedEntries.length === 0) return [];

    const itemsPerColumn = Math.ceil(parsedEntries.length / columnCount);
    const result: SubtitleEntry[][] = [];

    for (let i = 0; i < columnCount; i++) {
      const start = i * itemsPerColumn;
      const end = Math.min(start + itemsPerColumn, parsedEntries.length);
      if (start < parsedEntries.length) {
        result.push(parsedEntries.slice(start, end));
      }
    }

    return result;
  }, [parsedEntries, columnCount]);

  return (
    <div className="json-wrapper">
      <header className="json-header">
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
      </header>

      <div className="json-columns">
        {/* Input Panel */}
        <section className="json-panel">
          <header className="json-panel-header">
            <div>
              <h2>{copy.inputPanel.title}</h2>
              <p>{copy.inputPanel.description}</p>
            </div>
            <span className={`json-status ${error ? 'danger' : detectedFormat ? 'success' : 'neutral'}`}>
              {statusMessage}
            </span>
          </header>

          <textarea
            className="subtitle-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={copy.inputPanel.placeholder}
            rows={12}
            spellCheck={false}
          />

          {error && <p className="json-message danger">{error}</p>}

          <div className="json-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.srt,.vtt,.ass,.ssa,.lrc,.json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              aria-label="Upload subtitle file"
            />
            <button type="button" className="secondary" onClick={triggerFileDialog} disabled={isProcessing}>
              {copy.inputPanel.uploadButton}
            </button>
            <button type="button" className="secondary" onClick={handleLoadSample} disabled={isProcessing}>
              {copy.inputPanel.sampleButton}
            </button>
            <button type="button" className="secondary" onClick={handleClear} disabled={!inputText && !error}>
              {copy.inputPanel.clearButton}
            </button>
          </div>
        </section>

        {/* Output Panel */}
        <section className="json-panel">
          <header className="json-panel-header">
            <div>
              <h2>{copy.outputPanel.title}</h2>
              <p>{copy.outputPanel.description}</p>
            </div>
            <span className={`json-status ${parsedEntries.length > 0 ? 'success' : 'neutral'}`}>
              {parsedEntries.length > 0 ? `${parsedEntries.length} entries` : ''}
            </span>
          </header>

          <textarea
            className="subtitle-output"
            value={outputText}
            readOnly
            placeholder={copy.outputPanel.placeholder}
            rows={12}
            spellCheck={false}
          />

          <div className="json-actions">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={keepTimeline}
                onChange={(e) => setKeepTimeline(e.target.checked)}
              />
              {copy.outputPanel.keepTimelineLabel}
            </label>
            <button type="button" onClick={handleCopy} disabled={parsedEntries.length === 0}>
              {copied ? copy.outputPanel.copiedButton : copy.outputPanel.copyButton}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setShowPreview(true)}
              disabled={parsedEntries.length === 0}
            >
              {copy.outputPanel.previewButton}
            </button>
          </div>
        </section>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="subtitle-preview-modal" onClick={() => setShowPreview(false)}>
          <div className="subtitle-preview-dialog" onClick={(e) => e.stopPropagation()}>
            <header className="subtitle-preview-header">
              <h2>{copy.preview.title}</h2>
              <button
                type="button"
                className="subtitle-preview-close"
                onClick={() => setShowPreview(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </header>
            <div className="subtitle-preview-content">
              {columnizedEntries.map((columnEntries, columnIndex) => (
                <div key={columnIndex} className="subtitle-preview-column">
                  {columnEntries.map((entry) => (
                    <div key={entry.index} className="subtitle-preview-item">
                      <div className="subtitle-preview-text">{entry.text}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
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
    </div>
  );
}
