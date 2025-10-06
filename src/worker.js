export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === 'tool.dev66.net') {
      url.hostname = 'tools.dev66.net';
      return Response.redirect(url.toString(), 302);
    }

    const assetsBinding = env.ASSETS;
    if (!assetsBinding || typeof assetsBinding.fetch !== 'function') {
      console.error('Missing ASSETS binding', { hasBinding: Boolean(assetsBinding) });
      return new Response('Static asset binding not configured', { status: 500 });
    }

    let assetResponse;
    try {
      assetResponse = await assetsBinding.fetch(request);
    } catch (error) {
      console.error('ASSETS fetch failed', error);
    }

    if (assetResponse && assetResponse.status !== 404) {
      if (request.method.toUpperCase() === 'HEAD') {
        return new Response(null, {
          status: assetResponse.status,
          headers: assetResponse.headers,
        });
      }
      return assetResponse;
    }

    const indexUrl = new URL('/', request.url);
    const indexRequest = new Request(indexUrl.toString(), request);

    const pageResponse = await assetsBinding.fetch(indexRequest);
    if (request.method.toUpperCase() === 'HEAD') {
      return new Response(null, {
        status: pageResponse.status,
        headers: pageResponse.headers,
      });
    }

    return pageResponse;
  },
};
