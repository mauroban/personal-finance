import { AppData } from '@/types'
import { db } from '@/db'

/**
 * Exports all application data to a JSON file
 *
 * @throws Error if database operations or file creation fails
 */
export const exportData = async (): Promise<void> => {
  try {
    const categories = await db.categories.toArray()
    const sources = await db.sources.toArray()
    const budgets = await db.budgets.toArray()
    const transactions = await db.transactions.toArray()

    const data: AppData = {
      version: 1,
      categories,
      sources,
      budgets,
      transactions,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export data:', error)
    throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Imports application data from a JSON backup file
 *
 * @param file - The backup file to import
 * @throws Error if file is invalid, corrupt, or database operations fail
 */
export const importData = async (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string

        // Parse JSON
        let data: AppData
        try {
          data = JSON.parse(text)
        } catch (parseError) {
          throw new Error('Invalid JSON format in backup file')
        }

        // Validate structure
        if (!data.version || !data.categories || !data.sources || !data.budgets || !data.transactions) {
          throw new Error('Invalid backup file format: missing required fields')
        }

        // Validate types
        if (!Array.isArray(data.categories) || !Array.isArray(data.sources) ||
            !Array.isArray(data.budgets) || !Array.isArray(data.transactions)) {
          throw new Error('Invalid backup file format: data fields must be arrays')
        }

        // Import data
        try {
          await db.transaction('rw', db.categories, db.sources, db.budgets, db.transactions, async () => {
            await db.categories.clear()
            await db.sources.clear()
            await db.budgets.clear()
            await db.transactions.clear()

            await db.categories.bulkAdd(data.categories)
            await db.sources.bulkAdd(data.sources)
            await db.budgets.bulkAdd(data.budgets)
            await db.transactions.bulkAdd(data.transactions)
          })
        } catch (dbError) {
          throw new Error(`Database import failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`)
        }

        resolve()
      } catch (error) {
        console.error('Import failed:', error)
        reject(error instanceof Error ? error : new Error('Unknown import error'))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
