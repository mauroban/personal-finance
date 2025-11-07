export interface Category {
  id?: number
  name: string
  parentId?: number
}

export interface Source {
  id?: number
  name: string
}

export interface Transaction {
  id?: number
  type: 'earning' | 'expense'
  value: number
  date: string
  sourceId?: number
  groupId?: number
  subgroupId?: number
  paymentMethod?: string
  installments?: number
  installmentNumber?: number
  note?: string
}

export interface Budget {
  id?: number
  year: number
  month: number
  type: 'income' | 'expense'
  sourceId?: number
  groupId?: number
  subgroupId?: number
  amount: number
  mode?: 'unique' | 'recurring' | 'installment'
  installments?: number
  installmentNumber?: number
  isFixedCost?: boolean
  // Legacy support
  isRecurrent?: boolean
}

export interface AppData {
  version: number
  categories: Category[]
  sources: Source[]
  budgets: Budget[]
  transactions: Transaction[]
}

export interface MonthSummary {
  totalIncome: number
  totalExpense: number
  budgetedIncome: number
  budgetedExpense: number
  netBalance: number
}

export interface GroupSummary {
  groupId: number
  groupName: string
  budgeted: number
  actual: number
  remaining: number
  percentage: number
}
