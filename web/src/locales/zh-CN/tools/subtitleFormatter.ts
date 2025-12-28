import type { ToolCopy } from '../../../i18n/types';

const subtitleFormatter: ToolCopy = {
  meta: {
    label: '字幕格式化',
    pageTitle: '字幕格式化工具｜在线解析 SRT、VTT、ASS、LRC 字幕 - tools.dev66.net',
    description:
      '自动识别并格式化字幕文件（SRT、VTT、ASS/SSA、LRC、aisubtitle JSON），转换为带时间轴的可读文本。所有解析在浏览器本地完成。',
    keywords: [
      '字幕格式化',
      '字幕转换',
      'SRT 解析',
      'VTT 字幕',
      'ASS 字幕',
      'LRC 歌词',
      'aisubtitle',
      '字幕工具',
      '在线字幕解析',
    ],
    fallbackLabel: '字幕工具',
    executionNote: '浏览器本地解析字幕内容，无需上传文件，保护隐私安全。',
  },
  page: {
    title: '字幕格式化工具',
    description: '智能识别字幕格式并转换为人类易读的带时间轴文本',
    inputPanel: {
      title: '输入区域',
      description: '粘贴字幕内容或上传文件。支持 SRT、VTT、ASS/SSA、LRC 和 aisubtitle 格式。',
      placeholder: '在此粘贴字幕内容或上传文件...',
      uploadButton: '选择文件',
      sampleButton: '加载示例',
      clearButton: '清空',
    },
    outputPanel: {
      title: '格式化输出',
      description: '解析后的字幕以时间范围和文本的形式展示',
      placeholder: '格式化结果会显示在这里...',
      copyButton: '复制结果',
      copiedButton: '已复制！',
      keepTimelineLabel: '保留时间线',
      previewButton: '预览',
    },
    preview: {
      title: '字幕预览',
      closeButton: '关闭',
    },
    status: {
      idle: '等待输入',
      detected: '已识别：{format}',
      parsed: '从 {format} 解析了 {count} 条字幕',
      error: '解析错误',
      processing: '处理中...',
    },
    errors: {
      unsupportedFormat: '不支持的字幕格式。请使用 SRT、VTT、ASS/SSA、LRC 或 aisubtitle JSON。',
      parseError: '解析字幕内容失败，请检查格式是否正确。',
      fileReadError: '读取文件失败，请重试。',
      copyError: '复制到剪贴板失败，请手动复制。',
    },
    tips: {
      title: '支持的格式与使用提示',
      description: '本工具自动检测并解析多种字幕格式，输出清晰易读的文本。',
      bullets: [
        'SRT (SubRip)：最常见的字幕格式，包含数字序号和 --> 时间分隔符',
        'VTT (WebVTT)：网页标准字幕格式，以 "WEBVTT" 开头',
        'ASS/SSA (高级字幕)：包含 [Events] 章节和 Dialogue 行的格式',
        'LRC (歌词)：歌词格式，使用 [mm:ss.xx] 时间标签',
        'aisubtitle：B 站 JSON 格式，包含 type:"AIsubtitle" 和 body 数组',
      ],
      hint: '所有处理在浏览器本地进行，不会发送数据到服务器，确保字幕内容的隐私安全。',
    },
    sample: `1
00:00:01,040 --> 00:00:03,920
你怎么看量化投资吉姆西蒙斯的大奖章

2
00:00:03,920 --> 00:00:07,060
基金30年来净收益达39%

3
00:00:07,060 --> 00:00:08,620
这证明他确实有效`,
  },
};

export default subtitleFormatter;
