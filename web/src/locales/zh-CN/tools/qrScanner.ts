import type { ToolCopy } from '../../../i18n/types';

const qrScanner: ToolCopy = {
  meta: {
    label: '二维码识别器',
    pageTitle: '二维码识别器｜上传图片解析 QR Code - tools.dev66.net',
    description:
      '二维码识别器支持拖拽、粘贴或上传图片，自动识别二维码内容，支持旋转校正和模糊补偿，适合校验二维码和提取链接。',
    keywords: [
      '二维码识别',
      '二维码解析',
      'QR code scanner',
      '二维码提取',
      '上传二维码',
      '在线扫码',
      '二维码解码',
      '二维码工具',
    ],
    fallbackLabel: '二维码识别工具',
    executionNote: '浏览器本地解码图片像素，不会上传图像或识别结果。',
  },
  page: {
    title: '二维码识别器：上传图片或粘贴二维码',
    description:
      '二维码识别器支持拖拽、粘贴或上传图片，自动旋转校正模糊二维码，快速提取二维码内的链接、文本或指令内容。',
    dropzone: {
      instruction: '粘贴图片到此区域，或拖拽 / 选择本地图片文件',
      chooseButton: '选择图片',
      status: '正在识别中…',
    },
    sources: {
      pastedImage: '粘贴图片',
    },
    previewLabel: '预览',
    previewAlt: '二维码预览',
    result: {
      heading: '识别结果',
      placeholder: '识别内容会显示在这里',
      copyButtonLabel: '复制结果',
    },
    errors: {
      notImage: '请选择图片文件',
      decodeFailed: '未能识别二维码：{name}',
      generic: '识别失败，请重试',
      copy: '复制失败',
      canvasUnavailable: '处理画布不可用',
      contextUnavailable: '无法获取绘图上下文',
      fileRead: '无法读取文件，请重试',
      fileReadGeneric: '读取文件失败，请重试',
    },
    tips: {
      title: '二维码识别最佳实践',
      description: '保证图片清晰且二维码占据主体位置，可大幅提升识别成功率。',
      bullets: [
        '支持直接粘贴截图或使用手机扫描二维码后发送到电脑再上传处理。',
        '若遇到旋转或倾斜的二维码，可多次尝试，识别器会自动尝试多角度校正。',
        '复制结果前请确认内容来源可靠，避免执行未知脚本或访问钓鱼链接。',
      ],
    },
  },
};

export default qrScanner;
