import type { HomeCopy } from '../../i18n/types';

const home: HomeCopy = {
  heroTitle: 'tools.dev66.net 开发者工具集',
  heroDescription:
    '这里汇集了二维码、编码转换、格式校验等常用开发小工具，所有操作均在浏览器本地完成，帮助你在开发、测试与运维流程中快速处理常见数据格式问题。',
  sections: [
    {
      title: '为什么使用本站',
      description: '面向工程师的轻量化工具集合，强调隐私、安全与效率。',
      bullets: [
        '丰富工具覆盖二维码生成识别、JSON/URL/编码转换、哈希与随机数据生成等场景。',
        '无需登录与安装，页面即用，适合在新机器或临时环境快速处理任务。',
        '全部逻辑在浏览器本地计算，不会上传输入内容，适合处理敏感数据。',
        '统一的 UI 交互与键盘操作提示，减少在多个站点之间切换的成本。',
      ],
    },
    {
      title: '使用建议',
      description: '欢迎将常用工具收藏在侧边栏或浏览器书签中，方便随时调用。',
      bullets: [
        '如果某个工具缺少你需要的功能，可以在项目仓库内提交 Issue 或 PR，我们会优先排期改进。',
        '遇到构建或缓存问题时，请在浏览器 DevTools 中清理站点数据并刷新页面。',
        '部署到 Cloudflare Workers 前，请先执行 [[pnpm build:web]] 确认生产构建通过。',
      ],
    },
  ],
  cta: {
    text: '想直接开始使用？',
    linkLabel: '从二维码生成器开始',
    linkSlug: 'qr-generator',
  },
  issueLink: {
    text: '遇到问题或希望新增工具？',
    linkLabel: '前往 GitHub 创建 Issue',
    href: 'https://github.com/dev66-net/tools/issues/new',
  },
};

export default home;
