export const TRANSACTION_MODES = {
  UNIQUE: 'unique',
  INSTALLMENT: 'installment',
} as const

export type TransactionMode = typeof TRANSACTION_MODES[keyof typeof TRANSACTION_MODES]

export const TRANSACTION_MODE_LABELS: Record<TransactionMode, string> = {
  [TRANSACTION_MODES.UNIQUE]: 'Único',
  [TRANSACTION_MODES.INSTALLMENT]: 'Parcelado',
}
