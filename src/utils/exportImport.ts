import { AppData } from '@/types'
import { db } from '@/db'
import { logger } from './logger'
import { sanitizeText } from './sanitize'
import { getTauriDialog, getTauriFs } from './tauriHelpers'

/**
 * Sanitizes string fields in imported data to prevent XSS attacks
 *
 * @param data - The imported app data
 * @returns Sanitized app data
 */
const sanitizeImportedData = (data: AppData): AppData => {
  return {
    ...data,
    categories: data.categories.map(cat => ({
      ...cat,
      name: sanitizeText(cat.name),
    })),
    sources: data.sources.map(source => ({
      ...source,
      name: sanitizeText(source.name),
    })),
    budgets: data.budgets.map(budget => ({
      ...budget,
      isFixedCost: budget.isFixedCost || false,  // Ensure boolean type
    })),
    transactions: data.transactions.map(trans => ({
      ...trans,
      note: trans.note ? sanitizeText(trans.note) : trans.note,
      paymentMethod: trans.paymentMethod ? sanitizeText(trans.paymentMethod) : trans.paymentMethod,
    })),
  }
}

/**
 * Exports all application data to a JSON file
 * Uses Tauri save dialog in desktop mode, browser download in web mode
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

    const jsonContent = JSON.stringify(data, null, 2)
    const defaultFileName = `budget-tracker-backup-${new Date().toISOString().split('T')[0]}.json`

    // Try Tauri save dialog (desktop mode)
    const dialog = await getTauriDialog()
    const fs = await getTauriFs()

    if (dialog && fs) {
      // Desktop mode: Show save dialog
      try {
        const filePath = await dialog.save({
          title: 'Salvar Backup',
          defaultPath: defaultFileName,
          filters: [{
            name: 'JSON',
            extensions: ['json']
          }]
        })

        // User cancelled
        if (!filePath) {
          logger.info('Export cancelled by user')
          return
        }

        // Save to chosen location
        await fs.writeTextFile(filePath, jsonContent)
        logger.info('Data exported successfully via Tauri', { filePath })
      } catch (tauriError) {
        logger.error('Tauri export failed, falling back to browser download', { tauriError })
        // Fallback to browser download
        browserDownload(jsonContent, defaultFileName)
      }
    } else {
      // Web mode: Use browser download
      browserDownload(jsonContent, defaultFileName)
    }
  } catch (error) {
    logger.error('Failed to export data', { error })
    throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Downloads file using browser's download mechanism
 */
const browserDownload = (content: string, fileName: string): void => {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  logger.info('Data exported successfully via browser download', { fileName })
}

/**
 * Imports application data from a JSON backup file
 * Uses Tauri open dialog in desktop mode, requires file parameter in web mode
 *
 * @param file - The backup file to import (optional in desktop mode)
 * @throws Error if file is invalid, corrupt, or database operations fail
 */
export const importData = async (file?: File): Promise<void> => {
  let jsonText: string

  // Try Tauri open dialog (desktop mode)
  if (!file) {
    const dialog = await getTauriDialog()
    const fs = await getTauriFs()

    if (dialog && fs) {
      // Desktop mode: Show open dialog
      try {
        const filePath = await dialog.open({
          title: 'Selecionar Backup',
          filters: [{
            name: 'JSON',
            extensions: ['json']
          }],
          multiple: false
        })

        // User cancelled
        if (!filePath) {
          logger.info('Import cancelled by user')
          throw new Error('Import cancelled')
        }

        // Read file from chosen location
        jsonText = await fs.readTextFile(filePath as string)
        logger.info('File read successfully via Tauri', { filePath })
      } catch (tauriError) {
        logger.error('Tauri import failed', { tauriError })
        throw tauriError
      }
    } else {
      throw new Error('No file provided and not in desktop mode')
    }
  } else {
    // Web mode: Read from File object
    jsonText = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  // Parse and validate JSON
  let data: AppData
  try {
    data = JSON.parse(jsonText)
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

  // Sanitize all string fields to prevent XSS
  data = sanitizeImportedData(data)

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
    logger.info('Data imported successfully')
  } catch (dbError) {
    throw new Error(`Database import failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`)
  }
}
