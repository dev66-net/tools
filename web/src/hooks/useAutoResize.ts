import { useEffect, useRef } from 'react';

/**
 * Hook to automatically resize textarea height based on content
 */
export function useAutoResize(
  elementRef: React.RefObject<HTMLTextAreaElement | HTMLDivElement>,
  trigger: string,
  options?: {
    minHeight?: number;
    maxHeight?: number;
    debounce?: number;
  }
) {
  const { minHeight = 100, maxHeight = 600, debounce = 100 } = options || {};
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const adjustHeight = () => {
      if (element instanceof HTMLTextAreaElement) {
        // Store the original overflow style
        const originalOverflow = element.style.overflow;

        // Temporarily hide overflow to get the accurate scrollHeight
        element.style.overflow = 'hidden';
        element.style.height = 'auto';

        // Calculate the new height
        const newHeight = Math.max(minHeight, Math.min(maxHeight, element.scrollHeight));
        element.style.height = `${newHeight}px`;

        // Restore overflow
        element.style.overflow = originalOverflow;
      } else if (element instanceof HTMLDivElement) {
        // For div elements (like CodeMirror), we might need a different approach
        const scrollHeight = element.scrollHeight;
        const newHeight = Math.max(minHeight, Math.min(maxHeight, scrollHeight));
        element.style.height = `${newHeight}px`;
      }
    };

    const debouncedAdjust = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(adjustHeight, debounce);
    };

    // Initial adjustment
    adjustHeight();

    // Listen for content changes
    if (element instanceof HTMLTextAreaElement) {
      element.addEventListener('input', debouncedAdjust);
      element.addEventListener('change', adjustHeight);
    }

    // Listen for window resize
    window.addEventListener('resize', debouncedAdjust);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (element instanceof HTMLTextAreaElement) {
        element.removeEventListener('input', debouncedAdjust);
        element.removeEventListener('change', adjustHeight);
      }
      window.removeEventListener('resize', debouncedAdjust);
    };
  }, [trigger, minHeight, maxHeight, debounce]);
}

/**
 * Hook to sync height between two elements (editor and preview)
 */
export function useHeightSync(
  sourceRef: React.RefObject<HTMLElement>,
  targetRef: React.RefObject<HTMLElement>,
  options?: {
    minHeight?: number;
    maxHeight?: number;
    debounce?: number;
  }
) {
  const { minHeight = 100, maxHeight = 600, debounce = 100 } = options || {};
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const source = sourceRef.current;
    const target = targetRef.current;

    if (!source || !target) return;

    const syncHeight = () => {
      const sourceHeight = source.offsetHeight;
      const newHeight = Math.max(minHeight, Math.min(maxHeight, sourceHeight));
      target.style.height = `${newHeight}px`;
    };

    const debouncedSync = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(syncHeight, debounce);
    };

    // Initial sync
    syncHeight();

    // Use ResizeObserver for better performance
    let resizeObserver: ResizeObserver;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(debouncedSync);
      resizeObserver.observe(source);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', debouncedSync);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', debouncedSync);
      }
    };
  }, [sourceRef, targetRef, minHeight, maxHeight, debounce]);
}