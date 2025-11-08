import { useState, useEffect } from 'react'

/**
 * Custom hook for responsive breakpoint detection
 * Based on Tailwind CSS breakpoints
 */

export const BREAKPOINTS = {
  xs: 375,   // Extra small devices
  sm: 640,   // Small devices (phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices
  '2xl': 1536, // 2X large devices
} as const

type Breakpoint = keyof typeof BREAKPOINTS

/**
 * Hook to detect if screen width matches a media query
 * @param query - CSS media query string
 * @returns boolean indicating if query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)

    // Use setTimeout to debounce rapid changes during resize
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const handler = (event: MediaQueryListEvent) => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setMatches(event.matches)
      }, 100) // 100ms debounce
    }

    // Set initial value
    setMatches(mediaQuery.matches)

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler as any)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler)
      } else {
        mediaQuery.removeListener(handler as any)
      }
    }
  }, [query])

  return matches
}

/**
 * Hook to detect if screen width is at least the specified breakpoint
 * @param breakpoint - Breakpoint name (sm, md, lg, xl, 2xl)
 * @returns boolean indicating if screen is at or above breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`
  return useMediaQuery(query)
}

/**
 * Hook to detect current device type
 * @returns object with boolean flags for device types
 */
export function useDeviceType() {
  const isMobile = !useBreakpoint('md')  // < 768px
  const isTablet = useBreakpoint('md') && !useBreakpoint('lg') // 768-1023px
  const isDesktop = useBreakpoint('lg')  // >= 1024px

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice: isMobile || isTablet,
  }
}

/**
 * Hook to get current screen width
 * Useful for dynamic calculations
 * Debounced to prevent excessive re-renders
 */
export function useScreenWidth(): number {
  const [width, setWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth
    }
    return 0
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setWidth(window.innerWidth)
      }, 150) // 150ms debounce for width changes
    }

    window.addEventListener('resize', handleResize)
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return width
}

/**
 * Hook for orientation detection
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const isPortrait = useMediaQuery('(orientation: portrait)')
  return isPortrait ? 'portrait' : 'landscape'
}
