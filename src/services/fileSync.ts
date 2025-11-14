/**
 * Simple File-Based Sync Service
 * No API keys needed - users just pick a file location once
 * Perfect for Google Drive, Dropbox, OneDrive folders
 *
 * SECURITY: All data stays local - no server uploads
 * - Uses File System Access API (local file system only)
 * - Uses IndexedDB (local browser storage)
 * - No fetch/XMLHttpRequest calls
 * - No external API calls
 */

import { db } from '@/db'
import { logger } from '@/utils/logger'

// Type declarations for File System Access API
declare global {
  interface Window {
    showSaveFilePicker(options?: any): Promise<FileSystemFileHandle>
    showOpenFilePicker(options?: any): Promise<FileSystemFileHandle[]>
    showDirectoryPicker(options?: any): Promise<FileSystemDirectoryHandle>
  }
  interface FileSystemFileHandle {
    queryPermission?(options: { mode: string }): Promise<string>
    requestPermission?(options: { mode: string }): Promise<string>
  }
  interface FileSystemDirectoryHandle {
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>
  }
}

interface FileSyncConfig {
  enabled: boolean
  fileName: string
  autoSyncEnabled: boolean
  lastSyncTime: number
}

class FileSyncService {
  private fileHandle: FileSystemFileHandle | null = null
  private saveTimeout: ReturnType<typeof setTimeout> | null = null
  private isInitialized = false
  private isSyncing = false
  private readonly DEBOUNCE_DELAY = 5000 // 5 seconds
  private readonly MAX_BACKUPS = 5

  /**
   * Check if File System Access API is supported
   */
  isSupported(): boolean {
    return 'showSaveFilePicker' in window
  }

  /**
   * Initialize sync service
   * FIXED: Better file handle restoration with permission handling
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return
    if (!this.isSupported()) return

    const config = await this.getConfig()

    if (config?.enabled && config?.autoSyncEnabled) {
      // Try to restore file handle from IndexedDB
      await this.restoreFileHandle()

      if (this.fileHandle) {
        // Verify we have write permission
        const hasPermission = await this.verifyFilePermission()

        if (hasPermission) {
          // Set up data change listeners
          this.setupDataChangeListeners()
          logger.info('Auto-sync enabled and listeners registered')
        } else {
          logger.warn('File permission denied - user needs to reconfigure')
          this.fileHandle = null
        }
      } else {
        logger.warn('File handle could not be restored - user may need to reconfigure')
      }
    }

    this.isInitialized = true
    logger.info('File sync service initialized')
  }

  /**
   * Get sync configuration
   */
  async getConfig(): Promise<FileSyncConfig | null> {
    const settings = await db.settings.toArray()
    if (settings.length === 0) return null

    return {
      enabled: settings[0].enabled || false,
      fileName: settings[0].folderPath || 'budget-data.json',
      autoSyncEnabled: settings[0].autoSyncEnabled || false,
      lastSyncTime: settings[0].lastSyncTime || 0,
    }
  }

  /**
   * Save sync configuration
   */
  async saveConfig(config: Partial<FileSyncConfig>): Promise<void> {
    const existing = await db.settings.toArray()

    if (existing.length > 0) {
      await db.settings.update(existing[0].id!, config as any)
    } else {
      await db.settings.add(config as any)
    }

    // If auto-sync was just enabled, re-initialize
    if (config.autoSyncEnabled && this.fileHandle) {
      this.setupDataChangeListeners()
    }
  }

  /**
   * Check if user has existing data in database
   */
  async hasExistingData(): Promise<boolean> {
    const [categories, sources, transactions, budgets] = await Promise.all([
      db.categories.count(),
      db.sources.count(),
      db.transactions.count(),
      db.budgets.count(),
    ])

    return categories > 0 || sources > 0 || transactions > 0 || budgets > 0
  }

  /**
   * Let user pick a file location (one-time setup)
   * If user has existing data, offer to save it first
   * FIXED: Returns info about existing file content
   */
  async setupSyncFile(): Promise<{
    needsInitialSave: boolean
    fileHasContent: boolean
    fileContent?: string
  }> {
    if (!this.isSupported()) {
      throw new Error('File System Access API não é suportado neste navegador. Use Chrome, Edge, ou Opera.')
    }

    try {
      // Check if user has existing data in database
      const hasData = await this.hasExistingData()

      // Get suggested file name
      const config = await this.getConfig()
      const suggestedName = config?.fileName || 'budget-data.json'

      // Show file picker
      this.fileHandle = await window.showSaveFilePicker({
        suggestedName: suggestedName,
        types: [
          {
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          },
        ],
      })

      // Check if selected file has content
      let fileHasContent = false
      let fileContent: string | undefined = undefined
      try {
        const file = await this.fileHandle.getFile()
        const content = await file.text()
        fileHasContent = content.trim().length > 0
        if (fileHasContent) {
          fileContent = content
        }
      } catch (error) {
        // File doesn't exist yet or can't be read
        fileHasContent = false
      }

      // Save file handle to IndexedDB for future use
      await this.saveFileHandle()

      // Save initial configuration
      if (this.fileHandle) {
        await this.saveConfig({
          enabled: true,
          fileName: this.fileHandle.name,
          autoSyncEnabled: true,
          lastSyncTime: 0,
        })

        // Set up data change listeners immediately
        this.setupDataChangeListeners()
        logger.info('Auto-sync listeners registered after setup')
      }

      logger.info('File sync configured', {
        fileName: this.fileHandle?.name,
        hasExistingData: hasData,
        fileHasContent
      })

      // Return info about initial save needs
      return {
        needsInitialSave: hasData,
        fileHasContent,
        fileContent
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('Seleção de arquivo cancelada')
      }
      throw error
    }
  }

  /**
   * Save file handle to IndexedDB
   */
  private async saveFileHandle(): Promise<void> {
    if (!this.fileHandle) return

    try {
      const settings = await db.settings.toArray()
      if (settings.length > 0) {
        await db.settings.update(settings[0].id!, {
          // @ts-ignore - IndexedDB can store FileSystemFileHandle in modern browsers
          _fileHandle: this.fileHandle,
        })
      }
    } catch (error) {
      logger.error('Failed to save file handle', error)
    }
  }

  /**
   * Restore file handle from IndexedDB
   * FIXED: Better error handling and permission checking
   */
  private async restoreFileHandle(): Promise<void> {
    try {
      const settings = await db.settings.toArray()
      if (settings.length > 0 && (settings[0] as any)._fileHandle) {
        // @ts-ignore - FileSystemFileHandle can be stored in IndexedDB
        this.fileHandle = (settings[0] as any)._fileHandle
        logger.info('File handle restored from IndexedDB')
      }
    } catch (error) {
      logger.error('Failed to restore file handle', error)
      this.fileHandle = null
    }
  }

  /**
   * Verify we have write permission to the file
   * FIXED: Proper permission verification without auto-requesting
   */
  private async verifyFilePermission(): Promise<boolean> {
    if (!this.fileHandle) return false

    try {
      // Check if queryPermission is supported
      if (this.fileHandle.queryPermission) {
        const permission = await this.fileHandle.queryPermission({ mode: 'readwrite' })
        if (permission === 'granted') {
          return true
        }

        // Permission not granted - don't auto-request, user needs to manually reconfigure
        logger.warn('File permission not granted - user needs to reconfigure sync')
        return false
      }

      // If queryPermission not supported, assume we have permission
      // We'll find out on first write attempt
      return true
    } catch (error) {
      logger.error('Failed to verify file permission', error)
      return false
    }
  }

  /**
   * Set up data change listeners - FIXED to properly trigger sync
   */
  private setupDataChangeListeners(): void {
    const tables = [db.categories, db.sources, db.transactions, db.budgets]

    // Remove existing hooks first to avoid duplicates
    tables.forEach(table => {
      table.hook('creating').unsubscribe(this.scheduleSync)
      table.hook('updating').unsubscribe(this.scheduleSync)
      table.hook('deleting').unsubscribe(this.scheduleSync)
    })

    // Add hooks with proper binding
    const boundScheduleSync = this.scheduleSync.bind(this)

    tables.forEach(table => {
      table.hook('creating', boundScheduleSync)
      table.hook('updating', boundScheduleSync)
      table.hook('deleting', boundScheduleSync)
    })

    logger.info('Data change listeners set up for file sync')
  }

  /**
   * Schedule sync with debouncing
   */
  private scheduleSync(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }

    this.saveTimeout = setTimeout(() => {
      this.performSync().catch(error => {
        logger.error('Auto-sync failed', error)
      })
    }, this.DEBOUNCE_DELAY)

    logger.debug('Sync scheduled in 5 seconds')
  }

  /**
   * Perform the actual sync
   */
  private async performSync(): Promise<void> {
    if (this.isSyncing) {
      logger.debug('Sync already in progress, skipping')
      return
    }
    if (!this.fileHandle) {
      logger.warn('No file handle, cannot sync')
      return
    }

    const config = await this.getConfig()
    if (!config?.enabled || !config?.autoSyncEnabled) {
      logger.debug('Auto-sync disabled, skipping')
      return
    }

    this.isSyncing = true

    try {
      // Export data
      const data = await this.exportData()

      // Create backup BEFORE overwriting
      await this.createBackup()

      // Write to main file
      const writable = await this.fileHandle.createWritable()
      await writable.write(JSON.stringify(data, null, 2))
      await writable.close()

      // Update last sync time
      await this.saveConfig({
        lastSyncTime: Date.now(),
      })

      logger.info('File sync completed successfully')
    } catch (error) {
      logger.error('File sync failed', error)
      throw error
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Manual sync (user-initiated)
   * FIXED: Better error handling and permission requesting
   */
  async manualSync(): Promise<void> {
    if (!this.fileHandle) {
      throw new Error('Arquivo de sync não configurado. Vá em Configuração → Sync de Arquivos para configurar.')
    }

    // Try to request permission if needed
    try {
      if (this.fileHandle.queryPermission) {
        const permission = await this.fileHandle.queryPermission({ mode: 'readwrite' })

        if (permission !== 'granted' && this.fileHandle.requestPermission) {
          const newPermission = await this.fileHandle.requestPermission({ mode: 'readwrite' })
          if (newPermission !== 'granted') {
            throw new Error('Permissão de arquivo negada. Reconfigure o sync em Configuração.')
          }
        }
      }

      await this.performSync()
    } catch (error) {
      // If error is about permissions, clear the file handle
      if ((error as Error).message.includes('Permission') || (error as Error).message.includes('denied')) {
        this.fileHandle = null
        await this.saveConfig({ enabled: false })
        throw new Error('Permissão de arquivo perdida. Por favor, reconfigure o sync.')
      }
      throw error
    }
  }

  /**
   * Create backup in localStorage before sync
   * SIMPLIFIED: File-based backups don't work due to browser restrictions
   */
  private async createBackup(): Promise<void> {
    if (!this.fileHandle) return

    try {
      // Read current file content
      const file = await this.fileHandle.getFile()
      const content = await file.text()

      if (!content || content.trim() === '') return

      // Always use localStorage for backups (browser restrictions prevent file-based backups)
      await this.createBackupInLocalStorage(content)
    } catch (error) {
      logger.warn('Backup creation failed', error)
    }
  }

  /**
   * Fallback: Create backup in localStorage
   */
  private async createBackupInLocalStorage(content: string): Promise<void> {
    const timestamp = Date.now()
    localStorage.setItem(`backup-${timestamp}`, content)
    this.cleanOldBackups()
  }


  /**
   * Clean old backups from localStorage (fallback)
   */
  private cleanOldBackups(): void {
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('backup-'))
      .sort()
      .reverse()

    if (backupKeys.length > this.MAX_BACKUPS) {
      backupKeys.slice(this.MAX_BACKUPS).forEach(key => {
        localStorage.removeItem(key)
      })
    }
  }

  /**
   * Export all data
   */
  async exportData(): Promise<any> {
    const [categories, sources, transactions, budgets] = await Promise.all([
      db.categories.toArray(),
      db.sources.toArray(),
      db.transactions.toArray(),
      db.budgets.toArray(),
    ])

    return {
      version: 4,
      exportDate: new Date().toISOString(),
      data: {
        categories,
        sources,
        transactions,
        budgets,
      },
    }
  }

  /**
   * Import data from file - WITH SAFETY CHECK
   */
  async importData(fileContent: string, force: boolean = false): Promise<{ hasExistingData: boolean; imported: boolean }> {
    try {
      const backupData = JSON.parse(fileContent)

      if (!backupData.data || !backupData.version) {
        throw new Error('Arquivo de backup inválido')
      }

      // Check if user has existing data
      const hasData = await this.hasExistingData()

      // If user has data and didn't force, return warning
      if (hasData && !force) {
        return {
          hasExistingData: true,
          imported: false,
        }
      }

      // Clear and import
      await db.transaction('rw', [db.categories, db.sources, db.transactions, db.budgets], async () => {
        await db.categories.clear()
        await db.sources.clear()
        await db.transactions.clear()
        await db.budgets.clear()

        if (backupData.data.categories?.length) {
          await db.categories.bulkAdd(backupData.data.categories)
        }
        if (backupData.data.sources?.length) {
          await db.sources.bulkAdd(backupData.data.sources)
        }
        if (backupData.data.transactions?.length) {
          await db.transactions.bulkAdd(backupData.data.transactions)
        }
        if (backupData.data.budgets?.length) {
          await db.budgets.bulkAdd(backupData.data.budgets)
        }
      })

      logger.info('Data imported successfully')

      return {
        hasExistingData: hasData,
        imported: true,
      }
    } catch (error) {
      logger.error('Import failed', error)
      throw error
    }
  }

  /**
   * Load data from configured file - WITH SAFETY CHECK
   */
  async loadFromFile(force: boolean = false): Promise<{ hasExistingData: boolean; imported: boolean }> {
    if (!this.fileHandle) {
      throw new Error('Arquivo não configurado')
    }

    try {
      const file = await this.fileHandle.getFile()
      const content = await file.text()
      return await this.importData(content, force)
    } catch (error) {
      logger.error('Failed to load from file', error)
      throw error
    }
  }

  /**
   * Export to browser download (fallback for unsupported browsers)
   */
  async downloadBackup(): Promise<void> {
    const data = await this.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Import from browser file picker (fallback)
   */
  async uploadBackup(file: File, force: boolean = false): Promise<{ hasExistingData: boolean; imported: boolean }> {
    const content = await file.text()
    return await this.importData(content, force)
  }

  /**
   * Get list of available backups from localStorage
   */
  getAvailableBackups(): Array<{ key: string; timestamp: number; size: number }> {
    const backups = Object.keys(localStorage)
      .filter(key => key.startsWith('backup-'))
      .map(key => {
        const content = localStorage.getItem(key) || ''
        const timestamp = parseInt(key.replace('backup-', ''))
        return {
          key,
          timestamp,
          size: new Blob([content]).size,
        }
      })
      .sort((a, b) => b.timestamp - a.timestamp)

    return backups
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupKey: string, force: boolean = false): Promise<{ hasExistingData: boolean; imported: boolean }> {
    const content = localStorage.getItem(backupKey)
    if (!content) {
      throw new Error('Backup não encontrado')
    }

    return await this.importData(content, force)
  }

  /**
   * Disconnect sync
   */
  async disconnect(): Promise<void> {
    this.fileHandle = null

    const existing = await db.settings.toArray()
    if (existing.length > 0) {
      await db.settings.update(existing[0].id!, {
        enabled: false,
        autoSyncEnabled: false,
        // @ts-ignore
        _fileHandle: null,
      })
    }

    this.isInitialized = false
    logger.info('File sync disconnected')
  }

  /**
   * Change sync file location
   */
  async changeSyncFile(): Promise<{
    needsInitialSave: boolean
    fileHasContent: boolean
    fileContent?: string
  }> {
    return await this.setupSyncFile()
  }

  /**
   * Check if sync is currently active and working
   */
  async isSyncActive(): Promise<boolean> {
    const config = await this.getConfig()

    if (!config?.enabled || !config?.autoSyncEnabled) {
      return false
    }

    if (!this.fileHandle) {
      return false
    }

    return await this.verifyFilePermission()
  }

  /**
   * Get the current sync status for display
   */
  async getSyncStatus(): Promise<{
    isActive: boolean
    fileName: string | null
    lastSyncTime: number
    needsReconfigure: boolean
  }> {
    const config = await this.getConfig()
    const isActive = await this.isSyncActive()

    return {
      isActive,
      fileName: config?.fileName || null,
      lastSyncTime: config?.lastSyncTime || 0,
      needsReconfigure: Boolean(config?.enabled && !isActive),
    }
  }
}


export const fileSyncService = new FileSyncService()
