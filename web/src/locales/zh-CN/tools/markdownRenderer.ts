import type { ToolCopy } from '../../../i18n/types';

const markdownRenderer: ToolCopy = {
  meta: {
    label: 'Markdown 渲染器',
    pageTitle: 'Markdown 渲染器｜在线预览并导出 Markdown - tools.dev66.net',
    description:
      'Markdown 渲染器支持 GitHub 风格语法、实时双栏预览、主题切换与打印导出，适合撰写文档、README 与会议纪要。',
    keywords: [
      'Markdown 渲染',
      'Markdown 预览',
      '在线 Markdown',
      'GitHub Markdown',
      'Markdown 导出',
      'Markdown 编辑',
      'Markdown 打印',
      'Markdown 工具',
    ],
    fallbackLabel: 'Markdown 渲染工具',
    executionNote: 'Markdown 在浏览器本地渲染，可离线预览及打印敏感文档。',
  },
  page: {
    title: 'Markdown 渲染器：在线预览与导出',
    description:
      'Markdown 渲染器支持 GitHub 风格语法、实时双栏预览、代码高亮与一键打印，适合撰写 README、会议纪要和产品文档。',
    sample: [
      '# Markdown 示例',
      '',
      '欢迎使用 **Markdown 渲染器**！以下内容涵盖常见语法：',
      '',
      '- 列表项',
      '- [链接](https://dev66.net)',
      '- `行内代码`',
      '',
      '```ts',
      'function greet(name: string) {',
      '  return `你好，${name}`;',
      '}',
      '```',
      '',
      '| 阶段 | 说明 |',
      '| ---- | ---- |',
      '| 规划 | 明确目标 |',
      '| 开发 | 实现功能 |',
      '| 验证 | 手动测试 |',
      '',
      '> 支持 GFM 扩展，例如表格与任务列表。',
      '',
      '```mermaid',
      'sequenceDiagram',
      '  participant User',
      '  participant Renderer',
      '  User->>Renderer: 输入 Markdown',
      '  Renderer-->>User: 展示预览',
      '  User->>Renderer: 点击打印',
      '  Renderer-->>User: 打开打印视图',
      '```',
      '',
      '- [ ] 待完成事项',
      '- [x] 已完成事项',
    ].join('\n'),
    input: {
      title: 'Markdown 输入',
      description: '支持标题、列表、表格、代码块等常用语法。',
      placeholder: '在此输入 Markdown 内容...',
      charCount: {
        template: '{count} 字符',
        empty: '暂无内容',
      },
      gfmLabel: '启用 GFM 扩展（表格、任务列表等）',
      ariaLabel: 'Markdown 输入区域',
      buttons: {
        sample: '填充示例',
        clear: '清空',
      },
    },
    preview: {
      title: '实时预览',
      description: '刷新延迟低于 50ms，所见即所得。',
      empty: '输入 Markdown 内容以查看实时预览。',
      printButton: '打印',
      printAriaLabel: '打印 Markdown 预览',
    },
    printView: {
      heading: 'Markdown 渲染预览',
      windowTitle: 'Markdown 预览打印',
      empty: '没有可打印的内容。',
    },
    printFallback: {
      windowTitle: 'Markdown 预览打印',
    },
    mermaid: {
      ariaLabel: 'Mermaid 图表',
      renderError: '无法渲染 Mermaid 图表',
    },
    section: {
      title: '高效整理 Markdown 文档',
      description: '结合示例模板与打印导出，可快速生成可分享的排版成品。',
      bullets: [
        '通过启用 GFM 支持表格、任务列表和删除线，让项目文档与 GitHub 渲染保持一致。',
        '点击“打印”可将预览窗口直接导出为 PDF，适用于归档会议纪要或设计说明。',
        '建议定期复制 Markdown 原文备份至版本库，配合本工具预览即可即时校验排版效果。',
      ],
      hint: '所有渲染在本地完成，适用于内网环境或处理未公开的项目文档。',
    },
  },
};

export default markdownRenderer;
