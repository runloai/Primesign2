import { useState, useEffect } from 'react';

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
}

// Animation variants that respect reduced motion preference
export function getReducedMotionVariants(reducedMotion: boolean) {
  return {
    fadeIn: reducedMotion
      ? { opacity: 1 }
      : { opacity: 0 },
    fadeInUp: reducedMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: 40 },
    fadeInLeft: reducedMotion
      ? { opacity: 1, x: 0 }
      : { opacity: 0, x: -50 },
    fadeInRight: reducedMotion
      ? { opacity: 1, x: 0 }
      : { opacity: 0, x: 50 },
    scaleIn: reducedMotion
      ? { opacity: 1, scale: 1 }
      : { opacity: 0, scale: 0.9 },
    staggerContainer: reducedMotion
      ? { opacity: 1 }
      : { opacity: 0 },
  };
}

// Get transition configuration based on reduced motion preference
export function getTransitionConfig(reducedMotion: boolean, duration = 0.8) {
  return reducedMotion
    ? { duration: 0.01 }
    : { duration, ease: "easeOut" };
}
