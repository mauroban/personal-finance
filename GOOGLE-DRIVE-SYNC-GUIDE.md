# 🔄 Google Drive Sync Setup Guide

Your budget tracker now has **automatic Google Drive sync** with one-time setup!

## ✨ Features

- ✅ **One-time setup** - Configure once, sync forever
- ✅ **Automatic backup** - Saves to Google Drive on every change (5-second delay)
- ✅ **Version history** - Keeps current + 4 backup versions (5 total)
- ✅ **100% Private** - Data stays in YOUR Google Drive
- ✅ **Restore anytime** - Roll back to any backup with one click
- ✅ **Cross-device sync** - Access from web, mobile, and desktop

---

## 📋 Prerequisites

Before you can use Google Drive sync, you need to set up Google Cloud credentials:

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"**
3. Name it: `Personal Finance Tracker`
4. Click **"Create"**

### Step 2: Enable Google Drive API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Drive API"**
3. Click on it and click **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (unless you have Google Workspace)
3. Fill in the required fields:
   - **App name**: `Personal Finance Tracker`
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Click **"Save and Continue"**
5. On **"Scopes"** page, click **"Add or Remove Scopes"**
6. Search for `https://www.googleapis.com/auth/drive.file` and select it
7. Click **"Save and Continue"**
8. On **"Test users"**, add your email address
9. Click **"Save and Continue"**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Select **"Web application"**
4. Name it: `Budget Tracker Web`
5. Under **"Authorized JavaScript origins"**, add:
   ```
   http://localhost:5173
   https://mauroban.github.io
   ```
6. Under **"Authorized redirect URIs"**, add:
   ```
   http://localhost:5173
   https://mauroban.github.io/personal-finance
   ```
7. Click **"Create"**
8. **Copy the Client ID** (you'll need this)

### Step 5: Create API Key

1. Still in **"Credentials"**, click **"+ Create Credentials"** → **"API Key"**
2. Click **"Restrict Key"** (recommended)
3. Under **"API restrictions"**, select **"Restrict key"**
4. Choose **"Google Drive API"**
5. Click **"Save"**
6. **Copy the API Key** (you'll need this)

---

## 🔧 Configure Your App

### For Development (localhost)

Create a `.env` file in the project root:

```env
VITE_GOOGLE_DRIVE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
VITE_GOOGLE_DRIVE_API_KEY=your-api-key-here
VITE_GOOGLE_DRIVE_REDIRECT_URI=http://localhost:5173
```

### For Production (GitHub Pages)

1. Go to your GitHub repository
2. Click **"Settings"** → **"Secrets and variables"** → **"Actions"**
3. Add these repository secrets:
   - `VITE_GOOGLE_DRIVE_CLIENT_ID`: Your Client ID
   - `VITE_GOOGLE_DRIVE_API_KEY`: Your API Key

4. Update your build workflow (`.github/workflows/deploy.yml`) to use secrets:

```yaml
env:
  VITE_GOOGLE_DRIVE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_DRIVE_CLIENT_ID }}
  VITE_GOOGLE_DRIVE_API_KEY: ${{ secrets.VITE_GOOGLE_DRIVE_API_KEY }}
  VITE_GOOGLE_DRIVE_REDIRECT_URI: https://mauroban.github.io/personal-finance
```

---

## 🚀 How to Use

### First-Time Setup

1. **Open the app** (web, mobile browser, or desktop)
2. Go to **"Configuração"** (Setup) page
3. Look for the **"Sync com Google Drive"** section
4. Click **"Conectar Google Drive"**
5. Sign in with your Google account
6. Grant permissions to access Google Drive
7. Done! ✅

### What Happens Next

Once connected:

- 📁 A folder called **"Personal Finance Backups"** is created in your Google Drive
- 💾 Every time you make a change (add transaction, edit budget, etc.), the app automatically saves a backup after **5 seconds** of inactivity
- 📊 The app keeps **5 versions**:
  - Current (most recent)
  - Backup 1 (previous version)
  - Backup 2 (2 versions ago)
  - Backup 3 (3 versions ago)
  - Backup 4 (4 versions ago)
- 🗑️ Older backups are automatically deleted

### Manual Backup

If you want to force a backup right now:

1. Go to **"Configuração"** page
2. Scroll to **"Sync com Google Drive"**
3. Click **"Fazer Backup Agora"**

### Restore from Backup

If you need to restore your data:

1. Go to **"Configuração"** page
2. Scroll to **"Sync com Google Drive"**
3. Click **"Atualizar"** to load available backups
4. Find the backup you want to restore
5. Click **"Restaurar"**
6. Confirm the action
7. Reload the page

### Toggle Auto-Sync

You can turn off automatic sync (manual backups only):

1. Go to **"Configuração"** page
2. Toggle the **"Auto-sync"** switch OFF
3. Now you can only backup manually using **"Fazer Backup Agora"**

### Disconnect

To remove Google Drive integration:

1. Go to **"Configuração"** page
2. Click **"Desconectar"**
3. Your backup files will remain in Google Drive, but the app will no longer auto-sync

---

## 🔐 Security & Privacy

### Your Data is Safe

- ✅ **End-to-end privacy**: Data goes directly from your device to YOUR Google Drive
- ✅ **No third-party servers**: We don't store anything
- ✅ **Limited permissions**: App only accesses files it creates (not your entire Drive)
- ✅ **You're in control**: Disconnect anytime, delete backups anytime

### What Permissions Are Required?

The app requests:
- `https://www.googleapis.com/auth/drive.file` - Access only to files created by this app

This is the **most restrictive** Drive permission. The app **cannot**:
- ❌ See your other files
- ❌ Access files created by other apps
- ❌ Delete files it didn't create

---

## 🌍 Cross-Device Usage

### Scenario: Use on Multiple Devices

**Example**: You use the tracker on your laptop (web) and phone (mobile browser)

1. **Setup on Device 1** (e.g., laptop):
   - Connect Google Drive as described above
   - Your data is backed up

2. **Setup on Device 2** (e.g., phone):
   - Open the app on your phone
   - Go to **"Configuração"**
   - Click **"Conectar Google Drive"**
   - Sign in with the **same Google account**
   - Click **"Atualizar"** in the backups section
   - Click **"Restaurar"** on the latest backup
   - Reload the page

3. **Going forward**:
   - Both devices will auto-sync to the same Google Drive folder
   - Changes on Device 1 → Auto-backup → Restore on Device 2 to get latest
   - Changes on Device 2 → Auto-backup → Restore on Device 1 to get latest

**Note**: This is not real-time sync. You need to manually restore the latest backup on the other device to see changes.

---

## 📂 File Structure in Google Drive

Your backups are stored as JSON files:

```
Google Drive/
└── Personal Finance Backups/
    ├── budget-backup-2025-01-08T10-30-00-000Z.json  (Current)
    ├── budget-backup-2025-01-07T15-20-00-000Z.json  (Backup 1)
    ├── budget-backup-2025-01-06T09-10-00-000Z.json  (Backup 2)
    ├── budget-backup-2025-01-05T08-45-00-000Z.json  (Backup 3)
    └── budget-backup-2025-01-04T14-30-00-000Z.json  (Backup 4)
```

Each file contains:
- Categories
- Sources
- Transactions
- Budgets

---

## 🛠️ Technical Details

### Auto-Save Mechanism

1. **Data change detected** (e.g., you add a transaction)
2. **5-second timer starts** (debounce - waits for you to stop making changes)
3. **If no new changes** within 5 seconds → Backup is created
4. **If you make another change** → Timer resets to 5 seconds

This prevents creating a backup on every keystroke and saves bandwidth.

### Backup File Format

```json
{
  "version": 4,
  "exportDate": "2025-01-08T10:30:00.000Z",
  "data": {
    "categories": [...],
    "sources": [...],
    "transactions": [...],
    "budgets": [...]
  }
}
```

### Version Management

- The app keeps **exactly 5 backups** at all times
- When a 6th backup is created, the oldest is automatically deleted
- This prevents your Drive from filling up with old backups

---

## ❓ Troubleshooting

### "Access token expired" Error

**Solution**:
1. Go to **"Configuração"**
2. Click **"Desconectar"**
3. Click **"Conectar Google Drive"** again
4. Sign in to refresh the token

### Can't See Backups

**Solution**:
1. Make sure you're connected to Google Drive
2. Click **"Atualizar"** in the backups section
3. If still no backups, click **"Fazer Backup Agora"** to create one

### Sync Not Working

**Solution**:
1. Check that **"Auto-sync"** is toggled ON
2. Check browser console for errors (F12)
3. Verify you're using the correct Google account
4. Try disconnecting and reconnecting

### "Failed to connect" Error

**Possible causes**:
- Incorrect Client ID or API Key in `.env`
- Google Drive API not enabled in Cloud Console
- OAuth consent screen not configured
- Redirect URI mismatch

**Solution**:
1. Double-check all credentials
2. Verify redirect URIs match exactly (including http vs https)
3. Make sure Google Drive API is enabled

---

## 🎯 Best Practices

1. **Connect on all devices** you use
2. **Manually restore** the latest backup when switching devices
3. **Keep Auto-sync ON** for automatic backups
4. **Check backups periodically** to ensure sync is working
5. **Don't delete** the "Personal Finance Backups" folder from Drive

---

## 🔄 Migration from Local-Only

If you've been using the app without sync:

1. All your existing data is stored locally (IndexedDB)
2. When you connect Google Drive, it will **backup your current data**
3. Your local data remains untouched
4. You can restore from backup on other devices

---

## 📊 What Gets Synced?

**Synced**:
- ✅ Categories (income/expense)
- ✅ Sources (salary, freelance, etc.)
- ✅ Transactions
- ✅ Budgets

**Not Synced**:
- ❌ App settings (theme, view preferences)
- ❌ Sync configuration itself

This means you need to connect Google Drive on each device separately.

---

## 🚀 Next Steps

1. ✅ Complete Google Cloud setup (above)
2. ✅ Add credentials to `.env` (development) or GitHub Secrets (production)
3. ✅ Deploy the app
4. ✅ Connect Google Drive from the Setup page
5. ✅ Enjoy automatic backups!

---

**Happy syncing! 🎉**

Your data is now safely backed up and accessible from anywhere!
