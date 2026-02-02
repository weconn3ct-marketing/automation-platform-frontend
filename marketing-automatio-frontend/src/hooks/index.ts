import { useEffect, useState } from 'react';

interface DocumentTitleOptions {
  prefix?: string;
  suffix?: string;
}

/**
 * Hook to dynamically set document title
 */
export function useDocumentTitle(title: string, options?: DocumentTitleOptions) {
  useEffect(() => {
    const { prefix = '', suffix = ' | WeConnect' } = options || {};
    document.title = `${prefix}${title}${suffix}`;
    
    return () => {
      document.title = 'WeConnect';
    };
  }, [title, options]);
}

/**
 * Hook to detect clicks outside an element
 */
export function useOnClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

/**
 * Hook to detect media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
