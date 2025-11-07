// Simple script to create a basic placeholder icon
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a simple SVG icon (1024x1024)
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" fill="#3b82f6" rx="180"/>

  <!-- Dollar sign symbol -->
  <text x="512" y="700" font-family="Arial, sans-serif" font-size="600" font-weight="bold" fill="white" text-anchor="middle">$</text>

  <!-- Subtitle -->
  <text x="512" y="850" font-family="Arial, sans-serif" font-size="80" fill="white" text-anchor="middle" opacity="0.9">Budget</text>
</svg>`;

// Write the SVG file
const iconPath = path.join(__dirname, 'app-icon.svg');
fs.writeFileSync(iconPath, svg);
console.log('Created placeholder icon at:', iconPath);
