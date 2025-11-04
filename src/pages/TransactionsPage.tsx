import React, { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { TransactionList } from '@/components/transactions/TransactionList'
import { Button } from '@/components/common/Button'

export const TransactionsPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <PageContainer
      title="Transações"
      description="Registre suas receitas e despesas"
      action={
        <Button onClick={() => setIsFormOpen(true)}>
          + Nova Transação
        </Button>
      }
    >
      <TransactionForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      <TransactionList />
    </PageContainer>
  )
}
