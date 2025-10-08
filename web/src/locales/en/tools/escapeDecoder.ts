import type { ToolCopy } from '../../../i18n/types';

const escapeDecoder: ToolCopy = {
  meta: {
    label: 'Escape Decoder',
    pageTitle: 'Escape Decoder | Unescape Strings from JSON, JS, Python and Shell - tools.dev66.net',
    description:
      'Decode and re-encode escaped strings for JSON, JavaScript, Python, Shell and more. Helpful for debugging logs, configs and scripts.',
    keywords: [
      'escape decoder',
      'string unescape',
      'json unescape',
      'shell escape',
      'python escape',
      'unicode escape',
      'escape tool',
      'developer tools',
    ],
    fallbackLabel: 'Escape decoder',
    executionNote: 'String decoding happens in the browser so layered escapes can be peeled offline.',
  },
  page: {
    title: 'Escape Decoder: Unescape Strings Across Languages',
    description:
      'Decode escaped strings from JSON, JavaScript, Python or Shell. Automatically recognises Unicode, hexadecimal and octal sequences so you can restore original text.',
    inputs: {
      modeLabel: 'Parsing mode',
      autoLabel: 'Auto detect',
      autoDescription: 'Try JSON, JavaScript, Python and Shell rules in order.',
      modeDescriptionFallback: 'Pick a parsing mode to view specific behaviour.',
      valueLabel: 'Escaped string',
      placeholder: 'e.g. \\u4f60\\u597d\\n\\x48\\x65\\x6c\\x6c\\x6f',
    },
    modes: {
      json: {
        label: 'JSON string',
        description: 'Supports standard JSON escapes: \\b \\f \\n \\r \\t \\\" \\/ \\\\ and \\uXXXX.',
      },
      javascript: {
        label: 'JavaScript string',
        description: 'Handles ES escapes including \\xHH, \\uXXXX, \\u{...}, octal and control sequences.',
      },
      python: {
        label: 'Python string',
        description: 'Supports \\x, \\u, \\U, octal, \\a and other escapes following Python 3 semantics.',
      },
      shell: {
        label: "Shell $'...'", 
        description: 'Emulates Bash ANSI-C escapes including \\x, \\u, \\U, \\c and more.',
      },
    },
    results: {
      title: 'Decoded result',
      modeUsed: 'Detected mode: {mode}',
      outputLabel: 'Plain text',
      outputPlaceholder: 'Decoded text appears here',
      jsonLabel: 'JSON re-encode',
      jsonEmpty: '—',
      buttons: {
        copy: 'Copy text',
        copied: 'Copied',
        clear: 'Clear input',
      },
    },
    guidance: {
      title: 'When to Use It',
      description: 'Switch between modes while inspecting logs, API payloads or script templates to restore readable text.',
      bullets: [
        'Auto detect covers the most common languages; switch manually if the decoded output looks incorrect.',
        'Use the “JSON re-encode” view to grab a safe string literal for code or configuration files.',
        'For multi-layer escapes, paste the decoded output back into the input to peel the next layer.',
      ],
      hint: 'Decoding happens entirely in your browser so sensitive tokens or secrets stay private.',
    },
    messages: {
      errors: {
        unterminatedEscape: 'Unfinished escape sequence at the end of the string.',
        hexNotSupported: 'This mode does not support \\xHH escapes.',
        hexLength: '\\x must be followed by two hexadecimal digits.',
        unicodeNotSupported: 'This mode does not support \\u escapes.',
        unicodeBraceMissing: '\\u{...} is missing the closing brace.',
        unicodeBraceInvalid: '\\u{...} can only contain hexadecimal digits.',
        unicodeOutOfRange: 'Code point is outside the valid Unicode range.',
        unicodeShortNotSupported: 'This mode does not support the \\uXXXX form.',
        unicodeShortLength: '\\u should be followed by four hexadecimal digits.',
        unicodeLongNotSupported: 'This mode does not support \\UXXXXXXXX escapes.',
        unicodeLongLength: '\\U should be followed by eight hexadecimal digits.',
        namedUnicodeNotSupported: 'This mode does not support \\N{...} named characters.',
        namedUnicodeMissing: '\\N{} must contain a valid character name.',
        controlNotSupported: 'This mode does not support \\cX control-character escapes.',
        controlMissing: '\\c requires a following control character.',
        octalNotSupported: 'Octal escape \\{value} is not supported in this mode.',
        unknownEscape: 'Encountered unsupported escape: \\{value}',
        autoFailed: 'Could not decode the escape sequence with the available modes.',
      },
      warnings: {
        namedUnicode: 'Named Unicode escape \\N{{name}} is not implemented yet; keeping it literal.',
      },
    },
  },
};

export default escapeDecoder;
