import { ChangeEvent, useMemo, useState } from 'react';

const CONTROL_OFFSET = 64;

type EscapeMode = 'auto' | 'json' | 'javascript' | 'python' | 'shell';

type ModeConfig = {
  key: Exclude<EscapeMode, 'auto'>;
  label: string;
  description: string;
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
    label: 'JSON 字符串',
    description: '符合 JSON 标准：允许 \\b \\f \\n \\r \\t \\\" \\/ \\\\ 和 \\uXXXX。',
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
    label: 'JavaScript 字符串',
    description: '支持 ES 字符串中的 \\xHH、\\uXXXX、\\u{...}、八进制与常见转义。',
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
    label: 'Python 字符串',
    description: '支持 \\x、\\u、\\U、八进制、\\a 和常用转义，遵循 Python 3 语义。',
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
    label: "Shell $'...'",
    description: '模拟 Bash ANSI-C 风格的转义，支持 \\x、\\u、\\U、\\c 等。',
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

function decodeWithConfig(input: string, config: ModeConfig): DecodeAttempt {
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
      return { ok: false, error: '检测到未完成的转义序列，末尾缺少对应字符。', warnings };
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
        return { ok: false, error: '当前模式不支持 \\xHH 转义。', warnings };
      }
      const segment = input.slice(index + 1, index + 3);
      if (segment.length < 2 || !isHexDigit(segment[0]!) || !isHexDigit(segment[1]!)) {
        return { ok: false, error: '\\x 后应紧跟两个十六进制字符。', warnings };
      }
      result += String.fromCharCode(Number.parseInt(segment, 16));
      index += 2;
      continue;
    }

    if (next === 'u') {
      if (!config.allowUnicodeShort && !config.allowUnicodeBrace) {
        return { ok: false, error: '当前模式不支持 \\u 转义。', warnings };
      }
      if (config.allowUnicodeBrace && input[index + 1] === '{') {
        const closing = input.indexOf('}', index + 2);
        if (closing === -1) {
          return { ok: false, error: '\\u{...} 缺少右花括号。', warnings };
        }
        const hexDigits = input.slice(index + 2, closing);
        if (!hexDigits || /[^0-9a-f]/iu.test(hexDigits)) {
          return { ok: false, error: '\\u{...} 内只能包含十六进制字符。', warnings };
        }
        const codePoint = Number.parseInt(hexDigits, 16);
        if (codePoint > 0x10ffff) {
          return { ok: false, error: 'Unicode 码点超出有效范围。', warnings };
        }
        result += String.fromCodePoint(codePoint);
        index = closing;
        continue;
      }
      if (!config.allowUnicodeShort) {
        return { ok: false, error: '当前模式不支持 \\uXXXX 形式。', warnings };
      }
      const parsed = parseHexDigits(input, index + 1, 4);
      if (!parsed) {
        return { ok: false, error: '\\u 需要紧跟四个十六进制字符。', warnings };
      }
      result += String.fromCharCode(parsed.code);
      index = parsed.nextIndex;
      continue;
    }

    if (next === 'U') {
      if (!config.allowUnicodeLong) {
        return { ok: false, error: '当前模式不支持 \\UXXXXXXXX 转义。', warnings };
      }
      const parsed = parseHexDigits(input, index + 1, 8);
      if (!parsed) {
        return { ok: false, error: '\\U 需要紧跟八个十六进制字符。', warnings };
      }
      if (parsed.code > 0x10ffff) {
        return { ok: false, error: 'Unicode 码点超出有效范围。', warnings };
      }
      result += String.fromCodePoint(parsed.code);
      index = parsed.nextIndex;
      continue;
    }

    if (next === 'N') {
      if (!config.allowNamedUnicode) {
        return { ok: false, error: '当前模式不支持 \\N{...} 命名字符。', warnings };
      }
      const closing = input.indexOf('}', index + 1);
      if (input[index + 1] !== '{' || closing === -1) {
        return { ok: false, error: '\\N{} 必须包含有效的名称。', warnings };
      }
      const name = input.slice(index + 2, closing);
      warnings.push(`暂未实现命名 Unicode 字符 \\N{${name}}，原样输出。`);
      result += `\\N{${name}}`;
      index = closing;
      continue;
    }

    if (next === 'c') {
      if (!config.allowControlEscape) {
        return { ok: false, error: '当前模式不支持 \\cX 控制字符写法。', warnings };
      }
      if (index + 1 >= input.length) {
        return { ok: false, error: '\\c 缺少对应的控制字符。', warnings };
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
        return { ok: false, error: `检测到八进制转义 \\${next}，但当前模式不支持。`, warnings };
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

    return { ok: false, error: `检测到未支持的转义：\\${next}`, warnings };
  }

  return { ok: true, result, warnings };
}

function decodeValue(input: string, mode: EscapeMode): DecodeOutcome {
  if (!input) {
    return { text: '', error: '', warnings: [], modeUsed: null };
  }

  if (mode === 'auto') {
    let lastError = '';
    for (const candidate of autoOrder) {
      const attempt = decodeWithConfig(input, modeConfigs[candidate]);
      if (attempt.ok) {
        return { text: attempt.result, error: '', warnings: attempt.warnings, modeUsed: candidate };
      }
      lastError = attempt.error;
    }
    return { text: '', error: lastError || '未能解析该转义字符串。', warnings: [], modeUsed: null };
  }

  const attempt = decodeWithConfig(input, modeConfigs[mode]);
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

const modeOptions: { value: EscapeMode; label: string; description: string }[] = [
  { value: 'auto', label: '自动检测', description: '依次尝试 JSON / JavaScript / Python / Shell 语法' },
  ...autoOrder.map((value) => ({
    value,
    label: modeConfigs[value].label,
    description: modeConfigs[value].description,
  })),
];

export default function EscapeDecoder() {
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<EscapeMode>('auto');
  const [copied, setCopied] = useState(false);

  const outcome = useMemo(() => decodeValue(inputValue, mode), [inputValue, mode]);
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
      <h1>转义字符解码器：解析多语言转义</h1>
      <p className="card-description">
        兼容 JSON、JavaScript、Python、Shell 等转义规则，自动识别 Unicode、十六进制与八进制序列，帮助恢复原始文本或代码片段。
      </p>
      <section className="section">
        <label htmlFor="escape-mode">解析模式</label>
        <select id="escape-mode" value={mode} onChange={handleModeChange}>
          {modeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="hint">
          {modeOptions.find((option) => option.value === mode)?.description ?? '选择解析模式'}
        </p>
        <label htmlFor="escape-input">转义字符串</label>
        <textarea
          id="escape-input"
          rows={6}
          value={inputValue}
          onChange={handleChange}
          placeholder={"例如：\\u4f60\\u597d\\n\\x48\\x65\\x6c\\x6c\\x6f"}
        />
      </section>
      <section className="section">
        <header className="section-header">
          <h2>解码结果</h2>
          {outcome.modeUsed ? <span className="hint">使用模式：{modeConfigs[outcome.modeUsed].label}</span> : null}
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
        <label htmlFor="escape-output">纯文本</label>
        <textarea id="escape-output" rows={5} readOnly value={outcome.text} placeholder="解码后的文本" />
        <div className="decoded-hex">
          <span className="hint">JSON 再编码</span>
          <pre>{jsonPreview || '—'}</pre>
        </div>
        <div className="actions">
          <button type="button" className="secondary" onClick={handleCopy} disabled={!outcome.text}>
            {copied ? '已复制' : '复制文本'}
          </button>
          <button type="button" className="secondary" onClick={() => setInputValue('')}>
            清空输入
          </button>
        </div>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>常见应用场景</h2>
          <p>在调试日志、接口数据或脚本模板时，可结合不同模式快速还原原文。</p>
        </header>
        <ul>
          <li>选择“自动”即可自动识别常见语言，若识别不准确，可手动切换模式再次解析。</li>
          <li>通过“JSON 再编码”快速获取可直接粘贴到代码中的安全字符串表示。</li>
          <li>处理多层转义时，解码结果再次粘贴到输入区域即可继续剥离下一层。</li>
        </ul>
        <p className="hint">工具仅在本地运行，可用于排查包含密钥或私密信息的配置与日志。</p>
      </section>
    </main>
  );
}
