import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to #anchors (e.g. /#services) and to the top on page changes. */
export function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}