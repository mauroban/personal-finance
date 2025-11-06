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
    <div className="card p-6 border-2 border-red-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Zona de Perigo</h2>
          <p className="text-sm text-gray-600">
            Resetar o banco de dados irá apagar todos os dados e restaurar as configurações padrão.
            <br />
            <span className="font-semibold text-red-600">Esta ação não pode ser desfeita!</span>
          </p>
        </div>
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
