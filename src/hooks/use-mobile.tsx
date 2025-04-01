
import * as React from "react"

// Common breakpoints in pixels
export const BREAKPOINTS = {
  xs: 480,  // Extra small devices
  sm: 640,  // Small devices
  md: 768,  // Medium devices
  lg: 1024, // Large devices
  xl: 1280, // Extra large devices
  '2xl': 1536, // 2X Large devices
}

/**
 * Hook to check if viewport width is below specified breakpoint
 * @param breakpoint Breakpoint to check against (default: md - 768px)
 * @returns Boolean indicating if viewport is below the breakpoint
 */
export function useBreakpoint(breakpoint: keyof typeof BREAKPOINTS = 'md') {
  const [isBelow, setIsBelow] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Helper function to check if below breakpoint
    const checkIfBelow = () => {
      setIsBelow(window.innerWidth < BREAKPOINTS[breakpoint])
    }
    
    // Initial check
    checkIfBelow()
    
    // Setup event listener for resize
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`)
    const handleResize = () => {
      checkIfBelow()
    }
    
    // Modern API
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handleResize)
      return () => mql.removeEventListener('change', handleResize)
    } 
    // Legacy API (for older browsers)
    else {
      mql.addListener(handleResize)
      return () => mql.removeListener(handleResize)
    }
  }, [breakpoint])

  // Return boolean (defaults to false until the effect runs)
  return !!isBelow
}

/**
 * Hook that returns true if the viewport is mobile size (< 768px)
 * @returns Boolean indicating if the viewport is mobile size
 */
export function useIsMobile() {
  return useBreakpoint('md')
}

/**
 * Hook that returns true if the viewport is tablet size (< 1024px)
 * @returns Boolean indicating if the viewport is tablet size
 */
export function useIsTablet() {
  return useBreakpoint('lg')
}

/**
 * Hook that returns the current breakpoint name
 * @returns Current breakpoint name (xs, sm, md, lg, xl, 2xl)
 */
export function useCurrentBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<keyof typeof BREAKPOINTS>('md')
  
  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width < BREAKPOINTS.xs) {
        setBreakpoint('xs')
      } else if (width < BREAKPOINTS.sm) {
        setBreakpoint('sm')
      } else if (width < BREAKPOINTS.md) {
        setBreakpoint('md')
      } else if (width < BREAKPOINTS.lg) {
        setBreakpoint('lg')
      } else if (width < BREAKPOINTS.xl) {
        setBreakpoint('xl')
      } else {
        setBreakpoint('2xl')
      }
    }
    
    // Initial check
    updateBreakpoint()
    
    // Add event listener
    window.addEventListener('resize', updateBreakpoint)
    
    // Clean up
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])
  
  return breakpoint
}
