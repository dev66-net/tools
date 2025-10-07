import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main className="card">
      <h1>tools.dev66.net 开发者工具集</h1>
      <p className="card-description">
        这里汇集了二维码、编码转换、格式校验等常用开发小工具，所有操作均在浏览器本地完成，帮助你在开发、测试与运维流程中快速处理常见数据格式问题。
      </p>
      <section className="section">
        <header className="section-header">
          <h2>为什么使用本站</h2>
          <p>面向工程师的轻量化工具集合，强调隐私、安全与效率。</p>
        </header>
        <ul>
          <li>丰富工具覆盖二维码生成识别、JSON/URL/编码转换、哈希与随机数据生成等场景。</li>
          <li>无需登录与安装，页面即用，适合在新机器或临时环境快速处理任务。</li>
          <li>全部逻辑在浏览器本地计算，不会上传输入内容，适合处理敏感数据。</li>
          <li>统一的 UI 交互与键盘操作提示，减少在多个站点之间切换的成本。</li>
        </ul>
      </section>
      <section className="section">
        <header className="section-header">
          <h2>使用建议</h2>
          <p>欢迎将常用工具收藏在侧边栏或浏览器书签中，方便随时调用。</p>
        </header>
        <ul>
          <li>
            如果某个工具缺少你需要的功能，可以在项目仓库内提交 Issue 或 PR，我们会优先排期改进。
          </li>
          <li>遇到构建或缓存问题时，请在浏览器 DevTools 中清理站点数据并刷新页面。</li>
          <li>部署到 Cloudflare Workers 前，请先执行 <code>pnpm build:web</code> 确认生产构建通过。</li>
        </ul>
        <p className="hint">
          想直接开始使用？从 <Link to="/qr-generator.html">二维码生成器</Link> 或侧边栏中的任一工具打开你需要的功能。
        </p>
      </section>
    </main>
  );
}
