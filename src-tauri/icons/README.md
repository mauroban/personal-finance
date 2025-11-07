# App Icons

This directory should contain the application icons in various formats.

## Required Files

- `32x32.png` - 32x32 pixel PNG icon
- `128x128.png` - 128x128 pixel PNG icon
- `128x128@2x.png` - 256x256 pixel PNG icon (2x resolution)
- `icon.icns` - macOS icon file
- `icon.ico` - Windows icon file

## How to Generate Icons

### Option 1: Use Tauri Icon Generator (Recommended)

```bash
npm install -g @tauri-apps/cli
npm run tauri icon path/to/your-icon.png
```

This will automatically generate all required icon formats from a single source image.

**Requirements for source image:**
- At least 512x512 pixels (1024x1024 recommended)
- PNG format with transparency
- Square aspect ratio

### Option 2: Manual Creation

Create each icon size manually using your preferred image editor (Photoshop, GIMP, Figma, etc.)

### Option 3: Online Icon Generators

Use online tools like:
- https://www.convertico.com/
- https://cloudconvert.com/png-to-ico
- https://iconverticons.com/online/

## Temporary Placeholder

Until you add custom icons, Tauri will use default placeholder icons during development. The app will still build and run, but you should add proper icons before distributing to users.
