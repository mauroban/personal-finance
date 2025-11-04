import React from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { CategoryManager } from '@/components/setup/CategoryManager'
import { SourceManager } from '@/components/setup/SourceManager'
import { DatabaseReset } from '@/components/setup/DatabaseReset'

export const SetupPage: React.FC = () => {
  return (
    <PageContainer
      title="Configuração"
      description="Configure suas categorias de despesas e fontes de renda"
    >
      <div className="space-y-6">
        <CategoryManager />
        <SourceManager />
        <DatabaseReset />
      </div>
    </PageContainer>
  )
}
