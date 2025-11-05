import { useState } from 'react'
import { exportData, importData } from '@/utils/exportImport'
import { resetDatabase } from '@/utils/resetDatabase'
import { logger } from '@/utils/logger'

export const useBackup = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportData()
    } catch (error) {
      logger.error('Export failed in useBackup hook', { error })
      throw error
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (file: File) => {
    setIsImporting(true)
    try {
      await importData(file)
      window.location.reload()
    } catch (error) {
      logger.error('Import failed in useBackup hook', { error })
      throw error
    } finally {
      setIsImporting(false)
    }
  }

  const handleReset = async () => {
    if (
      window.confirm(
        'Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.'
      )
    ) {
      try {
        await resetDatabase()
        window.location.reload()
      } catch (error) {
        logger.error('Reset failed in useBackup hook', { error })
        throw error
      }
    }
  }

  return {
    handleExport,
    handleImport,
    handleReset,
    isExporting,
    isImporting,
  }
}
