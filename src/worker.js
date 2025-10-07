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
      assetResponse = await assetsBinding.fetch(request, { redirect: 'manual' });
    } catch (error) {
      console.error('ASSETS fetch failed', error);
    }

    if (assetResponse && assetResponse.status >= 300 && assetResponse.status < 400) {
      const redirectTarget = assetResponse.headers.get('Location');
      const isHtmlRequest = url.pathname.endsWith('.html');

      if (redirectTarget && isHtmlRequest) {
        try {
          const normalizedTarget = new URL(redirectTarget, url);
          const followRequest = new Request(normalizedTarget.toString(), request);
          const followResponse = await assetsBinding.fetch(followRequest, { redirect: 'manual' });

          if (followResponse && followResponse.status !== 404) {
            const headers = new Headers(followResponse.headers);
            headers.delete('Location');
            assetResponse = new Response(followResponse.body, {
              status: followResponse.status,
              statusText: followResponse.statusText,
              headers,
            });
          }
        } catch (error) {
          console.error('Failed to follow asset redirect', {
            target: redirectTarget,
            error,
          });
        }
      }
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
