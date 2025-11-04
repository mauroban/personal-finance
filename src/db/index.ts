import Dexie, { Table } from 'dexie'
import { Category, Source, Transaction, Budget } from '@/types'

export class BudgetTrackerDB extends Dexie {
  categories!: Table<Category>
  sources!: Table<Source>
  transactions!: Table<Transaction>
  budgets!: Table<Budget>

  constructor() {
    super('BudgetTrackerDB')
    this.version(1).stores({
      categories: '++id, name, parentId',
      sources: '++id, name',
      transactions: '++id, type, date, sourceId, groupId, subgroupId',
      budgets: '++id, year, month, type, sourceId, groupId, subgroupId'
    })
    this.version(2).stores({
      categories: '++id, name, parentId',
      sources: '++id, name',
      transactions: '++id, type, date, sourceId, groupId, subgroupId',
      budgets: '++id, year, month, type, mode, sourceId, groupId, subgroupId, [year+month]'
    })
  }
}

export const db = new BudgetTrackerDB()
