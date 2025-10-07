import type { ToolCopy } from '../../../i18n/types';

const markdownRenderer: ToolCopy = {
  meta: {
    label: 'Markdown Renderer',
    pageTitle: 'Markdown Renderer | Preview and Export Markdown Online - tools.dev66.net',
    description:
      'Preview GitHub-flavored Markdown with a live split view, theme switcher and print/export options—ideal for docs, READMEs and meeting notes.',
    keywords: [
      'markdown renderer',
      'markdown preview',
      'online markdown',
      'github markdown',
      'markdown export',
      'markdown viewer',
      'markdown print',
      'markdown tool',
    ],
    fallbackLabel: 'Markdown renderer',
    executionNote: 'Rendering happens locally so drafts and private notes stay secure.',
  },
  page: {
    title: 'Markdown Renderer: Live Preview and Export',
    description:
      'Render Markdown with GitHub-style formatting, live preview, syntax highlighting and one-click printing to PDF for READMEs, design notes and meeting minutes.',
    sample: [
      '# Markdown Sample',
      '',
      'Welcome to the **Markdown Renderer**! This snippet shows common syntax:',
      '',
      '- List items',
      '- [Links](https://dev66.net)',
      '- `Inline code`',
      '',
      '```ts',
      'function greet(name: string) {',
      '  return `Hello, ${name}!`;',
      '}',
      '```',
      '',
      '| Stage | Notes |',
      '| ----- | ----- |',
      '| Plan  | Define the goal |',
      '| Build | Implement features |',
      '| Verify| Manual testing |',
      '',
      '> Supports GFM extensions such as tables and task lists.',
      '',
      '```mermaid',
      'sequenceDiagram',
      '  participant User',
      '  participant Renderer',
      '  User->>Renderer: Enter Markdown',
      '  Renderer-->>User: Show preview',
      '  User->>Renderer: Click print',
      '  Renderer-->>User: Open print view',
      '```',
      '',
      '- [ ] Todo item',
      '- [x] Completed item',
    ].join('\n'),
    input: {
      title: 'Markdown input',
      description: 'Supports headings, lists, tables, code blocks and more.',
      placeholder: 'Type your Markdown here…',
      charCount: {
        template: '{count} characters',
        empty: 'No content yet',
      },
      gfmLabel: 'Enable GFM extensions (tables, task lists, strikethrough)',
      ariaLabel: 'Markdown input area',
      buttons: {
        sample: 'Load sample',
        clear: 'Clear',
      },
    },
    preview: {
      title: 'Live preview',
      description: 'Updates in under 50 ms for a true WYSIWYG experience.',
      empty: 'Start typing Markdown to see the preview here.',
      printButton: 'Print',
      printAriaLabel: 'Print Markdown preview',
    },
    printView: {
      heading: 'Markdown preview',
      windowTitle: 'Markdown Preview Print',
      empty: 'No printable content.',
    },
    printFallback: {
      windowTitle: 'Markdown Preview Print',
    },
    mermaid: {
      ariaLabel: 'Mermaid diagram',
      renderError: 'Failed to render Mermaid diagram',
    },
    section: {
      title: 'Work efficiently with Markdown',
      description: 'Use templates and print export to generate polished documents quickly.',
      bullets: [
        'Enable GFM support for tables, task lists and strikethrough to match GitHub rendering.',
        'Click “Print” to export the preview directly as PDF for sharing meeting notes or design briefs.',
        'Keep the original Markdown in version control and rely on this preview to check formatting instantly.',
      ],
      hint: 'Rendering stays in the browser, ideal for private repositories or internal documentation workflows.',
    },
  },
};

export default markdownRenderer;
