import type { ZipToolCopy } from '../../../types/zipTool';

const zipTool: ZipToolCopy = {
  meta: {
    label: 'ZIP 在线工具',
    pageTitle: 'ZIP 在线工具 | 浏览器内压缩与解压 - tools.dev66.net',
    description: '使用 WebAssembly 驱动的 ZIP 引擎，在浏览器内完成压缩、解压与文件下载，数据始终留在本地。',
    keywords: ['zip', '在线解压', '在线压缩', 'zip 工具', 'zip wasm', 'zip js'],
    fallbackLabel: 'ZIP 工具',
    executionNote: '完全在浏览器中运行，文件不会上传至服务器。',
  },
  page: {
    intro: {
      title: 'ZIP 在线压缩与解压工具',
      description: '免费在线 ZIP 压缩和解压工具，支持查看 ZIP 文件内容、提取单个文件、批量压缩文件。无需安装软件，在浏览器中即可完成所有操作。',
      localProcessing: '🔒 所有操作均在您的浏览器本地执行（使用 JavaScript），文件不会上传到任何服务器，确保您的数据完全隐私和安全。',
    },
    decompress: {
      title: 'ZIP 解压',
      description: '选择本地 ZIP 文件，查看条目列表，可单独下载或（在支持的浏览器中）解压到指定文件夹。',
      fileInputLabel: '选择 ZIP 文件',
      extractButtonLabel: '解压到本地文件夹',
      clearButtonLabel: '清除全部',
      writeSupportedHelp: '点击后选择目标文件夹，所有内容会直接写入该位置。',
      writeUnsupportedHelp: '当前浏览器暂不支持直接写入本地文件夹。',
      unsupportedError: '当前浏览器无法直接解压到本地文件夹，请尝试使用最新版 Chrome 或 Edge。',
      loadingMessage: '正在读取 ZIP 内容…',
      errorTemplate: '解压失败：{message}',
      progressTemplate: '正在处理 {name} ({current} / {total})',
      table: {
        name: '文件名',
        size: '大小',
        actions: '操作',
        directoryLabel: '目录',
        downloadButton: '下载',
        noDownload: '无可下载内容',
      },
    },
    compress: {
      title: 'ZIP 压缩',
      description: '添加多个文件或整个文件夹，在浏览器内生成 ZIP 压缩包并显示进度。',
      addFilesButton: '添加文件',
      addDirectoryButton: '添加文件夹',
      clearButton: '清空列表',
      emptyHint: '尚未选择文件或文件夹。',
      summaryTemplate: '已选择 {count} 个项目，共 {size}',
      startButton: '开始压缩',
      progressTemplate: '压缩进度：{current}/{total}{file}',
      currentFileTemplate: ' - {file}',
      errorTemplate: '压缩失败：{message}',
      downloadLabel: '下载压缩文件',
      downloadName: 'archive.zip',
      table: {
        path: '路径',
        size: '大小',
        actions: '操作',
        removeButton: '移除',
      },
    },
  },
};

export default zipTool;
