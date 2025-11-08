/**
 * Simple File-Based Sync Service
 * No API keys needed - users just pick a file location once
 * Perfect for Google Drive, Dropbox, OneDrive folders
 */

import { db } from '@/db'
import { logger } from '@/utils/logger'

// Type declarations for File System Access API
declare global {
  interface Window {
    showSaveFilePicker(options?: any): Promise<FileSystemFileHandle>
  }
  interface FileSystemFileHandle {
    queryPermission?(options: { mode: string }): Promise<string>
    requestPermission?(options: { mode: string }): Promise<string>
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
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return
    if (!this.isSupported()) return

    const config = await this.getConfig()

    if (config?.enabled && config?.autoSyncEnabled) {
      // Try to restore file handle from IndexedDB
      await this.restoreFileHandle()

      if (this.fileHandle) {
        // Set up data change listeners
        this.setupDataChangeListeners()
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

    // If auto-sync was enabled, initialize
    if (config.autoSyncEnabled && !this.isInitialized) {
      await this.initialize()
    }
  }

  /**
   * Let user pick a file location (one-time setup)
   */
  async setupSyncFile(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('File System Access API não é suportado neste navegador. Use Chrome, Edge, ou Opera.')
    }

    try {
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

        // Do initial sync
        await this.performSync()
      }

      logger.info('File sync configured', { fileName: this.fileHandle?.name })
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled
        throw new Error('Seleção de arquivo cancelada')
      }
      throw error
    }
  }

  /**
   * Save file handle to IndexedDB
   * Note: File handles can be serialized in supported browsers
   */
  private async saveFileHandle(): Promise<void> {
    if (!this.fileHandle) return

    try {
      // Store file handle in IndexedDB
      // @ts-ignore - IndexedDB can store FileSystemFileHandle in modern browsers
      await db.settings.toArray().then(async (settings) => {
        if (settings.length > 0) {
          await db.settings.update(settings[0].id!, {
            // @ts-ignore
            _fileHandle: this.fileHandle,
          })
        }
      })
    } catch (error) {
      logger.error('Failed to save file handle', error)
    }
  }

  /**
   * Restore file handle from IndexedDB
   */
  private async restoreFileHandle(): Promise<void> {
    try {
      const settings = await db.settings.toArray()
      if (settings.length > 0 && (settings[0] as any)._fileHandle) {
        // @ts-ignore
        this.fileHandle = (settings[0] as any)._fileHandle

        // Verify we still have permission (if supported)
        if (this.fileHandle && this.fileHandle.queryPermission) {
          const permission = await this.fileHandle.queryPermission({ mode: 'readwrite' })
          if (permission !== 'granted' && this.fileHandle.requestPermission) {
            // Request permission again
            const newPermission = await this.fileHandle.requestPermission({ mode: 'readwrite' })
            if (newPermission !== 'granted') {
              this.fileHandle = null
              logger.warn('File permission not granted')
            }
          }
        }
      }
    } catch (error) {
      logger.error('Failed to restore file handle', error)
      this.fileHandle = null
    }
  }

  /**
   * Set up data change listeners
   */
  private setupDataChangeListeners(): void {
    const tables = [db.categories, db.sources, db.transactions, db.budgets]

    tables.forEach(table => {
      table.hook('creating', () => this.scheduleSync())
      table.hook('updating', () => this.scheduleSync())
      table.hook('deleting', () => this.scheduleSync())
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
  }

  /**
   * Perform the actual sync
   */
  private async performSync(): Promise<void> {
    if (this.isSyncing) return
    if (!this.fileHandle) return

    const config = await this.getConfig()
    if (!config?.enabled || !config?.autoSyncEnabled) return

    this.isSyncing = true

    try {
      // Export data
      const data = await this.exportData()

      // Create backup of existing file (if it exists)
      await this.createBackup()

      // Write to file
      const writable = await this.fileHandle.createWritable()
      await writable.write(JSON.stringify(data, null, 2))
      await writable.close()

      // Update last sync time
      await this.saveConfig({
        lastSyncTime: Date.now(),
      })

      logger.info('File sync completed')
    } catch (error) {
      logger.error('File sync failed', error)
      throw error
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Manual sync (user-initiated)
   */
  async manualSync(): Promise<void> {
    if (!this.fileHandle) {
      throw new Error('Arquivo de sync não configurado. Configure primeiro.')
    }

    await this.performSync()
  }

  /**
   * Create backup of the current file
   */
  private async createBackup(): Promise<void> {
    if (!this.fileHandle) return

    try {
      // Read current file content
      const file = await this.fileHandle.getFile()
      const content = await file.text()

      if (!content || content.trim() === '') return

      // Save to backup in localStorage with timestamp
      // Note: This is a simplified approach - backups are stored in browser's cache
      localStorage.setItem(`backup-${Date.now()}`, content)

      // Clean old backups (keep only 5)
      this.cleanOldBackups()
    } catch (error) {
      logger.warn('Backup creation failed', error)
    }
  }

  /**
   * Clean old backups from localStorage
   */
  private cleanOldBackups(): void {
    const backupKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('backup-'))
      .sort()
      .reverse()

    // Keep only MAX_BACKUPS
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
   * Import data from file
   */
  async importData(fileContent: string): Promise<void> {
    try {
      const backupData = JSON.parse(fileContent)

      if (!backupData.data || !backupData.version) {
        throw new Error('Arquivo de backup inválido')
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
    } catch (error) {
      logger.error('Import failed', error)
      throw error
    }
  }

  /**
   * Load data from configured file
   */
  async loadFromFile(): Promise<void> {
    if (!this.fileHandle) {
      throw new Error('Arquivo não configurado')
    }

    try {
      const file = await this.fileHandle.getFile()
      const content = await file.text()
      await this.importData(content)
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
  async uploadBackup(file: File): Promise<void> {
    const content = await file.text()
    await this.importData(content)
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
  async restoreFromBackup(backupKey: string): Promise<void> {
    const content = localStorage.getItem(backupKey)
    if (!content) {
      throw new Error('Backup não encontrado')
    }

    await this.importData(content)
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
  async changeSyncFile(): Promise<void> {
    await this.setupSyncFile()
  }
}

export const fileSyncService = new FileSyncService()
