import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ChangeEvent,
} from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { List } from 'immutable';
import { useI18n } from './i18n/index';
import type { ZipToolCopy } from './types/zipTool';
import {
  zipEntriesAtom,
  zipLoadingAtom,
  zipErrorAtom,
  extractionProgressAtom,
  extractionSuccessAtom,
  selectedSourcesAtom,
  compressionProgressAtom,
  compressionUrlAtom,
  compressionErrorAtom,
  totalSelectedSizeAtom,
  type ZipEntryInfo,
  type SelectedSource,
} from './zipToolAtoms';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type ZipJsModule = typeof import('@zip.js/zip.js');

function formatBytes(bytes: number | undefined) {
  if (!bytes || Number.isNaN(bytes)) {
    return '–';
  }
  if (bytes === 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const size = bytes / 1024 ** exponent;
  return `${size.toFixed(size >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function createDownloadLink(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Delay revocation slightly to ensure the download finishes in Safari.
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 5000);
}

function hasDirectoryPicker(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

async function ensureZipModule(zipModuleRef: React.MutableRefObject<ZipJsModule | null>) {
  if (zipModuleRef.current) {
    return zipModuleRef.current;
  }
  const mod = await import('@zip.js/zip.js');
  mod.configure({ useWebWorkers: false });
  zipModuleRef.current = mod;
  return mod;
}

async function ensureDirectory(
  root: FileSystemDirectoryHandle,
  pathSegments: string[]
): Promise<FileSystemDirectoryHandle> {
  let currentHandle = root;
  for (const segment of pathSegments) {
    currentHandle = await currentHandle.getDirectoryHandle(segment, { create: true });
  }
  return currentHandle;
}

function splitPath(path: string) {
  return path
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function ZipTool() {
  const zipModuleRef = useRef<ZipJsModule | null>(null);
  const zipReaderRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const extractDirectoryHandleRef = useRef<FileSystemDirectoryHandle | null>(null);

  // Decompression state
  const [zipEntries, setZipEntries] = useAtom(zipEntriesAtom);
  const [zipLoading, setZipLoading] = useAtom(zipLoadingAtom);
  const [zipError, setZipError] = useAtom(zipErrorAtom);
  const [extractionProgress, setExtractionProgress] = useAtom(extractionProgressAtom);
  const [extractionSuccess, setExtractionSuccess] = useAtom(extractionSuccessAtom);

  // Compression state
  const [selectedSources, setSelectedSources] = useAtom(selectedSourcesAtom);
  const [compressionProgress, setCompressionProgress] = useAtom(compressionProgressAtom);
  const [compressionUrl, setCompressionUrl] = useAtom(compressionUrlAtom);
  const [compressionError, setCompressionError] = useAtom(compressionErrorAtom);
  const totalSelectedSize = useAtomValue(totalSelectedSizeAtom);

  const directoryPickerAvailable = useMemo(hasDirectoryPicker, []);
  const { translations } = useI18n();
  const zipCopy = translations.tools.zipTool as ZipToolCopy;
  const { intro, decompress, compress } = zipCopy.page;

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      if (zipReaderRef.current) {
        void zipReaderRef.current.close();
        zipReaderRef.current = null;
      }
      if (compressionUrl) {
        URL.revokeObjectURL(compressionUrl);
      }
    };
    // We intentionally leave compressionUrl out to avoid a revoke race when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetDecompression = useCallback(async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    if (zipReaderRef.current) {
      try {
        await zipReaderRef.current.close();
      } catch (error) {
        console.warn('Failed to close previous ZIP reader', error);
      }
      zipReaderRef.current = null;
    }
    setZipEntries(List());
    setZipError(null);
    setExtractionProgress(null);
    setExtractionSuccess(null);
    extractDirectoryHandleRef.current = null;
  }, [setZipEntries, setZipError, setExtractionProgress, setExtractionSuccess]);

  const handleClearDecompression = useCallback(() => {
    void resetDecompression();
  }, [resetDecompression]);

  const handleZipFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) {
        return;
      }

      setZipLoading(true);
      setZipError(null);
      setExtractionProgress(null);
      setExtractionSuccess(null);

      try {
        await resetDecompression();
        const zip = await ensureZipModule(zipModuleRef);
        const reader = new zip.ZipReader(new zip.BlobReader(file));
        const entries = await reader.getEntries();

        const preparedEntries = List(
          entries.map((entry: any, index: number) => ({
            id: `${entry.filename}-${index}`,
            name: entry.filename,
            size: entry.uncompressedSize ?? 0,
            isDirectory: entry.directory ?? false,
            entry,
          }))
        );

        zipReaderRef.current = reader;
        setZipEntries(preparedEntries);
      } catch (error) {
        setZipError(error instanceof Error ? error.message : String(error));
        await resetDecompression();
      } finally {
        setZipLoading(false);
      }
    },
    [resetDecompression, setZipLoading, setZipError, setExtractionProgress, setExtractionSuccess, setZipEntries]
  );

  const handleDownloadEntry = useCallback(async (entryInfo: ZipEntryInfo) => {
    if (entryInfo.isDirectory) {
      return;
    }
    setZipError(null);
    setExtractionProgress({
      targetName: entryInfo.name,
      current: 0,
      total: entryInfo.size || 0,
    });

    try {
      const zip = await ensureZipModule(zipModuleRef);
      const entry = entryInfo.entry;
      const writer = new zip.BlobWriter();
      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const blob = await entry.getData(writer, {
        signal: abortController.signal,
        onprogress: (index: number, max: number) => {
          setExtractionProgress({
            targetName: entryInfo.name,
            current: index,
            total: max || entryInfo.size || 0,
          });
        },
      });
      createDownloadLink(blob, entryInfo.name.split('/').pop() ?? entryInfo.name);
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') {
        return;
      }
      setZipError(error instanceof Error ? error.message : String(error));
    } finally {
      setExtractionProgress(null);
    }
  }, []);

  const handleExtractAllToDirectory = useCallback(async () => {
    if (zipEntries.size === 0) {
      return;
    }

    if (!directoryPickerAvailable) {
      setZipError(decompress.unsupportedError);
      return;
    }

    setZipError(null);
    setExtractionSuccess(null);

    // First, prompt user to select a directory
    let directoryHandle: FileSystemDirectoryHandle;
    try {
      directoryHandle = await (window as unknown as {
        showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
      }).showDirectoryPicker();
      extractDirectoryHandleRef.current = directoryHandle;
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') {
        return;
      }
      setZipError(error instanceof Error ? error.message : String(error));
      return;
    }

    // Then, extract all files to the selected directory
    try {
      const zip = await ensureZipModule(zipModuleRef);
      const abortController = new AbortController();
      abortControllerRef.current?.abort();
      abortControllerRef.current = abortController;

      for (const entryInfo of zipEntries) {
        const entry = entryInfo.entry;
        const segments = splitPath(entryInfo.name);
        if (segments.length === 0) {
          continue;
        }

        const parentSegments = entryInfo.isDirectory ? segments : segments.slice(0, -1);
        if (parentSegments.length > 0) {
          await ensureDirectory(directoryHandle, parentSegments);
        }

        if (entryInfo.isDirectory) {
          continue;
        }

        const parentHandle =
          parentSegments.length > 0
            ? await ensureDirectory(directoryHandle, parentSegments)
            : directoryHandle;
        const fileHandle = await parentHandle.getFileHandle(segments.at(-1) ?? entryInfo.name, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        setExtractionProgress({
          targetName: entryInfo.name,
          current: 0,
          total: entryInfo.size || 0,
        });
        const blob = await entry.getData(new zip.BlobWriter(), {
          signal: abortController.signal,
          onprogress: (index: number, max: number) => {
            setExtractionProgress({
              targetName: entryInfo.name,
              current: index,
              total: max || entryInfo.size || 0,
            });
          },
        });
        await writable.write(blob);
        await writable.close();
      }
      setExtractionProgress(null);
      setExtractionSuccess(
        `Successfully extracted ${zipEntries.size} ${zipEntries.size === 1 ? 'item' : 'items'} to ${directoryHandle.name}`
      );
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') {
        return;
      }
      setZipError(error instanceof Error ? error.message : String(error));
      setExtractionProgress(null);
    }
  }, [decompress.unsupportedError, directoryPickerAvailable, zipEntries]);

  const handleAddSources = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    // Convert FileList to array immediately
    const filesArray = Array.from(files);

    if (filesArray.length === 0) {
      return;
    }

    setCompressionError(null);
    setSelectedSources((previous) => {
      // Use Immutable List operations
      const newSources = filesArray.map((file) => {
        const relativePath =
          (file as File & { webkitRelativePath?: string }).webkitRelativePath?.trim() ?? '';
        const path = relativePath !== '' ? relativePath : file.name;
        const id = `${path}-${crypto.randomUUID()}`;
        return { id, path, file };
      });

      return previous.concat(newSources);
    });
  }, [setCompressionError, setSelectedSources]);

  const handleRemoveSource = useCallback((id: string) => {
    setSelectedSources((previous) => previous.filter((source) => source.id !== id));
  }, [setSelectedSources]);

  const handleClearSelected = useCallback(() => {
    setSelectedSources(List());
    setCompressionUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }
      return null;
    });
    setCompressionProgress(null);
    setCompressionError(null);
  }, [setSelectedSources, setCompressionUrl, setCompressionProgress, setCompressionError]);

  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);
  const hiddenDirectoryInputRef = useRef<HTMLInputElement | null>(null);
  const hiddenZipFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenFilePicker = useCallback(() => {
    console.log('handleOpenFilePicker called');
    console.log('hiddenFileInputRef.current:', hiddenFileInputRef.current);
    if (hiddenFileInputRef.current) {
      console.log('Clicking file input');
      hiddenFileInputRef.current.click();
    } else {
      console.error('hiddenFileInputRef.current is null!');
    }
  }, []);

  const handleOpenDirectoryPicker = useCallback(() => {
    console.log('handleOpenDirectoryPicker called');
    console.log('hiddenDirectoryInputRef.current:', hiddenDirectoryInputRef.current);
    if (hiddenDirectoryInputRef.current) {
      console.log('Clicking directory input');
      hiddenDirectoryInputRef.current.click();
    } else {
      console.error('hiddenDirectoryInputRef.current is null!');
    }
  }, []);

  const handleOpenZipFilePicker = useCallback(() => {
    hiddenZipFileInputRef.current?.click();
  }, []);

  const handleCompress = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (selectedSources.size === 0) {
        return;
      }

      setCompressionError(null);
      setCompressionProgress({ currentIndex: 0, total: selectedSources.size });

      try {
        const zip = await ensureZipModule(zipModuleRef);
        const blobWriter = new zip.BlobWriter('application/zip');
        const zipWriter = new zip.ZipWriter(blobWriter);

        for (let index = 0; index < selectedSources.size; index += 1) {
          const source = selectedSources.get(index)!;
          setCompressionProgress({
            currentIndex: index,
            total: selectedSources.size,
            currentFile: source.path,
          });
          await zipWriter.add(source.path, new zip.BlobReader(source.file));
        }

        setCompressionProgress({
          currentIndex: selectedSources.size,
          total: selectedSources.size,
        });

        const blob = await zipWriter.close();
        const nextUrl = URL.createObjectURL(blob);
        setCompressionUrl((previous) => {
          if (previous) {
            URL.revokeObjectURL(previous);
          }
          return nextUrl;
        });
      } catch (error) {
        setCompressionError(error instanceof Error ? error.message : String(error));
      } finally {
        setCompressionProgress(null);
      }
    },
    [selectedSources, setCompressionError, setCompressionProgress, setCompressionUrl]
  );

  return (
    <div className="card">
      {/* SEO Introduction */}
      <section style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.75rem' }}>
          {intro.title}
        </h1>
        <p style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>
          {intro.description}
        </p>
        <p style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--highlight-bg, #f0fdf4)',
          border: '1px solid var(--highlight-border, #86efac)',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          color: 'var(--highlight-text, #166534)'
        }}>
          {intro.localProcessing}
        </p>
      </section>

      {/* Side by Side Layout: 50% Decompress | 50% Compress */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Left: Decompress */}
        <section className="section">
        <header className="section-header">
          <h2>{decompress.title}</h2>
          <p>{decompress.description}</p>
        </header>
        <div className="form">
          {/* Hidden file input */}
          <input
            ref={hiddenZipFileInputRef}
            type="file"
            accept=".zip,application/zip"
            onChange={handleZipFileChange}
            disabled={zipLoading}
            hidden
          />

          {/* Nice button to trigger file picker */}
          <div className="field-actions" style={{ gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleOpenZipFilePicker}
              disabled={zipLoading}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem'
              }}
            >
              {decompress.fileInputLabel}
            </button>

            {/* Extract to folder button - only shown if browser supports it */}
            {zipEntries.size > 0 && !zipLoading && directoryPickerAvailable && (
              <button
                type="button"
                onClick={handleExtractAllToDirectory}
                disabled={Boolean(extractionProgress)}
                title={decompress.writeSupportedHelp}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem'
                }}
              >
                {decompress.extractButtonLabel}
              </button>
            )}
          </div>
        </div>
        {zipLoading && <p className="hint">{decompress.loadingMessage}</p>}
        {zipError && (
          <p className="error">{decompress.errorTemplate.replace('{message}', zipError)}</p>
        )}
        {extractionSuccess && (
          <p style={{ color: 'var(--success-color, #10b981)', marginTop: '0.5rem' }}>
            ✓ {extractionSuccess}
          </p>
        )}
        {extractionProgress && (
          <p className="hint">
            {decompress.progressTemplate
              .replace('{name}', extractionProgress.targetName)
              .replace('{current}', formatBytes(extractionProgress.current))
              .replace('{total}', formatBytes(extractionProgress.total))}
          </p>
        )}
        {zipEntries.size > 0 && (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{decompress.table.name}</th>
                    <th>{decompress.table.size}</th>
                    <th>{decompress.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {zipEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.name}</td>
                      <td>{entry.isDirectory ? decompress.table.directoryLabel : formatBytes(entry.size)}</td>
                      <td>
                        {entry.isDirectory ? (
                          <span className="hint">{decompress.table.noDownload}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDownloadEntry(entry)}
                            disabled={Boolean(extractionProgress)}
                          >
                            {decompress.table.downloadButton}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="field-actions" style={{ marginTop: '1rem', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleClearDecompression}
                disabled={zipLoading || Boolean(extractionProgress)}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem'
                }}
              >
                {decompress.clearButtonLabel}
              </button>
            </div>
          </>
        )}
        </section>

        {/* Right: Compress */}
        <section className="section">
        <header className="section-header">
          <h2>{compress.title}</h2>
          <p>{compress.description}</p>
        </header>
        <form className="form" onSubmit={handleCompress}>
          <div className="field-actions" style={{ gap: '0.75rem' }}>
            <button type="button" onClick={handleOpenFilePicker} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              {compress.addFilesButton}
            </button>
            <button type="button" onClick={handleOpenDirectoryPicker} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              {compress.addDirectoryButton}
            </button>
            <button type="button" onClick={handleClearSelected} disabled={selectedSources.size === 0} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              {compress.clearButton}
            </button>
          </div>
          <input
            ref={hiddenFileInputRef}
            type="file"
            multiple
            hidden
            onChange={(event) => {
              console.log('File input onChange triggered, files:', event.target.files?.length);
              handleAddSources(event.target.files);
              event.target.value = '';
            }}
          />
          <input
            ref={hiddenDirectoryInputRef}
            type="file"
            multiple
            hidden
            // @ts-expect-error - webkitdirectory is supported by Chromium based browsers.
            webkitdirectory="true"
            onChange={(event) => {
              console.log('Directory input onChange triggered, files:', event.target.files?.length);
              handleAddSources(event.target.files);
              event.target.value = '';
            }}
          />
          {selectedSources.size > 0 ? (
            <>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>{compress.table.path}</th>
                      <th>{compress.table.size}</th>
                      <th>{compress.table.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSources.map((source) => (
                      <tr key={source.id}>
                        <td>{source.path}</td>
                        <td>{formatBytes(source.file.size)}</td>
                        <td>
                          <button type="button" onClick={() => handleRemoveSource(source.id)}>
                            {compress.table.removeButton}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="hint">
                {compress.summaryTemplate
                  .replace('{count}', String(selectedSources.size))
                  .replace('{size}', formatBytes(totalSelectedSize))}
              </p>
              <div className="field-actions" style={{ gap: '0.75rem' }}>
                <button type="submit" disabled={Boolean(compressionProgress)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  {compress.startButton}
                </button>
              </div>
            </>
          ) : (
            <p className="hint">{compress.emptyHint}</p>
          )}
        </form>
        {compressionProgress && (
          <p className="hint">
            {compress.progressTemplate
              .replace(
                '{current}',
                String(
                  Math.min(
                    compressionProgress.currentFile
                      ? compressionProgress.currentIndex + 1
                      : compressionProgress.currentIndex,
                    compressionProgress.total
                  )
                )
              )
              .replace('{total}', String(compressionProgress.total))
              .replace(
                '{file}',
                compressionProgress.currentFile
                  ? compress.currentFileTemplate.replace('{file}', compressionProgress.currentFile)
                  : ''
              )}
          </p>
        )}
        {compressionError && (
          <p className="error">{compress.errorTemplate.replace('{message}', compressionError)}</p>
        )}
        {compressionUrl && (
          <div className="field-actions" style={{ gap: '0.75rem' }}>
            <a href={compressionUrl} download={compress.downloadName} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              {compress.downloadLabel}
            </a>
          </div>
        )}
        </section>
      </div>
    </div>
  );
}
