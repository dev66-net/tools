import type { ToolCopy } from '../../../i18n/types';

const subtitleFormatter: ToolCopy = {
  meta: {
    label: 'Subtitle Formatter',
    pageTitle: 'Subtitle Formatter | Convert SRT, VTT, ASS, LRC Subtitles to Text - tools.dev66.net',
    description:
      'Automatically detect and format subtitle files (SRT, VTT, ASS/SSA, LRC, aisubtitle JSON) into readable text with timestamps. All processing happens locally in your browser.',
    keywords: [
      'subtitle formatter',
      'subtitle converter',
      'srt to text',
      'vtt parser',
      'ass subtitle',
      'lrc lyrics',
      'aisubtitle',
      'subtitle parser',
      'online subtitle tool',
    ],
    fallbackLabel: 'Subtitle',
    executionNote: 'All parsing runs locally in your browser. Files are never uploaded to any server.',
  },
  page: {
    title: 'Subtitle Formatter',
    description: 'Parse and format subtitle files into human-readable text with timestamps',
    inputPanel: {
      title: 'Input',
      description: 'Paste subtitle content or upload a file. Supports SRT, VTT, ASS/SSA, LRC, and aisubtitle formats.',
      placeholder: 'Paste subtitle content here or upload a file...',
      uploadButton: 'Choose File',
      sampleButton: 'Load Sample',
      clearButton: 'Clear',
    },
    outputPanel: {
      title: 'Formatted Output',
      description: 'Parsed subtitles displayed in a readable format with time ranges',
      placeholder: 'Formatted subtitles will appear here...',
      copyButton: 'Copy Result',
      copiedButton: 'Copied!',
      keepTimelineLabel: 'Keep timeline',
      previewButton: 'Preview',
    },
    preview: {
      title: 'Subtitle Preview',
      closeButton: 'Close',
    },
    status: {
      idle: 'Waiting for input',
      detected: 'Detected: {format}',
      parsed: '{count} entries from {format}',
      error: 'Parse error',
      processing: 'Processing...',
    },
    errors: {
      unsupportedFormat: 'Unsupported subtitle format. Please use SRT, VTT, ASS/SSA, LRC, or aisubtitle JSON.',
      parseError: 'Failed to parse subtitle content. Please check the format.',
      fileReadError: 'Failed to read file. Please try again.',
      copyError: 'Failed to copy to clipboard. Please copy manually.',
    },
    tips: {
      title: 'Supported Formats & Tips',
      description: 'This tool automatically detects and parses various subtitle formats into a clean, readable output.',
      bullets: [
        'SRT (SubRip): Most common format with numeric indexes and --> time separator',
        'VTT (WebVTT): Web standard format starting with "WEBVTT" header',
        'ASS/SSA (Advanced SubStation): Format with [Events] section and Dialogue lines',
        'LRC (Lyrics): Song lyrics format with [mm:ss.xx] time tags',
        'aisubtitle: Bilibili JSON format with type:"AIsubtitle" and body array',
      ],
      hint: 'All processing happens in your browser. No data is sent to any server, ensuring your subtitle content remains private.',
    },
    sample: `1
00:00:01,040 --> 00:00:03,920
How do you view quantitative investing?

2
00:00:03,920 --> 00:00:07,060
The fund's 30-year net return reached 39%

3
00:00:07,060 --> 00:00:08,620
This proves it's truly effective`,
  },
};

export default subtitleFormatter;
