import Dexie, { Table } from 'dexie'
import { Category, Source, Transaction, Budget } from '@/types'
import { logger } from '@/utils/logger'
import { GoogleDriveConfig } from '@/services/googleDrive'

/**
 * Database schema version history:
 * - v1: Initial schema with categories, sources, transactions, and budgets
 * - v2: Added 'mode' field to budgets and composite index [year+month] for faster queries
 * - v3: Added composite indexes for common query patterns (performance optimization)
 * - v4: Added settings table for sync configuration (Google Drive)
 *
 * Migration strategy:
 * - Add new versions with .upgrade() for data transformations
 * - Never modify existing version schemas after deployment
 */

export interface SyncSettings extends GoogleDriveConfig {
  id?: number
  lastSyncTime?: number
  autoSyncEnabled?: boolean
}

export class BudgetTrackerDB extends Dexie {
  categories!: Table<Category>
  sources!: Table<Source>
  transactions!: Table<Transaction>
  budgets!: Table<Budget>
  settings!: Table<SyncSettings>

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

    // Version 4: Added settings table for sync configuration
    this.version(4).stores({
      categories: '++id, name, parentId',
      sources: '++id, name',
      transactions: '++id, type, date, sourceId, groupId, subgroupId',
      budgets: '++id, year, month, type, mode, sourceId, groupId, subgroupId, [year+month], [type+sourceId], [type+groupId+subgroupId], [year+month+type]',
      settings: '++id',
    })

    // Log database initialization
    logger.info('Database initialized', { version: this.verno })
  }
}

export const db = new BudgetTrackerDB()
