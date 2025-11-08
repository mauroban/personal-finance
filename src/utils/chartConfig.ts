/**
 * Utility functions for responsive chart configurations
 */

export const getResponsiveChartHeight = (isMobile: boolean, defaultHeight: number = 300): number => {
  return isMobile ? Math.min(250, defaultHeight) : defaultHeight
}

export const getResponsiveFontSize = (isMobile: boolean): number => {
  return isMobile ? 11 : 12
}

export const getResponsiveLegendConfig = (isMobile: boolean) => {
  return {
    wrapperStyle: {
      fontSize: isMobile ? '11px' : '12px',
      paddingTop: isMobile ? '8px' : '12px',
    },
    iconSize: isMobile ? 8 : 10,
    layout: isMobile ? ('horizontal' as const) : ('horizontal' as const),
  }
}

export const getResponsiveMargin = (isMobile: boolean) => {
  return {
    top: isMobile ? 10 : 20,
    right: isMobile ? 10 : 30,
    left: isMobile ? 0 : 0,
    bottom: isMobile ? 5 : 10,
  }
}

export const getResponsiveAxisConfig = (isMobile: boolean) => {
  return {
    tick: { fontSize: isMobile ? 10 : 12 },
    tickMargin: isMobile ? 5 : 10,
  }
}

export const shouldShowGrid = (isMobile: boolean): boolean => {
  return !isMobile // Hide grid on mobile for cleaner look
}
