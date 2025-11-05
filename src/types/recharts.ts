/**
 * TypeScript type definitions for Recharts components
 * These types replace `any` usage throughout chart components
 */

/**
 * Tooltip props for all chart types
 */
export interface TooltipProps<TData = Record<string, unknown>> {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    dataKey: string
    payload: TData
    unit?: string
  }>
  label?: string
}

/**
 * Pie chart label props
 */
export interface PieLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  index?: number
}

/**
 * Legend formatter entry props
 */
export interface LegendEntry<TPayload = Record<string, unknown>> {
  value: string
  id?: string
  type?: string
  color?: string
  payload?: TPayload
}

/**
 * Area chart entry props (for fillOpacity function)
 */
export interface AreaChartEntry {
  variance: number
  month: string
  budgeted: number
  actual: number
  [key: string]: unknown
}

/**
 * Generic chart data point with dynamic keys
 */
export interface ChartDataPoint {
  [key: string]: string | number | undefined
}
