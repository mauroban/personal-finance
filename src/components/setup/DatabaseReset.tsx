import React, { useState } from 'react'
import { Button } from '@/components/common/Button'
import { resetDatabase } from '@/utils/resetDatabase'

export const DatabaseReset: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false)

  const handleReset = async () => {
    const confirmed = window.confirm(
      '⚠️ ATENÇÃO: Esta ação irá apagar TODOS os dados do aplicativo (transações, orçamentos, categorias e fontes personalizadas) e restaurar as configurações padrão.\n\nTem certeza que deseja continuar?'
    )

    if (!confirmed) return

    const doubleConfirm = window.confirm(
      'Esta é sua última chance! Todos os dados serão perdidos permanentemente.\n\nConfirmar reset do banco de dados?'
    )

    if (!doubleConfirm) return

    try {
      setIsResetting(true)
      await resetDatabase()
      alert('✅ Banco de dados resetado com sucesso! A página será recarregada.')
      window.location.reload()
    } catch (error) {
      alert('❌ Erro ao resetar banco de dados. Verifique o console.')
      console.error(error)
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
    </div>
  )
}
