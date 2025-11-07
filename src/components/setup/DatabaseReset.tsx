import React, { useState } from 'react'
import { Button } from '@/components/common/Button'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { AlertModal } from '@/components/common/AlertModal'
import { resetDatabase } from '@/utils/resetDatabase'
import { logger } from '@/utils/logger'

export const DatabaseReset: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false)
  const [showFirstConfirm, setShowFirstConfirm] = useState(false)
  const [showSecondConfirm, setShowSecondConfirm] = useState(false)
  const [resultModal, setResultModal] = useState<{
    isOpen: boolean
    variant: 'success' | 'error'
    message: string
  }>({
    isOpen: false,
    variant: 'success',
    message: '',
  })

  const handleReset = () => {
    setShowFirstConfirm(true)
  }

  const handleFirstConfirm = () => {
    setShowFirstConfirm(false)
    setShowSecondConfirm(true)
  }

  const handleFinalConfirm = async () => {
    setShowSecondConfirm(false)

    try {
      setIsResetting(true)
      await resetDatabase()
      setResultModal({
        isOpen: true,
        variant: 'success',
        message: 'Banco de dados resetado com sucesso! A página será recarregada.',
      })
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      setResultModal({
        isOpen: true,
        variant: 'error',
        message: 'Erro ao resetar banco de dados. Tente novamente.',
      })
      logger.error('Failed to reset database from UI', { error })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-red-200 dark:border-red-800 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-600 dark:bg-red-500 rounded-lg flex-shrink-0">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Zona de Perigo</h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Resetar o banco de dados irá apagar todos os dados e restaurar as configurações padrão. Esta ação não pode ser desfeita!
          </p>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
        <p className="text-sm text-red-800 dark:text-red-200 font-semibold">
          ⚠️ Aviso: Todos os dados (transações, orçamentos, categorias e fontes) serão perdidos permanentemente.
        </p>
      </div>

      <Button
        variant="danger"
        onClick={handleReset}
        disabled={isResetting}
      >
        {isResetting ? 'Resetando...' : '🗑️ Resetar Banco de Dados'}
      </Button>

      <ConfirmModal
        isOpen={showFirstConfirm}
        onClose={() => setShowFirstConfirm(false)}
        onConfirm={handleFirstConfirm}
        title="⚠️ ATENÇÃO"
        message="Esta ação irá apagar TODOS os dados do aplicativo (transações, orçamentos, categorias e fontes personalizadas) e restaurar as configurações padrão. Tem certeza que deseja continuar?"
        confirmText="Continuar"
        cancelText="Cancelar"
        variant="warning"
      />

      <ConfirmModal
        isOpen={showSecondConfirm}
        onClose={() => setShowSecondConfirm(false)}
        onConfirm={handleFinalConfirm}
        title="Última Confirmação"
        message="Esta é sua última chance! Todos os dados serão perdidos permanentemente. Confirmar reset do banco de dados?"
        confirmText="Sim, Resetar Tudo"
        cancelText="Cancelar"
        variant="danger"
      />

      <AlertModal
        isOpen={resultModal.isOpen}
        onClose={() => setResultModal({ ...resultModal, isOpen: false })}
        title={resultModal.variant === 'success' ? 'Sucesso' : 'Erro'}
        message={resultModal.message}
        variant={resultModal.variant}
      />
    </div>
  )
}
