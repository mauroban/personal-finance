/**
 * Sync Service
 * Handles automatic backup to Google Drive with debouncing
 */

import { db, SyncSettings } from '@/db'
import { googleDriveService } from './googleDrive'
import { logger } from '@/utils/logger'

class SyncService {
  private saveTimeout: ReturnType<typeof setTimeout> | null = null
  private isInitialized = false
  private isSyncing = false
  private readonly DEBOUNCE_DELAY = 5000 // 5 seconds - wait for user to stop making changes

  /**
   * Initialize sync service and set up data change listeners
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    const settings = await this.getSyncSettings()

    if (settings?.enabled && settings?.autoSyncEnabled) {
      // Set up Dexie hooks to watch for data changes
      this.setupDataChangeListeners()

      // Set access token for API calls
      if (settings.accessToken && Date.now() < settings.expiresAt) {
        await googleDriveService.initialize()
        googleDriveService.setAccessToken(settings.accessToken)
      }
    }

    this.isInitialized = true
    logger.info('Sync service initialized')
  }

  /**
   * Get sync settings from database
   */
  async getSyncSettings(): Promise<SyncSettings | undefined> {
    const settings = await db.settings.toArray()
    return settings[0]
  }

  /**
   * Save sync settings to database
   */
  async saveSyncSettings(settings: Partial<SyncSettings>): Promise<void> {
    const existing = await db.settings.toArray()

    if (existing.length > 0) {
      await db.settings.update(existing[0].id!, settings)
    } else {
      await db.settings.add(settings as SyncSettings)
    }

    // If auto-sync was just enabled, initialize listeners
    if (settings.autoSyncEnabled && !this.isInitialized) {
      await this.initialize()
    }

    logger.info('Sync settings saved', settings)
  }

  /**
   * Set up listeners for data changes
   */
  private setupDataChangeListeners(): void {
    // Listen to changes on all tables
    const tables = [db.categories, db.sources, db.transactions, db.budgets]

    tables.forEach(table => {
      // On create
      table.hook('creating', () => {
        this.scheduleSync()
      })

      // On update
      table.hook('updating', () => {
        this.scheduleSync()
      })

      // On delete
      table.hook('deleting', () => {
        this.scheduleSync()
      })
    })

    logger.info('Data change listeners set up')
  }

  /**
   * Schedule a sync with debouncing
   * Waits for user to stop making changes before syncing
   */
  private scheduleSync(): void {
    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }

    // Schedule new sync
    this.saveTimeout = setTimeout(() => {
      this.performSync().catch(error => {
        logger.error('Auto-sync failed', error)
      })
    }, this.DEBOUNCE_DELAY)

    logger.debug('Sync scheduled')
  }

  /**
   * Perform the actual sync to Google Drive
   */
  private async performSync(): Promise<void> {
    if (this.isSyncing) {
      logger.debug('Sync already in progress, skipping')
      return
    }

    const settings = await this.getSyncSettings()

    if (!settings?.enabled || !settings?.autoSyncEnabled) {
      logger.debug('Sync disabled, skipping')
      return
    }

    this.isSyncing = true

    try {
      // Check if token is expired
      if (Date.now() >= settings.expiresAt) {
        logger.warn('Access token expired, sync skipped')
        // TODO: Implement token refresh or notify user to re-authenticate
        this.isSyncing = false
        return
      }

      // Export all data
      const data = await this.exportAllData()

      // Upload to Google Drive
      await googleDriveService.uploadBackup(data, settings.folderPath)

      // Update last sync time
      await this.saveSyncSettings({
        lastSyncTime: Date.now(),
      })

      logger.info('Auto-sync completed successfully')
    } catch (error) {
      logger.error('Sync failed', error)
      throw error
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Manually trigger a sync (for user-initiated sync)
   */
  async manualSync(): Promise<void> {
    const settings = await this.getSyncSettings()

    if (!settings?.enabled) {
      throw new Error('Google Drive sync is not configured')
    }

    if (Date.now() >= settings.expiresAt) {
      throw new Error('Access token expired. Please reconnect Google Drive.')
    }

    await this.performSync()
  }

  /**
   * Export all data from database
   */
  async exportAllData(): Promise<any> {
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
   * Import data from backup
   */
  async importData(backupData: any): Promise<void> {
    try {
      // Validate backup data
      if (!backupData.data || !backupData.version) {
        throw new Error('Invalid backup file format')
      }

      // Clear existing data
      await db.transaction('rw', [db.categories, db.sources, db.transactions, db.budgets], async () => {
        await db.categories.clear()
        await db.sources.clear()
        await db.transactions.clear()
        await db.budgets.clear()

        // Import data
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

      logger.info('Data imported successfully', {
        categories: backupData.data.categories?.length || 0,
        sources: backupData.data.sources?.length || 0,
        transactions: backupData.data.transactions?.length || 0,
        budgets: backupData.data.budgets?.length || 0,
      })
    } catch (error) {
      logger.error('Import failed', error)
      throw error
    }
  }

  /**
   * Download and restore from a specific backup
   */
  async restoreFromBackup(fileId: string): Promise<void> {
    const settings = await this.getSyncSettings()

    if (!settings?.enabled) {
      throw new Error('Google Drive sync is not configured')
    }

    // Download backup file
    const backupData = await googleDriveService.downloadBackup(fileId)

    // Import the data
    await this.importData(backupData)
  }

  /**
   * Get list of available backups
   */
  async getAvailableBackups() {
    const settings = await this.getSyncSettings()

    if (!settings?.enabled) {
      throw new Error('Google Drive sync is not configured')
    }

    return await googleDriveService.getBackupFiles(settings.folderPath)
  }

  /**
   * Disconnect Google Drive
   */
  async disconnect(): Promise<void> {
    // Revoke access
    await googleDriveService.disconnect()

    // Clear settings
    const existing = await db.settings.toArray()
    if (existing.length > 0) {
      await db.settings.delete(existing[0].id!)
    }

    this.isInitialized = false
    logger.info('Google Drive disconnected')
  }

  /**
   * Test connection to Google Drive
   */
  async testConnection(): Promise<boolean> {
    return await googleDriveService.testConnection()
  }
}

export const syncService = new SyncService()
