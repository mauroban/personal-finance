import React, { useState, useEffect } from 'react'
import { fileSyncService } from '@/services/fileSync'

export const FileSyncSettings: React.FC = () => {
  const [config, setConfig] = useState<any>(null)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [backups, setBackups] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    loadConfig()
    setIsSupported(fileSyncService.isSupported())
  }, [])

  const loadConfig = async () => {
    try {
      const syncConfig = await fileSyncService.getConfig()
      setConfig(syncConfig)

      if (syncConfig?.enabled) {
        const availableBackups = fileSyncService.getAvailableBackups()
        setBackups(availableBackups)
      }
    } catch (err) {
      console.error('Failed to load config:', err)
    }
  }

  const handleSetup = async () => {
    setIsSettingUp(true)
    setError(null)
    setSuccess(null)

    try {
      await fileSyncService.setupSyncFile()
      await loadConfig()
      setSuccess('✅ Sync configurado! Seus dados serão salvos automaticamente neste arquivo.')

      // Initialize service
      await fileSyncService.initialize()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSettingUp(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Desconectar sync? Você precisará configurar novamente.')) {
      return
    }

    try {
      await fileSyncService.disconnect()
      setConfig(null)
      setBackups([])
      setSuccess('Sync desconectado')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleToggleAutoSync = async () => {
    if (!config) return

    try {
      const newState = !config.autoSyncEnabled
      await fileSyncService.saveConfig({
        autoSyncEnabled: newState,
      })
      await loadConfig()
      setSuccess(newState ? 'Auto-sync ativado' : 'Auto-sync desativado')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleManualSync = async () => {
    setIsSyncing(true)
    setError(null)
    setSuccess(null)

    try {
      await fileSyncService.manualSync()
      await loadConfig()
      setSuccess('✅ Dados salvos com sucesso!')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleLoadFromFile = async () => {
    if (!confirm('Carregar dados do arquivo? Isso substituirá todos os dados atuais.')) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await fileSyncService.loadFromFile()
      setSuccess('✅ Dados carregados! Recarregue a página para ver as mudanças.')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleDownloadBackup = async () => {
    try {
      await fileSyncService.downloadBackup()
      setSuccess('✅ Backup baixado!')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleUploadBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!confirm('Importar este backup? Todos os dados atuais serão substituídos.')) {
      event.target.value = ''
      return
    }

    try {
      await fileSyncService.uploadBackup(file)
      setSuccess('✅ Backup restaurado! Recarregue a página.')
      event.target.value = ''
    } catch (err) {
      setError((err as Error).message)
      event.target.value = ''
    }
  }

  const handleRestoreBackup = async (backupKey: string) => {
    if (!confirm('Restaurar este backup? Todos os dados atuais serão substituídos.')) {
      return
    }

    try {
      await fileSyncService.restoreFromBackup(backupKey)
      setSuccess('✅ Backup restaurado! Recarregue a página.')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (!isSupported) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Sync de Arquivos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Sincronize automaticamente com um arquivo local
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <div className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                Navegador não suportado
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                Seu navegador não suporta o File System Access API. Use Chrome, Edge, ou Opera para sync automático.
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleDownloadBackup}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  📥 Baixar Backup (JSON)
                </button>
                <label className="block">
                  <span className="sr-only">Importar backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleUploadBackup}
                    className="block w-full text-sm text-gray-600 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                      file:text-sm file:font-medium file:bg-green-600 file:text-white
                      hover:file:bg-green-700 file:cursor-pointer cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Sync de Arquivos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Salve automaticamente em um arquivo (Google Drive, Dropbox, OneDrive, etc.)
          </p>
        </div>
        <div className="text-4xl">💾</div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-sm text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      {!config?.enabled ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Sync não configurado
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Configure uma vez e seus dados serão salvos automaticamente.
              Escolha um arquivo na sua pasta do Google Drive, Dropbox, ou OneDrive para sync automático entre dispositivos.
            </p>
          </div>

          <button
            onClick={handleSetup}
            disabled={isSettingUp}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isSettingUp ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Configurando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Escolher Arquivo de Sync
              </>
            )}
          </button>

          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            <p className="mb-1">✓ Salva automaticamente a cada 5 segundos</p>
            <p className="mb-1">✓ Mantém 5 backups automáticos</p>
            <p className="mb-1">✓ Funciona com Google Drive, Dropbox, OneDrive</p>
            <p>✓ Sem necessidade de API keys ou cadastros</p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Ou use backup manual:
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleDownloadBackup}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                📥 Baixar Backup
              </button>
              <label className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer text-sm inline-flex items-center">
                📤 Carregar Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleUploadBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-medium text-green-900 dark:text-green-100">
                    Sync Ativo
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    Arquivo: {config.fileName}
                  </div>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                Desconectar
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Auto-sync</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Salvar automaticamente a cada mudança
              </div>
            </div>
            <button
              onClick={handleToggleAutoSync}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.autoSyncEnabled
                  ? 'bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.autoSyncEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {config.lastSyncTime > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Último sync: {formatDate(config.lastSyncTime)}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Salvar Agora
                </>
              )}
            </button>

            <button
              onClick={handleLoadFromFile}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Carregar do Arquivo
            </button>
          </div>

          {backups.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Backups Automáticos ({backups.length})
              </h3>
              <div className="space-y-2">
                {backups.slice(0, 5).map((backup, index) => (
                  <div
                    key={backup.key}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {index === 0 ? '📌 Mais recente' : `🕐 Backup ${index}`}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {formatDate(backup.timestamp)} • {formatFileSize(backup.size)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestoreBackup(backup.key)}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      Restaurar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSetup}
              className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              📁 Mudar arquivo de sync
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
