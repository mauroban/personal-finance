import { db } from '@/db'
import { STORAGE_KEYS } from '@/constants/storage'
import { logger } from './logger'

/**
 * Resets the database by clearing all tables and reinitializing with default data
 *
 * This function:
 * 1. Clears all database tables (transactions, budgets, categories, sources)
 * 2. Removes the initialization flag from localStorage
 * 3. Reinitializes the database with default categories and sources
 *
 * @throws Error if database operations fail
 * @example
 * await resetDatabase()
 */
export const resetDatabase = async (): Promise<void> => {
  try {
    logger.info('Clearing all database data...')

    // Clear all tables
    await db.transactions.clear()
    await db.budgets.clear()
    await db.categories.clear()
    await db.sources.clear()

    // Clear initialization flag
    localStorage.removeItem(STORAGE_KEYS.INIT_FLAG)

    logger.info('Database cleared successfully')

    // Reinitialize default data
    const { initializeDefaultData } = await import('./initializeDefaults')
    await initializeDefaultData()

    logger.info('Database reset complete')
  } catch (error) {
    logger.error('Failed to reset database', { error })
    throw error
  }
}
