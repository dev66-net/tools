export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 简单的路径映射
    let assetPath = path.startsWith('/') ? path.substring(1) : path;

    // 默认到 index.html
    if (assetPath === '' || assetPath === '/') {
      assetPath = 'index.html';
    }

    // 中文路径
    if (assetPath === 'zh-cn') {
      assetPath = 'zh-cn.html';
    }

    try {
      // 从 ASSETS 获取资源
      const assetUrl = `https://dummy-url.com/${assetPath}`;
      const assetRequest = new Request(assetUrl, {
        method: request.method,
        headers: request.headers,
      });

      const response = await env.ASSETS.fetch(assetRequest);

      if (response.status === 404) {
        // 404 时返回 index.html
        const fallbackResponse = await env.ASSETS.fetch(
          new Request('https://dummy-url.com/index.html', {
            method: 'GET',
            headers: request.headers,
          })
        );
        return fallbackResponse;
      }

      return response;
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  },
};