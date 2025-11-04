import { useState } from 'react'
import { exportData, importData } from '@/utils/exportImport'
import { resetDatabase } from '@/utils/resetDatabase'

export const useBackup = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportData()
    } catch (error) {
      console.error('Export failed:', error)
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
      console.error('Import failed:', error)
      throw error
    } finally {
      setIsImporting(false)
    }
  }

  const handleReset = async () => {
    if (window.confirm('Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.')) {
      try {
        await resetDatabase()
        window.location.reload()
      } catch (error) {
        console.error('Reset failed:', error)
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
