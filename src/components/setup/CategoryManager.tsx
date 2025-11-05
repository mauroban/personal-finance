import React, { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'

export const CategoryManager: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useApp()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<number | undefined>()

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

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      await deleteCategory(id)
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
    </div>
  )
}
