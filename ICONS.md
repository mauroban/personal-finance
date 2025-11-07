# App Icon Guide

## Current Icon

The application currently uses a **placeholder icon** with:
- Blue gradient background (#3b82f6)
- White dollar sign "$" symbol
- "Budget" subtitle text
- Clean, professional look

**Source file:** `app-icon.svg` (1024x1024px SVG)

## Generated Icon Files

All platform-specific icons are located in `src-tauri/icons/`:

### Windows
- `icon.ico` - Multi-resolution Windows icon (16, 32, 48, 64, 128, 256px)
- `32x32.png`, `64x64.png`, `128x128.png` - Taskbar and system tray
- Various APPX icons for Windows Store (if needed)

### macOS
- `icon.icns` - Multi-resolution macOS icon bundle
- `128x128.png`, `128x128@2x.png` - Dock and Finder
- Various iOS icons (if building for mobile)

### Android
- `mipmap-*` folders with launcher icons in various densities

## How to Customize the Icon

### Option 1: Quick Placeholder Update

1. Edit `app-icon.svg` directly (it's a simple SVG file)
2. Change colors, text, or design as needed
3. Regenerate all icons:
   ```bash
   npm run tauri icon app-icon.svg
   ```

### Option 2: Create New Icon from Scratch

1. Design a new icon in your favorite design tool
2. Export as PNG (1024x1024px minimum) or SVG with transparency
3. Save it (e.g., `my-icon.png`)
4. Generate all platform icons:
   ```bash
   npm run tauri icon my-icon.png
   ```

### Option 3: Use the Icon Generator Script

The `create-icon.js` script can be modified to generate different placeholder designs:

1. Edit `create-icon.js` to change:
   - Background color (`fill="#3b82f6"`)
   - Text content (the "$" symbol)
   - Text size, position, or style
2. Run the generator:
   ```bash
   node create-icon.js
   ```
3. Regenerate all icons:
   ```bash
   npm run tauri icon app-icon.svg
   ```

## Design Recommendations

### General Guidelines
- **Size:** 1024x1024px minimum for source file
- **Format:** PNG with transparency or SVG preferred
- **Style:** Simple, clear design that works at small sizes (16x16px)
- **Colors:** High contrast for visibility
- **Text:** Avoid small text - it becomes unreadable at icon sizes

### Platform-Specific Tips

**Windows:**
- Test how it looks at 16x16px (taskbar size)
- Consider a solid background (transparency can look odd in some Windows themes)
- Square or slightly rounded corners work best

**macOS:**
- Rounded square (squircle) shape is standard
- macOS applies its own shadow and rounding
- Test on light and dark mode

**Mobile (Android/iOS):**
- Avoid fine details - they disappear on small screens
- Center your main element
- Use platform-specific safe zones

## Testing Your Icon

After regenerating icons:

1. **In Development:**
   ```bash
   npm run tauri:dev
   ```
   Check the window title bar and taskbar/dock

2. **In Production Build:**
   ```bash
   npm run tauri:build
   ```
   Install the MSI/DMG and check:
   - Installation wizard
   - Start menu / Applications folder
   - Desktop shortcut (if created)
   - Taskbar / Dock when running

## Troubleshooting

### "Icon not changing after rebuild"
- Clear the build cache: `cd src-tauri && cargo clean && cd ..`
- Rebuild: `npm run tauri:build`

### "Icon looks blurry"
- Ensure source icon is at least 1024x1024px
- Use PNG or SVG (avoid JPEG)
- Check that the design has sharp edges

### "Icon doesn't match design tool preview"
- Operating systems apply effects (shadows, rounding)
- Test on actual target platform
- Consider creating platform-specific versions

## Resources

- [Tauri Icon Documentation](https://tauri.app/v1/guides/features/icons/)
- [macOS Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Windows Icon Guidelines](https://learn.microsoft.com/en-us/windows/apps/design/style/iconography/app-icon-design)
- [Icon design best practices](https://www.figma.com/blog/creating-app-icons/)

## Files in This Project

- `app-icon.svg` - Source icon (editable SVG)
- `create-icon.js` - Script to generate placeholder SVG programmatically
- `src-tauri/icons/` - All generated platform-specific icons
- `ICONS.md` - This documentation file
