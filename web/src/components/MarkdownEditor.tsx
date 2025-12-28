import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { githubLight } from '@uiw/codemirror-theme-github';
import { EditorView } from '@codemirror/view';
import { useAutoResize } from '../hooks/useAutoResize';

// Sample markdown content
const sampleMarkdown = `# Markdown Editor

This is a **professional** Markdown editor with syntax highlighting and auto-resize.

## Features

- Real-time preview
- Syntax highlighting
- Dark/Light theme support
- Auto-height adjustment

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

## Code Example

Inline code: \`const x = 42\`

## Lists

1. First item
2. Second item
   - Nested item
   - Another nested item

## Tables

| Feature | Status |
|---------|--------|
| Syntax | ✅ |
| Themes | ✅ |
| Auto-resize | ✅ |`;

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number; // Optional - will use flex layout if not provided
  theme?: 'light' | 'dark' | 'auto';
  extensions?: any[];
  className?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = memo(({
  value,
  onChange,
  placeholder = '输入 Markdown 文档...',
  minHeight = 120,
  maxHeight, // Optional - removed default to use flex layout
  theme: themeProp = 'auto',
  extensions = [],
  className = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Determine color scheme
  const [scheme, setScheme] = useState<'light' | 'dark'>(() => {
    if (themeProp !== 'auto') {
      return themeProp;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Listen for system theme changes when theme is 'auto'
  useEffect(() => {
    if (themeProp !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event: MediaQueryListEvent) => {
      setScheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [themeProp]);

  // Markdown extensions with syntax highlighting (cached)
  const markdownExtensions = useMemo(() => [
    markdown(),
    javascript({ jsx: true }),
    // Add more language support as needed
    // python(),
    // css(),
    // html(),
    // Custom extension for auto-resize
    EditorView.theme({
      '&': {
        height: '100%',
      },
      '.scroller': {
        overflow: 'auto',
      },
      '.cm-content': {
        padding: '12px',
        minHeight: `${minHeight}px`,
        flex: 1, // Allow content to fill available space
      },
    }),
    ...extensions,
  ], [minHeight, extensions]);

  // Theme configuration (cached)
  const editorTheme = useMemo(() => {
    return scheme === 'dark' ? oneDark : githubLight;
  }, [scheme]);

  // Basic setup options (cached)
  const basicSetup = useMemo(() => ({
    foldGutter: true,
    highlightActiveLine: true,
    highlightActiveLineGutter: true,
    lineNumbers: false,
    dropCursor: false,
    allowMultipleSelections: false,
    indentOnInput: true,
    bracketMatching: true,
    closeBrackets: true,
    autocompletion: true,
    searchKeymap: true,
  }), []);

  // Debounced onChange handler (300ms delay for performance)
  const debouncedOnChange = useCallback((val: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onChange(val);
    }, 300);
  }, [onChange]);

  // Handle immediate change for responsiveness (for cursor position updates)
  const handleChange = useCallback((val: string) => {
    // Use debounced callback for actual value changes
    debouncedOnChange(val);
  }, [debouncedOnChange]);

  // Auto resize for CodeMirror container
  useAutoResize(editorRef, value, {
    minHeight,
    maxHeight,
    debounce: 100,
  });

  // Memoize the container style to prevent re-renders
  const containerStyle = useMemo(() => {
    const style = {
      minHeight: `${minHeight}px`,
      display: 'flex',
      flexDirection: 'column' as const,
      height: '0', // Allow flex to control height
      flex: 1,
    } as const;

    // Only set maxHeight if provided (for backwards compatibility)
    if (maxHeight) {
      style.maxHeight = `${maxHeight}px`;
    }

    return style;
  }, [minHeight, maxHeight]);

  return (
    <div
      ref={editorRef}
      className={`markdown-editor-container ${className}`}
      style={containerStyle}
    >
      <CodeMirror
        value={value}
        extensions={markdownExtensions}
        theme={editorTheme}
        basicSetup={basicSetup}
        onChange={handleChange}
        height="auto"
        placeholder={placeholder}
        style={{
          flex: 1,
          overflow: 'hidden',
        }}
      />
    </div>
  );
});

// Set display name for debugging
MarkdownEditor.displayName = 'MarkdownEditor';

// Export sample markdown for testing
export { sampleMarkdown };

export default MarkdownEditor;