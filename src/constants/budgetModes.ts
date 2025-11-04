export const BUDGET_MODES = {
  UNIQUE: 'unique',
  RECURRING: 'recurring',
  INSTALLMENT: 'installment',
} as const

export type BudgetMode = typeof BUDGET_MODES[keyof typeof BUDGET_MODES]

export const BUDGET_MODE_LABELS: Record<BudgetMode, string> = {
  [BUDGET_MODES.UNIQUE]: 'Único',
  [BUDGET_MODES.RECURRING]: 'Recorrente',
  [BUDGET_MODES.INSTALLMENT]: 'Parcelado',
}
