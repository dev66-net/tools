import type { ZipToolCopy } from '../../../types/zipTool';

const zipTool: ZipToolCopy = {
  meta: {
    label: 'ZIP Utility',
    pageTitle: 'ZIP Utility | Compress and Extract ZIP Archives Online - tools.dev66.net',
    description:
      'Compress folders, extract archives, and download individual entries using a fast in-browser ZIP engine powered by WebAssembly.',
    keywords: [
      'zip tool',
      'zip extractor',
      'zip compressor',
      'zip online',
      'unzip online',
      'browser zip',
      'zip js',
      'wasm zip',
    ],
    fallbackLabel: 'ZIP utility',
    executionNote: 'Runs fully in your browser—files never leave your device.',
  },
  page: {
    intro: {
      title: 'Online ZIP Compressor & Extractor',
      description: 'Free online tool to compress files into ZIP archives and extract files from ZIP archives. Support for viewing ZIP contents, extracting individual files, and batch compression.',
      localProcessing: '🔒 All operations are performed locally in your browser using JavaScript. Your files are never uploaded to any server, ensuring complete privacy and security.',
    },
    decompress: {
      title: 'Extract ZIP archives',
      description:
        'Pick a ZIP file to browse its entries, download selected files, or extract everything into a chosen local folder when supported.',
      fileInputLabel: 'Choose ZIP file',
      extractButtonLabel: 'Extract to Local Folder',
      clearButtonLabel: 'Clear All',
      writeSupportedHelp: 'Select a destination folder and all entries will be written locally.',
      writeUnsupportedHelp: 'Your browser does not yet allow writing directly to local folders.',
      unsupportedError: 'This browser does not support extracting straight into a local folder.',
      loadingMessage: 'Reading archive contents…',
      errorTemplate: 'Extract failed: {message}',
      progressTemplate: 'Processing {name} ({current} / {total})',
      table: {
        name: 'Entry',
        size: 'Size',
        actions: 'Actions',
        directoryLabel: 'Directory',
        downloadButton: 'Download',
        noDownload: 'Nothing to download',
      },
    },
    compress: {
      title: 'Create ZIP archive',
      description: 'Add files or whole folders, track progress, and generate a ZIP without uploading anything.',
      addFilesButton: 'Add files',
      addDirectoryButton: 'Add folder',
      clearButton: 'Clear list',
      emptyHint: 'No files selected yet.',
      summaryTemplate: 'Selected {count} items • {size}',
      startButton: 'Start compression',
      progressTemplate: 'Compression progress: {current}/{total}{file}',
      currentFileTemplate: ' - {file}',
      errorTemplate: 'Compression failed: {message}',
      downloadLabel: 'Download ZIP',
      downloadName: 'archive.zip',
      table: {
        path: 'Path',
        size: 'Size',
        actions: 'Actions',
        removeButton: 'Remove',
      },
    },
  },
};

export default zipTool;
