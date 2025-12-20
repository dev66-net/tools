export default {
  // 页面元信息
  title: 'Dev66 - 开发者工具集合',
  description: '包含二维码生成器、JSON格式化、编码转换等15+开发者工具的在线集合。所有工具均在浏览器中本地运行，无需服务器。',
  keywords: '开发者工具, 在线工具, 二维码, JSON格式化, Base64, 十六进制转换, JWT解码',

  // 导航和通用
  language: '语言',
  tools: '工具',
  navAbout: '关于',

  // Hero 区域
  hero: {
    title: '开发者工具集合',
    subtitle: '15+ 免费在线开发者工具',
    description: '所有工具在您的浏览器中本地运行。无需发送数据到服务器。快速、安全、注重隐私。',
    cta: '开始使用工具'
  },

  // 工具分类
  categories: {
    all: '所有工具',
    development: '开发工具',
    qr: '二维码',
    generators: '生成器',
    utilities: '实用工具'
  },

  // 工具卡片
  toolCard: {
    runInBrowser: '浏览器运行',
    runRemote: '需要服务器',
    openTool: '打开工具'
  },

  // About 区域
  about: {
    title: '关于 Dev66',
    description1: 'Dev66 提供了完全在浏览器中工作的开发者工具集合。',
    description2: '所有工具都是开源的，完全免费使用。无需注册，不收集数据。',
    features: [
      '所有工具支持离线工作',
      '无需发送数据到服务器',
      '快速轻量',
      '移动端友好',
      '开源'
    ],
    feedback: {
      title: '遇到问题或希望新增工具？',
      action: '前往 GitHub 创建 Issue',
      url: 'https://github.com/dev66-net/tools/issues/new'
    }
  },

  // 页脚
  footer: {
    copyright: '© 2025 Dev66. 保留所有权利。',
    poweredBy: '由 React & Cloudflare Workers 提供支持'
  }
} as const;