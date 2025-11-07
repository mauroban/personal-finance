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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 dark:bg-purple-500 rounded-lg flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Categorias de Despesas</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Organize suas despesas em categorias e subcategorias
            </p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex-shrink-0">+ Adicionar</Button>
      </div>

      <div className="space-y-3">
        {parentCategories.map(parent => (
          <div key={parent.id} className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">{parent.name}</h3>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(parent.id!)}
                aria-label={`Excluir categoria ${parent.name}`}
              >
                Excluir
              </Button>
            </div>
            {getSubcategories(parent.id!).length > 0 && (
              <div className="pl-4 space-y-2 border-l-2 border-gray-300 dark:border-gray-600">
                {getSubcategories(parent.id!).map(sub => (
                  <div key={sub.id} className="flex justify-between items-center py-1.5 px-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">• {sub.name}</span>
                    <button
                      onClick={() => handleDelete(sub.id!)}
                      className="px-2 py-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs font-semibold rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                      aria-label={`Excluir subcategoria ${sub.name}`}
                    >
                      Excluir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {parentCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-3">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
              Nenhuma categoria cadastrada
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Adicione sua primeira categoria para começar!
            </p>
          </div>
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
