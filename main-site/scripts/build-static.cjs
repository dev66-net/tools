const fs = require('fs');
const path = require('path');

// 从翻译文件导入数据
const locales = {
  en: {
    title: 'Dev66 - Developer Tools Collection',
    description: 'A comprehensive collection of developer tools including QR code generators, JSON formatters, encoders, and more. All tools run in your browser with no server required.',
    keywords: 'developer tools, online tools, qr code, json formatter, base64, hex converter, jwt decoder'
  },
  'zh-cn': {
    title: 'Dev66 - 开发者工具集合',
    description: '包含二维码生成器、JSON格式化、编码转换等15+开发者工具的在线集合。所有工具均在浏览器中本地运行，无需服务器。',
    keywords: '开发者工具, 在线工具, 二维码, JSON格式化, Base64, 十六进制转换, JWT解码'
  }
};

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function buildStatic() {
  console.log('🚀 Starting static site generation...');

  // 检查构建目录
  const distDir = path.join(__dirname, '../dist');
  const templateDir = path.join(__dirname, '../templates');

  if (!fs.existsSync(distDir)) {
    console.error('❌ Error: dist directory not found. Please run `vite build` first.');
    process.exit(1);
  }

  // 读取模板文件
  const templatePath = path.join(templateDir, 'index-template.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ Error: Template file not found at:', templatePath);
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, 'utf-8');
  console.log('✅ Template loaded');

  // 读取 Vite manifest
  const manifestPath = path.join(distDir, '.vite', 'manifest.json');
  let manifest;

  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    console.log('✅ Manifest loaded');
  } catch (error) {
    console.error('❌ Error: Failed to read manifest.json. Please ensure Vite build completed successfully.');
    console.error('Expected manifest at:', manifestPath);
    process.exit(1);
  }

  // 找到 CSS 和 JS 文件
  const cssEntry = Object.values(manifest).find(entry => entry.file.endsWith('.css'));
  const jsEntry = Object.values(manifest).find(entry => entry.file.endsWith('.js'));

  if (!cssEntry || !jsEntry) {
    console.error('❌ Error: Could not find CSS or JS files in manifest');
    console.log('Available entries:', Object.keys(manifest));
    process.exit(1);
  }

  console.log(`📦 CSS: ${cssEntry.file}`);
  console.log(`📦 JS: ${jsEntry.file}`);

  // 为每种语言生成 HTML
  for (const [locale, data] of Object.entries(locales)) {
    console.log(`\n📝 Generating ${locale} version...`);

    let html = template;

    // 替换占位符
    html = html.replace(/__TITLE__/g, escapeHtml(data.title));
    html = html.replace(/__DESCRIPTION__/g, escapeHtml(data.description));
    html = html.replace(/__KEYWORDS__/g, escapeHtml(data.keywords));
    html = html.replace(/__CSS_PATH__/g, cssEntry.file);
    html = html.replace(/__JS_PATH__/g, jsEntry.file);

    // 注入语言标识
    if (locale === 'zh-cn') {
      html = html.replace('<html lang="en">', '<html lang="zh-CN">');
      html = html.replace(
        '<head>',
        '<head>\n  <script>window.__INITIAL_LOCALE__ = "zh-cn";</script>'
      );

      // 更新 alternate links
      html = html.replace(
        'href="https://dev66.net/zh-cn" rel="alternate" hreflang="zh-CN" />',
        'href="https://dev66.net" rel="alternate" hreflang="en" />'
      );
      html = html.replace(
        'href="https://dev66.net" rel="alternate" hreflang="en" />',
        'href="https://dev66.net/zh-cn" rel="alternate" hreflang="zh-CN" />'
      );
    }

    // 写入文件
    const filename = locale === 'zh-cn' ? 'zh-cn.html' : 'index.html';
    const filePath = path.join(distDir, filename);
    fs.writeFileSync(filePath, html, 'utf-8');

    console.log(`✅ Generated: ${filename}`);

    // 验证文件大小
    const stats = fs.statSync(filePath);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
  }

  console.log('\n🎉 Static site generation completed successfully!');
  console.log('\n📁 Output files:');
  console.log('   - dist/index.html (English)');
  console.log('   - dist/zh-cn.html (Chinese)');
  console.log('   - dist/assets/ (Static assets)');
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught error:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// 运行构建
buildStatic().catch((error) => {
  console.error('\n❌ Build failed:', error);
  process.exit(1);
});