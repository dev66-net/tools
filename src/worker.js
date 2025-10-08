const LOCALE_SEGMENTS = ['zh-cn'];

const hasFileExtension = (pathname) => /\.[^/]+$/u.test(pathname);

const normalizePathname = (pathname) => {
  if (!pathname) {
    return '/';
  }
  const trimmed = pathname.replace(/\/+$/u, '');
  return trimmed === '' ? '/' : trimmed;
};

const computeHtmlFallbackPaths = (pathname) => {
  const normalized = normalizePathname(pathname);
  const fallbacks = [];
  const addFallback = (value) => {
    if (value && !fallbacks.includes(value)) {
      fallbacks.push(value);
    }
  };

  if (normalized === '/') {
    addFallback('/index.html');
    return fallbacks;
  }

  const segments = normalized.split('/').filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();
  const localeIndex =
    firstSegment && LOCALE_SEGMENTS.includes(firstSegment) ? `/${firstSegment}/index.html` : null;
  const isLocaleRoot = localeIndex !== null && segments.length === 1;

  if (isLocaleRoot) {
    addFallback(localeIndex);
  } else if (!hasFileExtension(normalized)) {
    addFallback(`${normalized}.html`);
    if (localeIndex) {
      addFallback(localeIndex);
    }
  }

  addFallback('/index.html');
  return fallbacks;
};

const computeDirectoryIndexPath = (pathname) => {
  const normalized = normalizePathname(pathname);

  if (normalized === '/') {
    return '/index.html';
  }

  const segments = normalized.split('/').filter(Boolean);
  if (segments.length === 1) {
    const firstSegment = segments[0]?.toLowerCase();
    if (firstSegment && LOCALE_SEGMENTS.includes(firstSegment)) {
      return `/${firstSegment}/index.html`;
    }
  }

  return null;
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const normalizedPathname = normalizePathname(url.pathname);

    if (url.hostname === 'tool.dev66.net') {
      url.hostname = 'tools.dev66.net';
      return Response.redirect(url.toString(), 302);
    }

    const assetsBinding = env.ASSETS;
    if (!assetsBinding || typeof assetsBinding.fetch !== 'function') {
      console.error('Missing ASSETS binding', { hasBinding: Boolean(assetsBinding) });
      return new Response('Static asset binding not configured', { status: 500 });
    }

    const method = request.method.toUpperCase();
    const acceptHeader = request.headers.get('Accept') ?? '';
    const attemptedPaths = new Set();
    const directoryIndexPath = computeDirectoryIndexPath(url.pathname);

    const sendResponse = (response) => {
      if (!response) {
        return new Response('Not Found', { status: 404 });
      }
      if (method === 'HEAD') {
        return new Response(null, {
          status: response.status,
          headers: response.headers,
        });
      }
      return response;
    };

    const fetchAssetPath = async (path, useOriginalRequest = false) => {
      const baseUrl = useOriginalRequest ? new URL(request.url) : new URL(path, request.url);
      const targetRequest = useOriginalRequest ? request : new Request(baseUrl.toString(), request);
      let response;
      try {
        response = await assetsBinding.fetch(targetRequest, { redirect: 'manual' });
      } catch (error) {
        console.error('ASSETS fetch failed', { path, error });
        return null;
      }

      if (response && response.status >= 300 && response.status < 400) {
        const redirectTarget = response.headers.get('Location');
        if (redirectTarget) {
          try {
            const normalizedTarget = new URL(redirectTarget, baseUrl);
            const followRequest = new Request(normalizedTarget.toString(), request);
            const followResponse = await assetsBinding.fetch(followRequest, { redirect: 'manual' });
            if (followResponse && followResponse.status !== 404) {
              const headers = new Headers(followResponse.headers);
              headers.delete('Location');
              return new Response(followResponse.body, {
                status: followResponse.status,
                statusText: followResponse.statusText,
                headers,
              });
            }
          } catch (error) {
            console.error('Failed to follow asset redirect', { path, target: redirectTarget, error });
          }
        }
      }

      return response;
    };

    let assetResponse = null;

    if (directoryIndexPath) {
      attemptedPaths.add(directoryIndexPath);
      assetResponse = await fetchAssetPath(directoryIndexPath);
      if (assetResponse && assetResponse.status !== 404) {
        return sendResponse(assetResponse);
      }
    }

    if (!directoryIndexPath || !assetResponse || assetResponse.status === 404) {
      attemptedPaths.add(normalizedPathname);
      assetResponse = await fetchAssetPath(url.pathname, true);
      if (assetResponse && assetResponse.status !== 404) {
        return sendResponse(assetResponse);
      }
    }

    const shouldAttemptHtmlFallback =
      (method === 'GET' || method === 'HEAD') &&
      (!hasFileExtension(url.pathname) || acceptHeader.includes('text/html'));

    if (shouldAttemptHtmlFallback) {
      const fallbackPaths = computeHtmlFallbackPaths(url.pathname);
      for (const path of fallbackPaths) {
        if (attemptedPaths.has(path)) {
          continue;
        }
        attemptedPaths.add(path);
        const fallbackResponse = await fetchAssetPath(path);
        if (fallbackResponse && fallbackResponse.status !== 404) {
          return sendResponse(fallbackResponse);
        }
      }
    }

    if (assetResponse) {
      return sendResponse(assetResponse);
    }

    return new Response('Not Found', { status: 404 });
  },
};
