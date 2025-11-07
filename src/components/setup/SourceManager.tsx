import React, { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { ConfirmModal } from '@/components/common/ConfirmModal'

export const SourceManager: React.FC = () => {
  const { sources, addSource, deleteSource } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSourceName, setNewSourceName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  })

  const handleAddSource = async () => {
    if (!newSourceName.trim()) return

    await addSource({
      name: newSourceName.trim(),
    })

    setNewSourceName('')
    setIsModalOpen(false)
  }

  const handleDelete = (id: number) => {
    setDeleteConfirm({ isOpen: true, id })
  }

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteSource(deleteConfirm.id)
      setDeleteConfirm({ isOpen: false, id: null })
    }
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-sm border border-green-200 dark:border-green-800/50 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600 dark:bg-green-500 rounded-lg flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Fontes de Renda</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Gerencie suas fontes de receita
            </p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex-shrink-0">+ Adicionar</Button>
      </div>

      <div className="space-y-2">
        {sources.map(source => (
          <div
            key={source.id}
            className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-700/50 rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-900 dark:text-white font-semibold">{source.name}</span>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(source.id!)}
              aria-label={`Excluir fonte de renda ${source.name}`}
            >
              Excluir
            </Button>
          </div>
        ))}

        {sources.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-3">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
              Nenhuma fonte de renda cadastrada
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Adicione sua primeira fonte para começar!
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Adicionar Fonte de Renda"
      >
        <div className="space-y-4">
          <Input
            label="Nome da Fonte de Renda"
            value={newSourceName}
            onChange={e => setNewSourceName(e.target.value)}
            placeholder="Ex: Salário, Freelance, Investimentos"
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSource} disabled={!newSourceName.trim()}>
              Adicionar
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Excluir Fonte de Renda"
        message="Tem certeza que deseja excluir esta fonte de renda? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}
