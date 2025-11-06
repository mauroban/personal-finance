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
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Fontes de Renda</h2>
        <Button onClick={() => setIsModalOpen(true)}>Adicionar Fonte</Button>
      </div>

      <div className="space-y-2">
        {sources.map(source => (
          <div
            key={source.id}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
          >
            <span className="text-gray-900">{source.name}</span>
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
          <p className="text-gray-500 text-center py-8">
            Nenhuma fonte de renda cadastrada. Adicione sua primeira fonte!
          </p>
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
