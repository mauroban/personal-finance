import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useBackup } from '@/hooks/useBackup'
import { Button } from '@/components/common/Button'
import { AlertModal } from '@/components/common/AlertModal'
import { isTauriApp } from '@/utils/tauriHelpers'

export const Navbar: React.FC = () => {
  const location = useLocation()
  const { handleExport, handleImport, isExporting, isImporting } = useBackup()
  const [showImport, setShowImport] = useState(false)
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  })

  const isActive = (path: string) => location.pathname === path

  const handleImportClick = async () => {
    // Desktop mode: Call import directly (will show Tauri dialog)
    if (isTauriApp()) {
      try {
        await handleImport()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        // Don't show error if user cancelled
        if (errorMessage !== 'Import cancelled') {
          setErrorModal({
            isOpen: true,
            message: errorMessage,
          })
        }
      }
    } else {
      // Web mode: Show file input
      setShowImport(true)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        await handleImport(file)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        setErrorModal({
          isOpen: true,
          message: errorMessage,
        })
      }
    }
    setShowImport(false)
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-soft border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent flex items-center gap-2">
              <span className="text-2xl">💰</span> Budget Tracker
            </Link>
            <div className="flex space-x-2">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/')
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/transactions"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/transactions')
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Transações
              </Link>
              <Link
                to="/budget"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/budget')
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Orçamento
              </Link>
              <Link
                to="/setup"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/setup')
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Configuração
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exportando...
                </span>
              ) : (
                'Exportar'
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleImportClick}
              disabled={isImporting}
            >
              {isImporting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importando...
                </span>
              ) : (
                'Importar'
              )}
            </Button>
            {showImport && (
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                ref={(input) => input?.click()}
              />
            )}
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="Erro ao Importar"
        message={errorModal.message}
        variant="error"
      />
    </nav>
  )
}
