import React, { useState, useEffect } from 'react'
import { syncService } from '@/services/syncService'
import { googleDriveService, BackupFile } from '@/services/googleDrive'
import { SyncSettings } from '@/db'

export const GoogleDriveSyncSettings: React.FC = () => {
  const [settings, setSettings] = useState<SyncSettings | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoadingBackups, setIsLoadingBackups] = useState(false)
  const [backups, setBackups] = useState<BackupFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const syncSettings = await syncService.getSyncSettings()
      setSettings(syncSettings || null)
    } catch (err) {
      console.error('Failed to load sync settings:', err)
    }
  }

  const loadBackups = async () => {
    if (!settings?.enabled) return

    setIsLoadingBackups(true)
    setError(null)

    try {
      const backupFiles = await syncService.getAvailableBackups()
      setBackups(backupFiles)
    } catch (err) {
      setError('Falha ao carregar backups: ' + (err as Error).message)
    } finally {
      setIsLoadingBackups(false)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)
    setSuccess(null)

    try {
      const config = await googleDriveService.authenticate()

      await syncService.saveSyncSettings({
        ...config,
        autoSyncEnabled: true,
        lastSyncTime: 0,
      })

      await loadSettings()
      setSuccess('Google Drive conectado com sucesso!')

      // Initialize sync service
      await syncService.initialize()
    } catch (err) {
      const errorMessage = (err as Error).message

      // Check if it's a credentials error
      if (errorMessage.includes('credentials not configured') || errorMessage.includes('client_id')) {
        setError('❌ Credenciais do Google Drive não configuradas. Você precisa criar um arquivo .env com VITE_GOOGLE_DRIVE_CLIENT_ID e VITE_GOOGLE_DRIVE_API_KEY. Veja GOOGLE-DRIVE-SYNC-GUIDE.md para instruções completas.')
      } else {
        setError('Falha ao conectar: ' + errorMessage)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Desconectar do Google Drive? Você precisará reconectar para usar o sync automático.')) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await syncService.disconnect()
      setSettings(null)
      setBackups([])
      setSuccess('Desconectado do Google Drive')
    } catch (err) {
      setError('Falha ao desconectar: ' + (err as Error).message)
    }
  }

  const handleToggleAutoSync = async () => {
    if (!settings) return

    try {
      const newAutoSyncState = !settings.autoSyncEnabled
      await syncService.saveSyncSettings({
        autoSyncEnabled: newAutoSyncState,
      })

      await loadSettings()
      setSuccess(newAutoSyncState ? 'Auto-sync ativado' : 'Auto-sync desativado')
    } catch (err) {
      setError('Falha ao atualizar configurações: ' + (err as Error).message)
    }
  }

  const handleManualSync = async () => {
    setIsSyncing(true)
    setError(null)
    setSuccess(null)

    try {
      await syncService.manualSync()
      await loadSettings()
      setSuccess('Backup criado com sucesso!')
    } catch (err) {
      setError('Falha ao fazer backup: ' + (err as Error).message)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleRestoreBackup = async (fileId: string, fileName: string) => {
    if (!confirm(`Restaurar backup "${fileName}"? Todos os dados atuais serão substituídos.`)) {
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await syncService.restoreFromBackup(fileId)
      setSuccess('Backup restaurado com sucesso! Recarregue a página.')
    } catch (err) {
      setError('Falha ao restaurar backup: ' + (err as Error).message)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Sync com Google Drive
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Sincronize seus dados automaticamente com o Google Drive
          </p>
        </div>
        <div className="text-4xl">☁️</div>
      </div>

      {/* Error/Success Messages */}
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

      {!settings?.enabled ? (
        /* Not Connected State */
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Google Drive não conectado
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Conecte sua conta do Google Drive para fazer backup automático dos seus dados.
              Seus dados ficarão salvos na pasta "Personal Finance Backups" no seu Google Drive.
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Conectando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                </svg>
                Conectar Google Drive
              </>
            )}
          </button>

          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            <p className="mb-1">✓ Backup automático a cada mudança (5s de delay)</p>
            <p className="mb-1">✓ Mantém 5 versões (atual + 4 backups)</p>
            <p>✓ 100% privado - dados salvos no seu Google Drive</p>
          </div>
        </div>
      ) : (
        /* Connected State */
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="font-medium text-green-900 dark:text-green-100">
                    Conectado ao Google Drive
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    Pasta: {settings.folderPath}
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

          {/* Auto-Sync Toggle */}
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
                settings.autoSyncEnabled
                  ? 'bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoSyncEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Last Sync Info */}
          {settings.lastSyncTime && settings.lastSyncTime > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Último backup: {formatDate(new Date(settings.lastSyncTime).toISOString())}
            </div>
          )}

          {/* Manual Sync Button */}
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSyncing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Fazendo backup...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Fazer Backup Agora
              </>
            )}
          </button>

          {/* Backups List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Backups Disponíveis
              </h3>
              <button
                onClick={loadBackups}
                disabled={isLoadingBackups}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium disabled:opacity-50"
              >
                {isLoadingBackups ? 'Carregando...' : 'Atualizar'}
              </button>
            </div>

            {backups.length === 0 && !isLoadingBackups && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                Nenhum backup encontrado. Clique em "Fazer Backup Agora" para criar o primeiro.
              </div>
            )}

            {backups.length > 0 && (
              <div className="space-y-2">
                {backups.map((backup, index) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {index === 0 ? '📌 Atual' : `🕐 Backup ${index}`}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {formatDate(backup.createdTime)} • {formatFileSize(backup.size)}
                      </div>
                    </div>
                    {index > 0 && (
                      <button
                        onClick={() => handleRestoreBackup(backup.id, backup.name)}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Restaurar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
