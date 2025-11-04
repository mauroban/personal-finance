import { db } from '@/db'
import { STORAGE_KEYS } from '@/constants/storage'

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
    console.log('🗑️  Clearing all data...')

    // Clear all tables
    await db.transactions.clear()
    await db.budgets.clear()
    await db.categories.clear()
    await db.sources.clear()

    // Clear initialization flag
    localStorage.removeItem(STORAGE_KEYS.INIT_FLAG)

    console.log('✅ Database cleared successfully!')

    // Reinitialize default data
    const { initializeDefaultData } = await import('./initializeDefaults')
    await initializeDefaultData()

    console.log('✅ Database reset complete!')
  } catch (error) {
    console.error('❌ Failed to reset database:', error)
    throw error
  }
}
