import { AppData } from '@/types'
import { db } from '@/db'

export const exportData = async (): Promise<void> => {
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
}

export const importData = async (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        const data: AppData = JSON.parse(text)

        if (!data.version || !data.categories || !data.sources || !data.budgets || !data.transactions) {
          throw new Error('Invalid backup file format')
        }

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

        resolve()
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export const resetAllData = async (): Promise<void> => {
  await db.transaction('rw', db.categories, db.sources, db.budgets, db.transactions, async () => {
    await db.categories.clear()
    await db.sources.clear()
    await db.budgets.clear()
    await db.transactions.clear()
  })
}
