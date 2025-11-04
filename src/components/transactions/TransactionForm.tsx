import React, { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/common/Button'
import { Input, Select, TextArea } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { getTodayString, addMonths, formatDate, parseDate } from '@/utils/date'

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ isOpen, onClose }) => {
  const { categories, sources, addTransaction } = useApp()

  const [type, setType] = useState<'earning' | 'expense'>('expense')
  const [transactionMode, setTransactionMode] = useState<'unique' | 'installment'>('unique')
  const [value, setValue] = useState('')
  const [date, setDate] = useState(getTodayString())
  const [sourceId, setSourceId] = useState('')
  const [groupId, setGroupId] = useState('')
  const [subgroupId, setSubgroupId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cartão de Crédito')
  const [count, setCount] = useState('1')
  const [note, setNote] = useState('')

  const parentCategories = categories.filter(c => !c.parentId)
  const selectedGroup = groupId ? categories.find(c => c.id === parseInt(groupId)) : null
  const subCategories = selectedGroup ? categories.filter(c => c.parentId === selectedGroup.id) : []

  const resetForm = () => {
    setValue('')
    setDate(getTodayString())
    setSourceId('')
    setGroupId('')
    setSubgroupId('')
    setPaymentMethod('Cartão de Crédito')
    setTransactionMode('unique')
    setCount('1')
    setNote('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const numValue = parseFloat(value)
    const numCount = parseInt(count)

    if (!numValue || numValue <= 0) {
      alert('Por favor, insira um valor válido')
      return
    }

    if (type === 'earning' && !sourceId) {
      alert('Por favor, selecione uma fonte de renda')
      return
    }

    if (type === 'expense' && !groupId) {
      alert('Por favor, selecione uma categoria')
      return
    }

    if (transactionMode === 'installment' && numCount < 2) {
      alert('Para parcelas, informe pelo menos 2 repetições')
      return
    }

    if (transactionMode === 'installment') {
      // Create multiple transactions for installments (divide value)
      const installmentValue = numValue / numCount
      const baseDate = parseDate(date)

      for (let i = 0; i < numCount; i++) {
        const installmentDate = addMonths(baseDate, i)
        await addTransaction({
          type,
          value: installmentValue,
          date: formatDate(installmentDate),
          sourceId: type === 'earning' ? parseInt(sourceId) : undefined,
          groupId: type === 'expense' ? parseInt(groupId) : undefined,
          subgroupId: type === 'expense' && subgroupId ? parseInt(subgroupId) : undefined,
          paymentMethod: type === 'expense' ? paymentMethod : undefined,
          installments: numCount,
          installmentNumber: i + 1,
          note: note || undefined,
        })
      }
    } else {
      // Unique transaction
      await addTransaction({
        type,
        value: numValue,
        date,
        sourceId: type === 'earning' ? parseInt(sourceId) : undefined,
        groupId: type === 'expense' ? parseInt(groupId) : undefined,
        subgroupId: type === 'expense' && subgroupId ? parseInt(subgroupId) : undefined,
        paymentMethod: type === 'expense' ? paymentMethod : undefined,
        note: note || undefined,
      })
    }

    resetForm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Transação" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === 'expense' ? 'danger' : 'secondary'}
            className="flex-1"
            onClick={() => setType('expense')}
          >
            Despesa
          </Button>
          <Button
            type="button"
            variant={type === 'earning' ? 'success' : 'secondary'}
            className="flex-1"
            onClick={() => setType('earning')}
          >
            Receita
          </Button>
        </div>

        <div className="border border-gray-200 rounded-lg p-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Transação
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={transactionMode === 'unique' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTransactionMode('unique')}
            >
              Único
            </Button>
            <Button
              type="button"
              variant={transactionMode === 'installment' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTransactionMode('installment')}
            >
              Parcelado
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            min="0"
            value={value}
            onChange={e => setValue(e.target.value)}
            required
            placeholder="0.00"
          />

          <Input
            label="Data"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>

        {transactionMode === 'installment' && (
          <Input
            label="Número de Parcelas"
            type="number"
            min="2"
            value={count}
            onChange={e => setCount(e.target.value)}
            required
            placeholder="Ex: 12"
          />
        )}

        {type === 'earning' ? (
          <Select
            label="Fonte de Renda"
            value={sourceId}
            onChange={e => setSourceId(e.target.value)}
            required
          >
            <option value="">Selecione uma fonte</option>
            {sources.map(source => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </Select>
        ) : (
          <>
            <Select
              label="Categoria"
              value={groupId}
              onChange={e => {
                setGroupId(e.target.value)
                setSubgroupId('')
              }}
              required
            >
              <option value="">Selecione uma categoria</option>
              {parentCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>

            {subCategories.length > 0 && (
              <Select
                label="Subcategoria (Opcional)"
                value={subgroupId}
                onChange={e => setSubgroupId(e.target.value)}
              >
                <option value="">Nenhuma</option>
                {subCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            )}

            <Select
              label="Forma de Pagamento"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="PIX">PIX</option>
              <option value="Transferência">Transferência</option>
              <option value="Boleto">Boleto</option>
            </Select>
          </>
        )}

        <TextArea
          label="Nota (Opcional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          placeholder="Adicione uma nota sobre esta transação..."
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Adicionar</Button>
        </div>
      </form>
    </Modal>
  )
}
