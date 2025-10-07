import type { ToolCopy } from '../../../i18n/types';

const jsonFormatter: ToolCopy = {
  meta: {
    label: 'JSON 格式化',
    pageTitle: 'JSON 格式化器｜在线格式化与压缩 JSON - tools.dev66.net',
    description:
      'JSON 格式化器支持美化、压缩、语法校验与主题切换，并提供示例与复制功能，适合调试 API 返回与配置文件。',
    keywords: [
      'JSON 格式化',
      'JSON 校验',
      'JSON 压缩',
      'JSON beautify',
      'JSON minify',
      'JSON parser',
      'API 调试',
      '在线工具',
    ],
    fallbackLabel: 'JSON 格式化工具',
    executionNote: '浏览器本地解析与格式化 JSON，不会发送数据至网络。',
  },
  page: {
    title: 'JSON 格式化器：在线美化与压缩',
    description:
      '快速格式化或压缩 JSON 文本，自动检测语法错误并支持深浅色主题，适合调试 API、配置文件与日志。',
    inputPanel: {
      title: '原始输入',
      description: '粘贴 JSON 内容，点击按钮格式化或压缩。',
      buttons: {
        pretty: '格式化',
        compact: '压缩',
        sample: '填充示例',
        clear: '清空',
      },
    },
    outputPanel: {
      title: '格式化输出',
      description: '成功解析后会显示在此处，可复制到剪贴板。',
      placeholder: '格式化结果会显示在这里。',
      buttons: {
        copy: '复制结果',
        copied: '已复制',
        clear: '清空结果',
      },
    },
    statuses: {
      empty: '空输入',
      parseError: '解析错误',
      parseSuccess: '解析成功',
      waiting: '等待处理',
      formatted: '已格式化',
      minified: '已压缩',
    },
    errors: {
      parseFallback: 'JSON 解析失败，请检查输入内容。',
      copyFallback: '无法复制到剪贴板，请手动复制。',
    },
    tips: {
      title: 'JSON 调试小贴士',
      description: '借助格式化结果和状态提示，可以快速定位字段错误并准备 API 示例。',
      bullets: [
        '使用“填充示例”快速演示格式化流程，便于向团队成员展示使用方法。',
        '切换至“压缩”模式可以得到最短的 JSON 串，适合嵌入查询参数或节省带宽。',
        '遇到解析失败时查看状态与错误信息，通常能精准定位缺失的逗号或引号。',
      ],
      hint: '本工具完全在浏览器中运行，不会上传数据，可放心格式化包含敏感信息的响应。',
    },
  },
};

export default jsonFormatter;
