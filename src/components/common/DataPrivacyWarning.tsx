import React from 'react'

/**
 * Warning component that informs users about local data storage
 * and the importance of regular backups
 */
export const DataPrivacyWarning: React.FC = () => {
  return (
    <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0 text-2xl">⚠️</div>
        <div>
          <h3 className="font-semibold text-amber-900 mb-2">Importante: Seus Dados São Locais</h3>
          <p className="text-sm text-amber-800 mb-2">
            Todos os seus dados ficam <strong>armazenados apenas no seu dispositivo</strong> (navegador).
            Não há sincronização na nuvem ou servidores externos.
          </p>
          <p className="text-sm text-amber-800 font-medium">
            ⚡ <strong>Faça backups regulares!</strong> Use o botão <strong>"Exportar"</strong> no menu superior
            para salvar seus dados. Sem backup, você pode perder tudo se:
          </p>
          <ul className="text-sm text-amber-800 mt-2 ml-6 list-disc space-y-1">
            <li>Limpar os dados do navegador</li>
            <li>Trocar de dispositivo ou computador</li>
            <li>Reinstalar o navegador ou sistema operacional</li>
            <li>O navegador atualizar e perder dados locais</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
