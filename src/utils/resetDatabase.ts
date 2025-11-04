import { db } from '@/db'

const INIT_FLAG_KEY = 'budget-tracker-initialized'

export const resetDatabase = async (): Promise<void> => {
  try {
    console.log('🗑️  Clearing all data...')

    // Clear all tables
    await db.transactions.clear()
    await db.budgets.clear()
    await db.categories.clear()
    await db.sources.clear()

    // Clear initialization flag
    localStorage.removeItem(INIT_FLAG_KEY)

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
