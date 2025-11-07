# Desktop Application Build Guide

This guide explains how to build the Simple Budget Tracker as a desktop application for Windows and macOS using Tauri.

## Prerequisites

### 1. Install Rust

Rust is required to build Tauri applications.

#### Windows
1. Download and run [rustup-init.exe](https://rustup.rs/)
2. Follow the installation prompts (accept defaults)
3. Restart your terminal/command prompt
4. Verify installation: `rustc --version`

#### macOS
```bash
# Install via Homebrew (recommended)
brew install rust

# Or use rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Verify installation
rustc --version
cargo --version
```

### 2. Additional Platform Requirements

#### Windows
- **Microsoft Visual Studio C++ Build Tools** (required by Rust)
  - Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
  - Or install Visual Studio 2019/2022 with "Desktop development with C++" workload
- **WebView2** (usually pre-installed on Windows 10/11)
  - If needed: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

#### macOS
- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```

### 3. Node.js Dependencies
All Node.js dependencies should already be installed. If not:
```bash
npm install
```

## Development Mode

Run the app in development mode (with hot reload):

```bash
npm run tauri:dev
```

This will:
1. Start the Vite dev server (React app)
2. Launch the Tauri desktop window
3. Enable hot reload for instant updates
4. Open DevTools with Ctrl+Shift+I (or Cmd+Option+I on macOS)

**First run will take 5-10 minutes** as Rust compiles all dependencies. Subsequent runs are much faster (30-60 seconds).

## Build Production Installers

### Windows (.msi installer)

```bash
npm run tauri:build
```

**Output location:**
```
src-tauri/target/release/bundle/msi/Simple Budget Tracker_1.0.1_x64_en-US.msi
```

**Installer size:** ~60-80 MB

**What users see:**
- Double-click the .msi file
- Windows SmartScreen may warn (click "More info" → "Run anyway")
- Follow installation wizard
- App appears in Start Menu and Desktop (optional)

### macOS (.dmg installer)

```bash
npm run tauri:build
```

**Output location:**
```
src-tauri/target/release/bundle/dmg/Simple Budget Tracker_1.0.1_aarch64.dmg  (Apple Silicon)
src-tauri/target/release/bundle/dmg/Simple Budget Tracker_1.0.1_x64.dmg      (Intel)
```

**Installer size:** ~80-100 MB

**What users see:**
- Double-click the .dmg file
- Drag app icon to Applications folder
- macOS Gatekeeper may block (Right-click → Open → "Open" to bypass)

**Note:** For distribution, you should [code sign](https://tauri.app/v1/guides/distribution/sign-macos/) your app to avoid Gatekeeper warnings.

## App Icons

✅ **Status:** App icons are already generated! A placeholder icon has been created (blue background with "$" symbol).

### Current Icon

The current icon is a simple placeholder (`app-icon.svg`) with:
- Blue background (#3b82f6)
- White "$" symbol
- "Budget" text subtitle
- All required formats generated in `src-tauri/icons/`

### Customize the Icon (Optional)

📖 **See [ICONS.md](./ICONS.md) for detailed icon customization guide**

To replace with your own design:

1. Create a source icon (PNG or SVG, 1024x1024 px minimum, with transparency)
2. Replace `app-icon.svg` or create a new file
3. Run the Tauri icon generator:
   ```bash
   npm run tauri icon path/to/your-icon.png
   # or
   npm run tauri icon app-icon.svg
   ```

This automatically generates all required formats:
- `32x32.png` - Windows taskbar
- `128x128.png` - macOS dock
- `128x128@2x.png` - Retina displays
- `icon.ico` - Windows icon
- `icon.icns` - macOS icon

### Manual Method

Create each icon size manually and place in `src-tauri/icons/`:
- Windows: `icon.ico` (multi-size: 16, 32, 48, 64, 128, 256)
- macOS: `icon.icns` (multi-size: 16, 32, 128, 256, 512, 1024)
- PNG versions for other uses

## Cross-Platform Building

**Important:** Build on the target platform
- Windows builds must be created on Windows
- macOS builds must be created on macOS
- Can't cross-compile between platforms

**For both platforms:**
1. Use a Windows machine → build `.msi`
2. Use a macOS machine → build `.dmg`
3. Or use CI/CD (GitHub Actions) to build both automatically

## Troubleshooting

### "rustc command not found"
Rust is not installed. See [Prerequisites](#prerequisites) above.

### "error: linking with cc failed" (macOS)
Install Xcode Command Line Tools:
```bash
xcode-select --install
```

### "LINK : fatal error LNK1181" (Windows)
Install Visual Studio C++ Build Tools. See [Windows Prerequisites](#windows) above.

### "WebView2 is not installed" (Windows)
Download and install WebView2:
https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Build is very slow (first time)
This is normal! Rust compiles all dependencies on first build (5-10 minutes).
Subsequent builds are much faster (~2-3 minutes).

### App won't open on macOS
macOS Gatekeeper blocks unsigned apps:
1. Right-click the app
2. Select "Open"
3. Click "Open" in the warning dialog
4. For distribution, [code sign your app](https://tauri.app/v1/guides/distribution/sign-macos/)

## Distribution

### Simple Distribution
1. Build the installer (`.msi` or `.dmg`)
2. Upload to your website, Google Drive, or Dropbox
3. Share the download link
4. Users download and install like any app

### Professional Distribution
- **Windows:** Optionally sign with Authenticode certificate
- **macOS:** Code sign and notarize for seamless installation
- **GitHub Releases:** Automated builds with GitHub Actions
- **Auto-updates:** Configure Tauri's updater for automatic updates

## File Size Optimization

Current bundle sizes:
- **Windows:** ~60-80 MB (uses system WebView2)
- **macOS:** ~80-100 MB (uses system WebKit)

These are small compared to Electron apps (150-250 MB) because Tauri uses the operating system's built-in web rendering engine instead of bundling Chromium.

## Data Storage

**Important:** The desktop app stores data the same way as the web app:
- Uses IndexedDB (browser-like storage)
- Data is stored in OS-specific locations:
  - **Windows:** `%APPDATA%\com.simple-budget-tracker.app\`
  - **macOS:** `~/Library/Application Support/com.simple-budget-tracker.app/`
- Users can export/import backups via the app's Export feature
- Data persists between app launches
- Uninstalling the app does NOT delete user data (must be manually removed)

## Development Tips

### Hot Reload
Changes to React code reload automatically in `tauri:dev` mode. For Rust changes, the app restarts.

### DevTools
Press `Ctrl+Shift+I` (Windows) or `Cmd+Option+I` (macOS) to open browser DevTools while in dev mode.

### Build Cache
Delete build cache if you encounter strange issues:
```bash
# Clean Rust build cache
cd src-tauri
cargo clean
cd ..

# Clean Node modules (if needed)
rm -rf node_modules
npm install
```

### Release vs Debug Builds
- `npm run tauri:dev` → Debug build (faster compile, slower runtime, larger file)
- `npm run tauri:build` → Release build (slower compile, optimized runtime, smaller file)

Always distribute Release builds to users!

## Next Steps

1. ✅ Tauri is configured
2. ✅ Rust installed (v1.91.0)
3. ✅ App icons created (placeholder blue "$" icon)
4. ✅ Build complete! v1.0.1 Installers ready at:
   - **MSI:** `src-tauri/target/release/bundle/msi/Simple Budget Tracker_1.0.1_x64_en-US.msi`
   - **NSIS:** `src-tauri/target/release/bundle/nsis/Simple Budget Tracker_1.0.1_x64-setup.exe`
5. ⏳ Test installer on Windows
6. ⏳ (Optional) Customize app icon: Edit `app-icon.svg` and run `npm run tauri icon app-icon.svg`
7. ⏳ Distribute to users!

## Resources

- [Tauri Documentation](https://tauri.app/)
- [Tauri Discord Community](https://discord.com/invite/tauri)
- [Code Signing Guide](https://tauri.app/v1/guides/distribution/sign-macos/)
- [GitHub Actions CI/CD](https://tauri.app/v1/guides/building/cross-platform/)

---

**Questions?** Check the Tauri docs or open an issue in the project repository.
