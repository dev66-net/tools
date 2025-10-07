import type { ToolCopy } from '../../../i18n/types';

const qrGenerator: ToolCopy = {
  meta: {
    label: '二维码生成器',
    pageTitle: '二维码生成器｜在线创建高分辨率二维码 - tools.dev66.net',
    description:
      '在线二维码生成器支持链接、文本、名片和 Wi-Fi 等内容，一键生成高清二维码并可下载 PNG 图片，适合海报、分享与营销场景。',
    keywords: [
      '二维码生成器',
      '在线二维码',
      '二维码制作',
      'QR code generator',
      '生成二维码图片',
      'Wi-Fi 二维码',
      '名片二维码',
      '营销二维码',
    ],
    fallbackLabel: '二维码生成工具',
    executionNote: '浏览器本地计算，输入内容仅保留在设备中，可用于处理敏感链接。',
  },
  page: {
    title: '二维码生成器：在线创建高清 QR Code',
    description:
      '在线二维码生成器支持链接、文本、名片和 Wi-Fi 等内容，一键生成高清二维码并可下载 PNG 图片，适合海报、打印与分享场景。',
    form: {
      inputLabel: '请输入内容：',
      placeholder: 'https://example.com 或任意文本',
      autoGenerateLabel: '自动生成二维码',
      submitLabel: '生成二维码',
      errors: {
        general: '二维码生成失败，请重试',
        empty: '请输入要编码的内容',
      },
    },
    sections: {
      guide: {
        title: '如何快速生成二维码',
        description: '输入任意文本、链接或数据，选择是否自动生成并立即获取高分辨率二维码。',
        steps: [
          '在输入框粘贴网址、手机号、Wi-Fi 配置或自定义文本。',
          '保持“自动生成二维码”开启可实时预览，关闭后可在编辑完毕时手动点击按钮。',
          '右键或长按二维码即可保存 PNG 图片，用于海报、名片或宣传物料。',
        ],
        hint: '建议在生成大型宣传物料前进行扫码测试，确保文本内容准确无误。',
      },
    },
  },
};

export default qrGenerator;
