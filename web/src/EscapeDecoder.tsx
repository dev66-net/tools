import { ChangeEvent, useMemo, useState } from 'react';
import { useI18n } from './i18n/index';

const CONTROL_OFFSET = 64;

type EscapeMode = 'auto' | 'json' | 'javascript' | 'python' | 'shell';

type ModeConfig = {
  key: Exclude<EscapeMode, 'auto'>;
  simpleEscapes: Record<string, string>;
  allowHex: boolean;
  allowUnicodeShort: boolean;
  allowUnicodeBrace: boolean;
  allowUnicodeLong: boolean;
  allowOctal: boolean;
  allowZeroEscape: boolean;
  allowLineContinuation: boolean;
  allowControlEscape: boolean;
  allowNamedUnicode: boolean;
  treatUnknownAsLiteral: boolean;
};

type DecodeAttempt =
  | { ok: true; result: string; warnings: string[] }
  | { ok: false; error: string; warnings: string[] };

type DecodeOutcome = {
  text: string;
  error: string;
  warnings: string[];
  modeUsed: Exclude<EscapeMode, 'auto'> | null;
};

const modeConfigs: Record<Exclude<EscapeMode, 'auto'>, ModeConfig> = {
  json: {
    key: 'json',
    simpleEscapes: {
      '"': '"',
      '\\': '\\',
      '/': '/',
      b: '\b',
      f: '\f',
      n: '\n',
      r: '\r',
      t: '\t',
    },
    allowHex: false,
    allowUnicodeShort: true,
    allowUnicodeBrace: false,
    allowUnicodeLong: false,
    allowOctal: false,
    allowZeroEscape: false,
    allowLineContinuation: false,
    allowControlEscape: false,
    allowNamedUnicode: false,
    treatUnknownAsLiteral: false,
  },
  javascript: {
    key: 'javascript',
    simpleEscapes: {
      '"': '"',
      "'": "'",
      '\\': '\\',
      '0': '\0',
      b: '\b',
      f: '\f',
      n: '\n',
      r: '\r',
      t: '\t',
      v: '\v',
    },
    allowHex: true,
    allowUnicodeShort: true,
    allowUnicodeBrace: true,
    allowUnicodeLong: false,
    allowOctal: true,
    allowZeroEscape: true,
    allowLineContinuation: true,
    allowControlEscape: false,
    allowNamedUnicode: false,
    treatUnknownAsLiteral: false,
  },
  python: {
    key: 'python',
    simpleEscapes: {
      '"': '"',
      "'": "'",
      '\\': '\\',
      '0': '\0',
      a: '\x07',
      b: '\b',
      f: '\f',
      n: '\n',
      r: '\r',
      t: '\t',
      v: '\v',
    },
    allowHex: true,
    allowUnicodeShort: true,
    allowUnicodeBrace: false,
    allowUnicodeLong: true,
    allowOctal: true,
    allowZeroEscape: true,
    allowLineContinuation: true,
    allowControlEscape: false,
    allowNamedUnicode: true,
    treatUnknownAsLiteral: false,
  },
  shell: {
    key: 'shell',
    simpleEscapes: {
      '"': '"',
      "'": "'",
      '\\': '\\',
      '0': '\0',
      a: '\x07',
      b: '\b',
      e: '\x1b',
      f: '\f',
      n: '\n',
      r: '\r',
      t: '\t',
      v: '\v',
      '?': '?',
    },
    allowHex: true,
    allowUnicodeShort: true,
    allowUnicodeBrace: false,
    allowUnicodeLong: true,
    allowOctal: true,
    allowZeroEscape: true,
    allowLineContinuation: true,
    allowControlEscape: true,
    allowNamedUnicode: false,
    treatUnknownAsLiteral: true,
  },
};

const autoOrder: Exclude<EscapeMode, 'auto'>[] = ['json', 'javascript', 'python', 'shell'];

type EscapeDecoderMessages = {
  errors: {
    unterminatedEscape: string;
    hexNotSupported: string;
    hexLength: string;
    unicodeNotSupported: string;
    unicodeBraceMissing: string;
    unicodeBraceInvalid: string;
    unicodeOutOfRange: string;
    unicodeShortNotSupported: string;
    unicodeShortLength: string;
    unicodeLongNotSupported: string;
    unicodeLongLength: string;
    namedUnicodeNotSupported: string;
    namedUnicodeMissing: string;
    controlNotSupported: string;
    controlMissing: string;
    octalNotSupported: string;
    unknownEscape: string;
    autoFailed: string;
  };
  warnings: {
    namedUnicode: string;
  };
};

type EscapeDecoderCopy = {
  title: string;
  description: string;
  inputs: {
    modeLabel: string;
    autoLabel: string;
    autoDescription: string;
    modeDescriptionFallback: string;
    valueLabel: string;
    placeholder: string;
  };
  modes: Record<Exclude<EscapeMode, 'auto'>, { label: string; description: string }>;
  results: {
    title: string;
    modeUsed: string;
    outputLabel: string;
    outputPlaceholder: string;
    jsonLabel: string;
    jsonEmpty: string;
    buttons: {
      copy: string;
      copied: string;
      clear: string;
    };
  };
  guidance: {
    title: string;
    description: string;
    bullets: string[];
    hint: string;
  };
  messages: EscapeDecoderMessages;
};

function isHexDigit(char: string): boolean {
  return /[0-9a-f]/i.test(char);
}

function parseHexDigits(value: string, start: number, length: number): { code: number; nextIndex: number } | null {
  if (start + length > value.length) {
    return null;
  }
  const segment = value.slice(start, start + length);
  if (!/^([0-9a-f]{1,8})$/iu.test(segment)) {
    return null;
  }
  return { code: Number.parseInt(segment, 16), nextIndex: start + length - 1 };
}

function decodeWithConfig(
  input: string,
  config: ModeConfig,
  messages: EscapeDecoderMessages
): DecodeAttempt {
  const warnings: string[] = [];
  let result = '';

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]!;
    if (char !== '\\') {
      result += char;
      continue;
    }

    index += 1;
    if (index >= input.length) {
      return { ok: false, error: messages.errors.unterminatedEscape, warnings };
    }

    const next = input[index]!;

    if (
      config.allowLineContinuation &&
      (next === '\n' || next === '\r' || next === '\u2028' || next === '\u2029')
    ) {
      if (next === '\r' && input[index + 1] === '\n') {
        index += 1;
      }
      continue;
    }

    if (next === 'x') {
      if (!config.allowHex) {
        return { ok: false, error: messages.errors.hexNotSupported, warnings };
      }
      const segment = input.slice(index + 1, index + 3);
      if (segment.length < 2 || !isHexDigit(segment[0]!) || !isHexDigit(segment[1]!)) {
        return { ok: false, error: messages.errors.hexLength, warnings };
      }
      result += String.fromCharCode(Number.parseInt(segment, 16));
      index += 2;
      continue;
    }

    if (next === 'u') {
      if (!config.allowUnicodeShort && !config.allowUnicodeBrace) {
        return { ok: false, error: messages.errors.unicodeNotSupported, warnings };
      }
      if (config.allowUnicodeBrace && input[index + 1] === '{') {
        const closing = input.indexOf('}', index + 2);
        if (closing === -1) {
          return { ok: false, error: messages.errors.unicodeBraceMissing, warnings };
        }
        const hexDigits = input.slice(index + 2, closing);
        if (!hexDigits || /[^0-9a-f]/iu.test(hexDigits)) {
          return { ok: false, error: messages.errors.unicodeBraceInvalid, warnings };
        }
        const codePoint = Number.parseInt(hexDigits, 16);
        if (codePoint > 0x10ffff) {
          return { ok: false, error: messages.errors.unicodeOutOfRange, warnings };
        }
        result += String.fromCodePoint(codePoint);
        index = closing;
        continue;
      }
      if (!config.allowUnicodeShort) {
        return { ok: false, error: messages.errors.unicodeShortNotSupported, warnings };
      }
      const parsed = parseHexDigits(input, index + 1, 4);
      if (!parsed) {
        return { ok: false, error: messages.errors.unicodeShortLength, warnings };
      }
      result += String.fromCharCode(parsed.code);
      index = parsed.nextIndex;
      continue;
    }

    if (next === 'U') {
      if (!config.allowUnicodeLong) {
        return { ok: false, error: messages.errors.unicodeLongNotSupported, warnings };
      }
      const parsed = parseHexDigits(input, index + 1, 8);
      if (!parsed) {
        return { ok: false, error: messages.errors.unicodeLongLength, warnings };
      }
      if (parsed.code > 0x10ffff) {
        return { ok: false, error: messages.errors.unicodeOutOfRange, warnings };
      }
      result += String.fromCodePoint(parsed.code);
      index = parsed.nextIndex;
      continue;
    }

    if (next === 'N') {
      if (!config.allowNamedUnicode) {
        return { ok: false, error: messages.errors.namedUnicodeNotSupported, warnings };
      }
      const closing = input.indexOf('}', index + 1);
      if (input[index + 1] !== '{' || closing === -1) {
        return { ok: false, error: messages.errors.namedUnicodeMissing, warnings };
      }
      const name = input.slice(index + 2, closing);
      warnings.push(messages.warnings.namedUnicode.replace('{name}', name));
      result += `\\N{${name}}`;
      index = closing;
      continue;
    }

    if (next === 'c') {
      if (!config.allowControlEscape) {
        return { ok: false, error: messages.errors.controlNotSupported, warnings };
      }
      if (index + 1 >= input.length) {
        return { ok: false, error: messages.errors.controlMissing, warnings };
      }
      index += 1;
      const controlChar = input[index]!;
      const upper = controlChar.toUpperCase();
      const code = upper.charCodeAt(0);
      const controlCode = upper === '@' ? 0 : (code - CONTROL_OFFSET + 256) % 32;
      result += String.fromCharCode(controlCode);
      continue;
    }

    if (next === '0' && config.allowZeroEscape && !config.allowOctal) {
      result += '\0';
      continue;
    }

    if (/[0-7]/.test(next)) {
      if (!config.allowOctal) {
        return {
          ok: false,
          error: messages.errors.octalNotSupported.replace('{value}', next),
          warnings,
        };
      }
      let digits = next;
      let consumed = 0;
      while (consumed < 2 && index + 1 < input.length && /[0-7]/.test(input[index + 1]!)) {
        index += 1;
        digits += input[index];
        consumed += 1;
      }
      const value = Number.parseInt(digits, 8) & 0xff;
      result += String.fromCharCode(value);
      continue;
    }

    const mapped = config.simpleEscapes[next];
    if (mapped !== undefined) {
      result += mapped;
      continue;
    }

    if (config.treatUnknownAsLiteral) {
      result += next;
      continue;
    }

    return {
      ok: false,
      error: messages.errors.unknownEscape.replace('{value}', next),
      warnings,
    };
  }

  return { ok: true, result, warnings };
}

function decodeValue(input: string, mode: EscapeMode, messages: EscapeDecoderMessages): DecodeOutcome {
  if (!input) {
    return { text: '', error: '', warnings: [], modeUsed: null };
  }

  if (mode === 'auto') {
    let lastError = '';
    for (const candidate of autoOrder) {
      const attempt = decodeWithConfig(input, modeConfigs[candidate], messages);
      if (attempt.ok) {
        return { text: attempt.result, error: '', warnings: attempt.warnings, modeUsed: candidate };
      }
      lastError = attempt.error;
    }
    return {
      text: '',
      error: lastError || messages.errors.autoFailed,
      warnings: [],
      modeUsed: null,
    };
  }

  const attempt = decodeWithConfig(input, modeConfigs[mode], messages);
  if (!attempt.ok) {
    return { text: '', error: attempt.error, warnings: attempt.warnings, modeUsed: mode };
  }
  return { text: attempt.result, error: '', warnings: attempt.warnings, modeUsed: mode };
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn('Clipboard write failed, fallback to document.execCommand', error);
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch (fallbackError) {
    console.error('Fallback clipboard write failed', fallbackError);
    return false;
  }
}

export default function EscapeDecoder() {
  const { translations } = useI18n();
  const copy = translations.tools.escapeDecoder.page as EscapeDecoderCopy;
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<EscapeMode>('auto');
  const [copied, setCopied] = useState(false);

  const modeOptions = [
    { value: 'auto' as EscapeMode, label: copy.inputs.autoLabel, description: copy.inputs.autoDescription },
    ...autoOrder.map((value) => ({
      value,
      label: copy.modes[value].label,
      description: copy.modes[value].description,
    })),
  ];

  const messages = copy.messages;
  const outcome = useMemo(() => decodeValue(inputValue, mode, messages), [inputValue, mode, messages]);
  const jsonPreview = useMemo(() => (outcome.text ? JSON.stringify(outcome.text) : ''), [outcome.text]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
    setCopied(false);
  };

  const handleModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setMode(event.target.value as EscapeMode);
    setCopied(false);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(outcome.text);
    setCopied(success);
    if (success) {
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <main className="card">
      <h1>{copy.title}</h1>
      <p className="card-description">{copy.description}</p>
      <section className="section">
        <label htmlFor="escape-mode">{copy.inputs.modeLabel}</label>
        <select id="escape-mode" value={mode} onChange={handleModeChange}>
          {modeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="hint">
          {modeOptions.find((option) => option.value === mode)?.description ?? copy.inputs.modeDescriptionFallback}
        </p>
        <label htmlFor="escape-input">{copy.inputs.valueLabel}</label>
        <textarea
          id="escape-input"
          rows={6}
          value={inputValue}
          onChange={handleChange}
          placeholder={copy.inputs.placeholder}
        />
      </section>
      <section className="section">
        <header className="section-header">
          <h2>{copy.results.title}</h2>
          {outcome.modeUsed ? (
            <span className="hint">
              {copy.results.modeUsed.replace('{mode}', copy.modes[outcome.modeUsed].label)}
            </span>
          ) : null}
        </header>
        {outcome.error ? <p className="error">{outcome.error}</p> : null}
        {outcome.warnings.length > 0 ? (
          <ul className="note-list">
            {outcome.warnings.map((warning) => (
              <li key={warning} className="warning">
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
        <label htmlFor="escape-output">{copy.results.outputLabel}</label>
        <textarea
          id="escape-output"
          rows={5}
          readOnly
          value={outcome.text}
          placeholder={copy.results.outputPlaceholder}
        />
        <div className="decoded-hex">
          <span className="hint">{copy.results.jsonLabel}</span>
          <pre>{jsonPreview || copy.results.jsonEmpty}</pre>
        </div>
        <div className="actions">
          <button type="button" className="secondary" onClick={handleCopy} disabled={!outcome.text}>
            {copied ? copy.results.buttons.copied : copy.results.buttons.copy}
          </button>
          <button type="button" className="secondary" onClick={() => setInputValue('')}>
            {copy.results.buttons.clear}
          </button>
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>{copy.guidance.title}</h2>
          <p>{copy.guidance.description}</p>
        </header>
        <ul>
          {copy.guidance.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <p className="hint">{copy.guidance.hint}</p>
      </section>
    </main>
  );
}
