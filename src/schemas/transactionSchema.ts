/**
 * Transaction Validation Schema
 *
 * Zod schemas for validating transaction forms with proper error messages in Portuguese.
 */

import { z } from 'zod'
import { MAX_TRANSACTION_VALUE, MIN_TRANSACTION_VALUE } from '@/constants/calculations'

/**
 * Transaction form validation schema
 */
export const transactionSchema = z
  .object({
    type: z.enum(['earning', 'expense']),
    transactionMode: z.enum(['unique', 'installment']),
    value: z
      .number()
      .min(MIN_TRANSACTION_VALUE, {
        message: `Valor deve ser maior que R$ ${MIN_TRANSACTION_VALUE.toFixed(2)}`,
      })
      .max(MAX_TRANSACTION_VALUE, {
        message: `Valor deve ser menor que R$ ${MAX_TRANSACTION_VALUE.toLocaleString('pt-BR')}`,
      }),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Data deve estar no formato AAAA-MM-DD',
      })
      .refine(
        dateStr => {
          const date = new Date(dateStr)
          return !isNaN(date.getTime())
        },
        {
          message: 'Data inválida',
        }
      ),
    sourceId: z.number().int().positive().optional(),
    groupId: z.number().int().positive().optional(),
    subgroupId: z.number().int().positive().optional(),
    paymentMethod: z
      .string()
      .max(50, { message: 'Forma de pagamento muito longa' })
      .optional(),
    count: z
      .number()
      .int({ message: 'Número de parcelas deve ser um número inteiro' })
      .min(2, { message: 'Número de parcelas deve ser pelo menos 2' })
      .max(120, { message: 'Número de parcelas não pode exceder 120' })
      .optional(),
    note: z
      .string()
      .max(500, { message: 'Nota não pode exceder 500 caracteres' })
      .optional(),
  })
  .refine(
    data => {
      // If type is earning, sourceId is required
      if (data.type === 'earning') {
        return data.sourceId !== undefined && data.sourceId > 0
      }
      return true
    },
    {
      message: 'Por favor, selecione uma fonte de renda',
      path: ['sourceId'],
    }
  )
  .refine(
    data => {
      // If type is expense, groupId is required
      if (data.type === 'expense') {
        return data.groupId !== undefined && data.groupId > 0
      }
      return true
    },
    {
      message: 'Por favor, selecione uma categoria',
      path: ['groupId'],
    }
  )
  .refine(
    data => {
      // If transactionMode is installment, count is required and must be >= 2
      if (data.transactionMode === 'installment') {
        return data.count !== undefined && data.count >= 2
      }
      return true
    },
    {
      message: 'Para parcelas, informe pelo menos 2 repetições',
      path: ['count'],
    }
  )

/**
 * Type inferred from the schema
 */
export type TransactionFormData = z.infer<typeof transactionSchema>

/**
 * Default values for the transaction form
 */
export const transactionFormDefaults: Partial<TransactionFormData> = {
  type: 'expense',
  transactionMode: 'unique',
  value: undefined,
  date: new Date().toISOString().split('T')[0],
  sourceId: undefined,
  groupId: undefined,
  subgroupId: undefined,
  paymentMethod: 'Cartão de Crédito',
  count: 1,
  note: '',
}
