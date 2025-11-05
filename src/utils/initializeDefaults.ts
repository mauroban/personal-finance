import { db } from '@/db'
import { DEFAULT_CATEGORY_STRUCTURE, DEFAULT_SOURCES } from './defaultData'
import { STORAGE_KEYS } from '@/constants/storage'
import { logger } from './logger'

/**
 * Initializes the database with default Brazilian categories and income sources
 *
 * This function:
 * - Checks if the database is already initialized (via localStorage flag)
 * - Checks if data already exists in the database
 * - If neither condition is true, adds default categories (with parent-child relationships) and sources
 * - Sets the initialization flag in localStorage
 *
 * This ensures the function is idempotent and won't duplicate data on subsequent calls.
 *
 * @throws Error if database operations fail (caught and logged internally)
 * @example
 * await initializeDefaultData()
 */
export const initializeDefaultData = async (): Promise<void> => {
  // Check if already initialized
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INIT_FLAG)
  if (isInitialized) {
    return
  }

  try {
    // Check if there's already data
    const existingCategories = await db.categories.count()
    const existingSources = await db.sources.count()

    if (existingCategories > 0 || existingSources > 0) {
      // Data exists, mark as initialized
      localStorage.setItem(STORAGE_KEYS.INIT_FLAG, 'true')
      return
    }

    logger.info('Initializing default Brazilian categories...')

    // Add categories with proper parent-child relationships
    for (const categoryGroup of DEFAULT_CATEGORY_STRUCTURE) {
      // Add parent category first
      const parentId = await db.categories.add({
        name: categoryGroup.name,
      })

      logger.debug(`Added category: ${categoryGroup.name}`, { parentId })

      // Add all subcategories with the correct parent ID
      for (const subName of categoryGroup.subcategories) {
        await db.categories.add({
          name: subName,
          parentId: parentId as number,
        })
      }

      logger.debug(`Added subcategories for ${categoryGroup.name}`, {
        count: categoryGroup.subcategories.length,
      })
    }

    // Add default sources
    for (const source of DEFAULT_SOURCES) {
      await db.sources.add(source)
    }

    logger.info('Added default income sources')

    // Mark as initialized
    localStorage.setItem(STORAGE_KEYS.INIT_FLAG, 'true')
    logger.info('Default data initialization complete')
  } catch (error) {
    logger.error('Failed to initialize default data', { error })
  }
}
