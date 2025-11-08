/**
 * Google Drive API Service
 * Handles authentication, file upload/download, and backup management
 */

export interface GoogleDriveConfig {
  accessToken: string
  refreshToken: string
  expiresAt: number
  folderPath: string
  enabled: boolean
}

export interface BackupFile {
  id: string
  name: string
  createdTime: string
  size: number
}

const SCOPES = 'https://www.googleapis.com/auth/drive.file'
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']

class GoogleDriveService {
  private gapi: any = null
  private tokenClient: any = null
  private isInitialized = false

  /**
   * Initialize Google API client
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    // Check if environment variables are set
    const clientId = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID
    const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY

    if (!clientId || !apiKey) {
      throw new Error(
        'Google Drive credentials not configured. Please set VITE_GOOGLE_DRIVE_CLIENT_ID and VITE_GOOGLE_DRIVE_API_KEY in your .env file. See GOOGLE-DRIVE-SYNC-GUIDE.md for setup instructions.'
      )
    }

    // Load Google API scripts
    await this.loadScript('https://apis.google.com/js/api.js')
    await this.loadScript('https://accounts.google.com/gsi/client')

    return new Promise((resolve, reject) => {
      // @ts-ignore - gapi is loaded from script
      window.gapi.load('client', async () => {
        try {
          // @ts-ignore
          await window.gapi.client.init({
            apiKey: apiKey,
            discoveryDocs: DISCOVERY_DOCS,
          })

          // Initialize OAuth2 token client
          // @ts-ignore - google is loaded from script
          this.tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: SCOPES,
            callback: '', // Will be set per request
          })

          // @ts-ignore
          this.gapi = window.gapi
          this.isInitialized = true
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
  }

  /**
   * Load external script
   */
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
      document.head.appendChild(script)
    })
  }

  /**
   * Authenticate with Google Drive
   */
  async authenticate(): Promise<GoogleDriveConfig> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      this.tokenClient.callback = (response: any) => {
        if (response.error) {
          reject(new Error(response.error))
          return
        }

        const config: GoogleDriveConfig = {
          accessToken: response.access_token,
          refreshToken: '', // Token client handles refresh automatically
          expiresAt: Date.now() + response.expires_in * 1000,
          folderPath: '/Personal Finance Backups',
          enabled: true,
        }

        // Set access token for API calls
        this.gapi.client.setToken({ access_token: response.access_token })

        resolve(config)
      }

      // Request access token
      this.tokenClient.requestAccessToken({ prompt: 'consent' })
    })
  }

  /**
   * Set access token from stored config
   */
  setAccessToken(token: string): void {
    if (this.gapi) {
      this.gapi.client.setToken({ access_token: token })
    }
  }

  /**
   * Get or create backup folder
   */
  async getOrCreateFolder(folderPath: string): Promise<string> {
    const folderName = folderPath.replace(/^\/+/, '').replace(/\/+$/, '')

    // Search for existing folder
    const response = await this.gapi.client.drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    })

    if (response.result.files && response.result.files.length > 0) {
      return response.result.files[0].id
    }

    // Create folder if not exists
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }

    const folder = await this.gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    })

    return folder.result.id
  }

  /**
   * Upload backup file to Google Drive
   * Keeps the current file + 4 older versions (5 total)
   */
  async uploadBackup(data: any, folderPath: string): Promise<void> {
    await this.initialize()

    const folderId = await this.getOrCreateFolder(folderPath)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `budget-backup-${timestamp}.json`

    // Get existing backup files
    const existingFiles = await this.listBackupFiles(folderId)

    // Upload new backup
    const fileContent = JSON.stringify(data, null, 2)
    const file = new Blob([fileContent], { type: 'application/json' })

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: [folderId],
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', file)

    await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.gapi.client.getToken().access_token}`,
      },
      body: form,
    })

    // Delete old backups (keep only 5 most recent: current + 4 backups)
    if (existingFiles.length >= 5) {
      // Sort by created time (newest first)
      existingFiles.sort((a, b) =>
        new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
      )

      // Delete all except the 4 most recent (the new one makes 5 total)
      const filesToDelete = existingFiles.slice(4)
      for (const file of filesToDelete) {
        await this.deleteFile(file.id)
      }
    }
  }

  /**
   * List backup files in folder
   */
  private async listBackupFiles(folderId: string): Promise<BackupFile[]> {
    const response = await this.gapi.client.drive.files.list({
      q: `'${folderId}' in parents and trashed=false and name contains 'budget-backup'`,
      fields: 'files(id, name, createdTime, size)',
      orderBy: 'createdTime desc',
      spaces: 'drive',
    })

    return response.result.files || []
  }

  /**
   * Get list of all backup files for user display
   */
  async getBackupFiles(folderPath: string): Promise<BackupFile[]> {
    await this.initialize()
    const folderId = await this.getOrCreateFolder(folderPath)
    return this.listBackupFiles(folderId)
  }

  /**
   * Download backup file from Google Drive
   */
  async downloadBackup(fileId: string): Promise<any> {
    const response = await this.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    })

    return response.result
  }

  /**
   * Delete file from Google Drive
   */
  private async deleteFile(fileId: string): Promise<void> {
    await this.gapi.client.drive.files.delete({
      fileId: fileId,
    })
  }

  /**
   * Test connection and permissions
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.gapi.client.drive.files.list({
        pageSize: 1,
        fields: 'files(id, name)',
      })
      return true
    } catch (error) {
      console.error('Google Drive connection test failed:', error)
      return false
    }
  }

  /**
   * Disconnect (revoke access)
   */
  async disconnect(): Promise<void> {
    if (this.gapi && this.gapi.client.getToken()) {
      const token = this.gapi.client.getToken().access_token
      // @ts-ignore
      window.google.accounts.oauth2.revoke(token, () => {
        console.log('Access revoked')
      })
      this.gapi.client.setToken(null)
    }
  }
}

export const googleDriveService = new GoogleDriveService()
