import Dexie, { Table } from 'dexie'
import { Category, Source, Transaction, Budget } from '@/types'
import { logger } from '@/utils/logger'

/**
 * Database schema version history:
 * - v1: Initial schema with categories, sources, transactions, and budgets
 * - v2: Added 'mode' field to budgets and composite index [year+month] for faster queries
 * - v3: Added composite indexes for common query patterns (performance optimization)
 *
 * Migration strategy:
 * - Add new versions with .upgrade() for data transformations
 * - Never modify existing version schemas after deployment
 */

export class BudgetTrackerDB extends Dexie {
  categories!: Table<Category>
  sources!: Table<Source>
  transactions!: Table<Transaction>
  budgets!: Table<Budget>

  constructor() {
    super('BudgetTrackerDB')

    // Version 1: Initial schema
    this.version(1).stores({
      categories: '++id, name, parentId',
      sources: '++id, name',
      transactions: '++id, type, date, sourceId, groupId, subgroupId',
      budgets: '++id, year, month, type, sourceId, groupId, subgroupId',
    })

    // Version 2: Added mode field and composite index for budgets
    this.version(2).stores({
      categories: '++id, name, parentId',
      sources: '++id, name',
      transactions: '++id, type, date, sourceId, groupId, subgroupId',
      budgets: '++id, year, month, type, mode, sourceId, groupId, subgroupId, [year+month]',
    })

    // Version 3: Added composite indexes for common query patterns
    // These dramatically speed up budget lookups and filtering
    this.version(3).stores({
      categories: '++id, name, parentId',
      sources: '++id, name',
      transactions: '++id, type, date, sourceId, groupId, subgroupId',
      budgets: '++id, year, month, type, mode, sourceId, groupId, subgroupId, [year+month], [type+sourceId], [type+groupId+subgroupId], [year+month+type]',
    })

    // Log database initialization
    logger.info('Database initialized', { version: this.verno })
  }
}

export const db = new BudgetTrackerDB()
