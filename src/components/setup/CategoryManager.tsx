import React, { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { ConfirmModal } from '@/components/common/ConfirmModal'

export const CategoryManager: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<number | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  })

  const parentCategories = categories.filter(c => !c.parentId)

  const getSubcategories = (parentId: number) => {
    return categories.filter(c => c.parentId === parentId)
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      return
    }

    await addCategory({
      name: newCategoryName.trim(),
      parentId: selectedParentId,
    })

    setNewCategoryName('')
    setSelectedParentId(undefined)
    setIsModalOpen(false)
  }

  const handleDelete = (id: number) => {
    setDeleteConfirm({ isOpen: true, id })
  }

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      await deleteCategory(deleteConfirm.id)
      setDeleteConfirm({ isOpen: false, id: null })
    }
  }

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Categorias de Despesas</h2>
        <Button onClick={() => setIsModalOpen(true)}>Adicionar Categoria</Button>
      </div>

      <div className="space-y-4">
        {parentCategories.map(parent => (
          <div key={parent.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-900">{parent.name}</h3>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(parent.id!)}
                aria-label={`Excluir categoria ${parent.name}`}
              >
                Excluir
              </Button>
            </div>
            <div className="pl-4 space-y-1">
              {getSubcategories(parent.id!).map(sub => (
                <div key={sub.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">• {sub.name}</span>
                  <button
                    onClick={() => handleDelete(sub.id!)}
                    className="text-red-600 hover:text-red-800 text-xs"
                    aria-label={`Excluir subcategoria ${sub.name}`}
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {parentCategories.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            Nenhuma categoria cadastrada. Adicione sua primeira categoria!
          </p>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Adicionar Categoria"
      >
        <div className="space-y-4">
          <Input
            label="Nome da Categoria (Grupo Principal)"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            placeholder="Ex: Moradia, Transporte"
          />

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">Ou adicionar subcategoria:</p>
            <div className="space-y-2">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={selectedParentId || ''}
                onChange={e => {
                  const value = e.target.value
                  setSelectedParentId(value ? parseInt(value) : undefined)
                  if (value) setNewCategoryName('')
                }}
              >
                <option value="">Selecione uma categoria principal</option>
                {parentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {selectedParentId && (
                <Input
                  placeholder="Nome da subcategoria"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
              Adicionar
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Excluir Categoria"
        message="Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}
