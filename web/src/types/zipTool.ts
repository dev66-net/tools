import type { ToolCopy } from '../i18n/types';

export type ZipToolPageCopy = {
  intro: {
    title: string;
    description: string;
    localProcessing: string;
  };
  decompress: {
    title: string;
    description: string;
    fileInputLabel: string;
    extractButtonLabel: string;
    clearButtonLabel: string;
    writeSupportedHelp: string;
    writeUnsupportedHelp: string;
    unsupportedError: string;
    loadingMessage: string;
    errorTemplate: string;
    progressTemplate: string;
    table: {
      name: string;
      size: string;
      actions: string;
      directoryLabel: string;
      downloadButton: string;
      noDownload: string;
    };
  };
  compress: {
    title: string;
    description: string;
    addFilesButton: string;
    addDirectoryButton: string;
    clearButton: string;
    emptyHint: string;
    summaryTemplate: string;
    startButton: string;
    progressTemplate: string;
    currentFileTemplate: string;
    errorTemplate: string;
    downloadLabel: string;
    downloadName: string;
    table: {
      path: string;
      size: string;
      actions: string;
      removeButton: string;
    };
  };
};

export type ZipToolCopy = ToolCopy<ZipToolPageCopy>;
