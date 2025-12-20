export default {
  // 页面元信息
  title: 'Dev66 - Developer Tools Collection',
  description: 'A comprehensive collection of developer tools including QR code generators, JSON formatters, encoders, and more. All tools run in your browser with no server required.',
  keywords: 'developer tools, online tools, qr code, json formatter, base64, hex converter, jwt decoder',

  // 导航和通用
  language: 'Language',
  tools: 'Tools',
  navAbout: 'About',

  // Hero 区域
  hero: {
    title: 'Developer Tools Collection',
    subtitle: '15+ Free online tools for developers',
    description: 'All tools run locally in your browser. No data sent to server. Fast, secure, and privacy-focused.',
    cta: 'Start Using Tools'
  },

  // 工具分类
  categories: {
    all: 'All Tools',
    development: 'Development Tools',
    qr: 'QR Code',
    generators: 'Generators',
    utilities: 'Utilities'
  },

  // 工具卡片
  toolCard: {
    runInBrowser: 'Runs in browser',
    runRemote: 'Requires server',
    openTool: 'Open Tool'
  },

  // About 区域
  about: {
    title: 'About Dev66',
    description1: 'Dev66 provides a comprehensive collection of developer tools that work entirely in your browser.',
    description2: 'All tools are open source and available for free. No registration required, no data collection.',
    features: [
      'All tools work offline',
      'No data sent to server',
      'Fast and lightweight',
      'Mobile friendly',
      'Open source'
    ],
    feedback: {
      title: 'Need help or want to suggest new tools?',
      action: 'Create an Issue on GitHub',
      url: 'https://github.com/dev66-net/tools/issues/new'
    }
  },

  // 页脚
  footer: {
    copyright: '© 2025 Dev66. All rights reserved.',
    poweredBy: 'Powered by React & Cloudflare Workers'
  }
} as const;