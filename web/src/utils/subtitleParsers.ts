// Subtitle parser utilities for various subtitle formats
// Supports: SRT, VTT, ASS/SSA, LRC, aisubtitle (bilibili JSON)

export interface SubtitleEntry {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
}

export interface SubtitleParser {
  name: string;
  detect(input: string): boolean;
  parse(input: string): SubtitleEntry[];
}

// Time formatting utilities
function pad(num: number, length: number = 2): string {
  return num.toString().padStart(length, '0');
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}.${pad(ms, 3)}`;
}

// SRT time format: "00:00:01,000"
function parseSRTTime(timeStr: string): number {
  const [hms, msStr] = timeStr.split(',');
  const [h, m, s] = hms.split(':').map(Number);
  return h * 3600 + m * 60 + s + Number(msStr) / 1000;
}

// VTT time format: "00:00:01.000"
function parseVTTTime(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    const [h, m, secMs] = parts;
    const [sec, ms] = secMs.split('.');
    return Number(h) * 3600 + Number(m) * 60 + Number(sec) + Number(ms || 0) / 1000;
  } else if (parts.length === 2) {
    const [m, secMs] = parts;
    const [sec, ms] = secMs.split('.');
    return Number(m) * 60 + Number(sec) + Number(ms || 0) / 1000;
  }
  return 0;
}

// LRC time format: "[00:01.04]"
function parseLRCTime(timeStr: string): number {
  const match = timeStr.match(/\[(\d+):(\d+)\.(\d+)\]/);
  if (match) {
    const [, min, sec, cs] = match;
    return Number(min) * 60 + Number(sec) + Number(cs) / 100;
  }
  return 0;
}

// ASS time format: "0:00:01.00"
function parseASSTime(timeStr: string): number {
  const parts = timeStr.split(':');
  const [h, m, secCs] = parts;
  const [sec, cs] = secCs.split('.');
  return Number(h) * 3600 + Number(m) * 60 + Number(sec) + Number(cs || 0) / 100;
}

// ===== AISubtitle Parser (bilibili JSON) =====
export class AISubtitleParser implements SubtitleParser {
  name = 'aisubtitle';

  detect(input: string): boolean {
    try {
      const data = JSON.parse(input.trim());
      return (
        typeof data === 'object' &&
        data !== null &&
        data.type === 'AIsubtitle' &&
        Array.isArray(data.body)
      );
    } catch {
      return false;
    }
  }

  parse(input: string): SubtitleEntry[] {
    const data = JSON.parse(input.trim());
    const entries: SubtitleEntry[] = [];

    if (!Array.isArray(data.body)) {
      return entries;
    }

    data.body.forEach((item: { from: number; to: number; content: string; sid: number }) => {
      entries.push({
        index: item.sid || entries.length + 1,
        startTime: formatTime(item.from),
        endTime: formatTime(item.to),
        text: item.content.trim(),
      });
    });

    return entries;
  }
}

// ===== SRT Parser =====
export class SRTParser implements SubtitleParser {
  name = 'srt';

  detect(input: string): boolean {
    const trimmed = input.trim();
    // SRT must have "-->" separator and numeric index lines
    return trimmed.includes('-->') && /^\d+\s*$/m.test(trimmed);
  }

  parse(input: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = [];
    const blocks = input.trim().split(/\n\s*\n/);

    blocks.forEach((block) => {
      const lines = block.trim().split('\n');
      if (lines.length < 3) {
        return;
      }

      const indexLine = lines[0].trim();
      const timeLine = lines[1].trim();
      const textLines = lines.slice(2);

      const indexMatch = indexLine.match(/^(\d+)$/);
      if (!indexMatch) {
        return;
      }

      const timeMatch = timeLine.match(/^([\d:,]+)\s*-->\s*([\d:,]+)/);
      if (!timeMatch) {
        return;
      }

      const [, start, end] = timeMatch;
      const startSec = parseSRTTime(start);
      const endSec = parseSRTTime(end);

      entries.push({
        index: Number(indexMatch[1]),
        startTime: formatTime(startSec),
        endTime: formatTime(endSec),
        text: textLines.join('\n').trim(),
      });
    });

    return entries;
  }
}

// ===== VTT Parser =====
export class VTTParser implements SubtitleParser {
  name = 'vtt';

  detect(input: string): boolean {
    return input.trim().startsWith('WEBVTT');
  }

  parse(input: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = [];
    const lines = input.split('\n');
    let currentIndex = 1;
    let i = 0;

    // Skip header
    while (i < lines.length && !lines[i].includes('-->')) {
      i++;
    }

    while (i < lines.length) {
      const line = lines[i].trim();

      if (line.includes('-->')) {
        const timeMatch = line.match(/([\d:.]+)\s*-->\s*([\d:.]+)/);
        if (timeMatch) {
          const [, start, end] = timeMatch;
          const startSec = parseVTTTime(start);
          const endSec = parseVTTTime(end);

          i++;
          const textLines: string[] = [];
          while (i < lines.length && lines[i].trim() !== '') {
            textLines.push(lines[i].trim());
            i++;
          }

          if (textLines.length > 0) {
            entries.push({
              index: currentIndex++,
              startTime: formatTime(startSec),
              endTime: formatTime(endSec),
              text: textLines.join('\n'),
            });
          }
        }
      }

      i++;
    }

    return entries;
  }
}

// ===== ASS/SSA Parser =====
export class ASSParser implements SubtitleParser {
  name = 'ass';

  detect(input: string): boolean {
    return input.includes('[Events]') && input.includes('Dialogue:');
  }

  parse(input: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = [];
    const lines = input.split('\n');
    let inEvents = false;
    let formatLine: string | null = null;
    let textIndex = -1;
    let startIndex = -1;
    let endIndex = -1;

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (trimmed === '[Events]') {
        inEvents = true;
        return;
      }

      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        inEvents = false;
        return;
      }

      if (inEvents && trimmed.startsWith('Format:')) {
        formatLine = trimmed.substring(7).trim();
        const fields = formatLine.split(',').map((f) => f.trim().toLowerCase());
        textIndex = fields.indexOf('text');
        startIndex = fields.indexOf('start');
        endIndex = fields.indexOf('end');
        return;
      }

      if (inEvents && trimmed.startsWith('Dialogue:')) {
        const dialogueLine = trimmed.substring(9).trim();
        const parts = dialogueLine.split(',');

        if (startIndex >= 0 && endIndex >= 0 && textIndex >= 0) {
          const startTime = parts[startIndex];
          const endTime = parts[endIndex];
          const text = parts.slice(textIndex).join(',').trim();

          const startSec = parseASSTime(startTime);
          const endSec = parseASSTime(endTime);

          entries.push({
            index: entries.length + 1,
            startTime: formatTime(startSec),
            endTime: formatTime(endSec),
            text,
          });
        }
      }
    });

    return entries;
  }
}

// ===== LRC Parser =====
export class LRCParser implements SubtitleParser {
  name = 'lrc';

  detect(input: string): boolean {
    return /\[\d+:\d+\.\d+\]/.test(input);
  }

  parse(input: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = [];
    const lines = input.split('\n');

    lines.forEach((line) => {
      const trimmed = line.trim();
      const match = trimmed.match(/^(\[\d+:\d+\.\d+\])(.*)$/);

      if (match) {
        const [, timeTag, text] = match;
        const startSec = parseLRCTime(timeTag);

        entries.push({
          index: entries.length + 1,
          startTime: formatTime(startSec),
          endTime: '', // LRC doesn't have end time
          text: text.trim(),
        });
      }
    });

    // Calculate end times based on next entry's start time
    for (let i = 0; i < entries.length - 1; i++) {
      entries[i].endTime = entries[i + 1].startTime;
    }

    // Set last entry's end time (add 3 seconds as default)
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      const lastStartMatch = lastEntry.startTime.match(/(\d+):(\d+):(\d+)\.(\d+)/);
      if (lastStartMatch) {
        const [, h, m, s, ms] = lastStartMatch;
        const lastStartSec = Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
        lastEntry.endTime = formatTime(lastStartSec + 3);
      }
    }

    return entries;
  }
}

// ===== Parser Manager =====
export class SubtitleParserManager {
  private parsers: SubtitleParser[] = [
    new AISubtitleParser(),
    new VTTParser(),
    new ASSParser(),
    new SRTParser(),
    new LRCParser(),
  ];

  detect(input: string): SubtitleParser | null {
    for (const parser of this.parsers) {
      if (parser.detect(input)) {
        return parser;
      }
    }
    return null;
  }

  parseAuto(input: string): { parser: SubtitleParser | null; entries: SubtitleEntry[] } {
    const parser = this.detect(input);
    if (!parser) {
      return { parser: null, entries: [] };
    }

    try {
      const entries = parser.parse(input);
      return { parser, entries };
    } catch {
      return { parser: null, entries: [] };
    }
  }
}
