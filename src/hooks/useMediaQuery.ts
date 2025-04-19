
import { useState, useEffect } from 'react';

/**
 * Custom hook that returns true if the screen size matches the provided media query.
 * 
 * @param query The media query to match against (e.g., "(max-width: 768px)")
 * @returns {boolean} True if the media query matches, false otherwise
 * 
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)");
 * const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
 * const isDesktop = useMediaQuery("(min-width: 1025px)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create a media query list to observe
    const mediaQuery = window.matchMedia(query);
    
    // Set initial state
    setMatches(mediaQuery.matches);
    
    // Define listener function
    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener for modern browsers
    mediaQuery.addEventListener('change', handleMediaQueryChange);
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, [query]);

  return matches;
}
