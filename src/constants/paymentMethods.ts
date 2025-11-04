export const PAYMENT_METHODS = [
  'Cartão de Crédito',
  'Cartão de Débito',
  'Dinheiro',
  'PIX',
  'Transferência',
] as const

export type PaymentMethod = typeof PAYMENT_METHODS[number]

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = 'Cartão de Crédito'
