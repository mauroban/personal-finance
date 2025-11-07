import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'

interface QuickStartGuideProps {
  onClose: () => void
}

export const QuickStartGuide: React.FC<QuickStartGuideProps> = ({ onClose }) => {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    onClose()
    navigate('/setup')
  }

  const handleDismiss = () => {
    localStorage.setItem('quickStartDismissed', 'true')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Simple Budget Tracker!</h2>
          <p className="text-blue-100">Vamos começar a organizar suas finanças em 3 passos simples</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuração Inicial</h3>
              <p className="text-gray-600 mb-2">
                Comece definindo suas <strong>categorias de despesas</strong> e <strong>fontes de receita</strong>.
              </p>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong>Dica:</strong> O app já vem com categorias brasileiras pré-configuradas!
                  Você pode adicionar, editar ou remover conforme sua necessidade.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Planeje Seu Orçamento</h3>
              <p className="text-gray-600 mb-2">
                Defina quanto você espera <strong>receber</strong> e quanto pretende <strong>gastar</strong> em cada categoria.
              </p>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Dica:</strong> Marque despesas fixas como <strong>recorrentes</strong> (aluguel, assinaturas, etc.)
                  para que sejam copiadas automaticamente para os próximos meses!
                </p>
                <p className="text-xs text-gray-500">
                  Nota: Orçamentos recorrentes deletados serão removidos daquele mês em diante.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xl">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Registre Transações</h3>
              <p className="text-gray-600 mb-2">
                Adicione suas <strong>receitas</strong> e <strong>despesas</strong> conforme elas acontecem.
              </p>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong>Dica:</strong> Use a função de <strong>parcelamento</strong> para dividir
                  compras grandes em várias transações mensais automaticamente!
                </p>
              </div>
            </div>
          </div>

          {/* Important Privacy & Backup Notice */}
          <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 mt-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 text-2xl">⚠️</div>
              <div>
                <h4 className="font-semibold text-amber-900 mb-2">Importante: Seus Dados São Locais</h4>
                <p className="text-sm text-amber-800 mb-2">
                  Todos os seus dados ficam <strong>armazenados apenas no seu dispositivo</strong>.
                  Não há sincronização na nuvem.
                </p>
                <p className="text-sm text-amber-800">
                  <strong>Faça backups regulares!</strong> Use o botão <strong>"Exportar"</strong> no menu
                  para salvar seus dados e não perdê-los se trocar de dispositivo ou limpar o navegador.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between items-center border-t">
          <button
            onClick={handleDismiss}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            Não mostrar novamente
          </button>
          <button
            onClick={handleGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Começar Configuração →
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to check if the quick start guide should be shown
 * Returns true if:
 * 1. User hasn't dismissed it before
 * 2. User hasn't created any budgets or transactions yet (first-time user)
 */
export const useQuickStartGuide = () => {
  const { budgets, transactions, isLoading } = useApp()
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    // Wait for data to load
    if (isLoading) return

    // Check if user has dismissed the guide
    const dismissed = localStorage.getItem('quickStartDismissed') === 'true'
    if (dismissed) {
      setShouldShow(false)
      return
    }

    // Check if user has any budgets or transactions (real user activity)
    // Note: Categories and sources are auto-initialized, so we don't check those
    const isFirstTime = budgets.length === 0 && transactions.length === 0

    setShouldShow(isFirstTime)
  }, [budgets, transactions, isLoading])

  return { shouldShow, setShouldShow }
}
