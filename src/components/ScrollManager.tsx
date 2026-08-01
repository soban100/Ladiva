import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export const ScrollManager = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositionsRef = useRef<Record<string, number>>({});

  // Save scroll position of the route being left
  useEffect(() => {
    return () => {
      scrollPositionsRef.current[location.key] = window.scrollY;
    };
  }, [location.key]);

  // Restore on browser back/forward (POP), otherwise scroll to top
  useEffect(() => {
    if (navigationType === 'POP') {
      const savedPosition = scrollPositionsRef.current[location.key];
      if (typeof savedPosition === 'number') {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition);
        });
      }
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.key, navigationType]);

  return null;
};
