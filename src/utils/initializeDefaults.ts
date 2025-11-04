import { db } from '@/db'
import { DEFAULT_CATEGORY_STRUCTURE, DEFAULT_SOURCES } from './defaultData'

const INIT_FLAG_KEY = 'budget-tracker-initialized'

export const initializeDefaultData = async (): Promise<void> => {
  // Check if already initialized
  const isInitialized = localStorage.getItem(INIT_FLAG_KEY)
  if (isInitialized) {
    return
  }

  try {
    // Check if there's already data
    const existingCategories = await db.categories.count()
    const existingSources = await db.sources.count()

    if (existingCategories > 0 || existingSources > 0) {
      // Data exists, mark as initialized
      localStorage.setItem(INIT_FLAG_KEY, 'true')
      return
    }

    console.log('🔄 Initializing default Brazilian categories...')

    // Add categories with proper parent-child relationships
    for (const categoryGroup of DEFAULT_CATEGORY_STRUCTURE) {
      // Add parent category first
      const parentId = await db.categories.add({
        name: categoryGroup.name
      })

      console.log(`✅ Added category: ${categoryGroup.name} (ID: ${parentId})`)

      // Add all subcategories with the correct parent ID
      for (const subName of categoryGroup.subcategories) {
        await db.categories.add({
          name: subName,
          parentId: parentId as number
        })
      }

      console.log(`   ↳ Added ${categoryGroup.subcategories.length} subcategories`)
    }

    // Add default sources
    for (const source of DEFAULT_SOURCES) {
      await db.sources.add(source)
    }

    console.log('✅ Added default income sources')

    // Mark as initialized
    localStorage.setItem(INIT_FLAG_KEY, 'true')
    console.log('✅ Default data initialization complete!')
  } catch (error) {
    console.error('❌ Failed to initialize default data:', error)
  }
}
