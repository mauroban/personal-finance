/**
 * Stub module for @tauri-apps/plugin-fs
 * Used in web mode when Tauri is not available
 */

export const writeTextFile = async (): Promise<void> => {
  throw new Error('Tauri fs not available in web mode')
}

export const readTextFile = async (): Promise<string> => {
  throw new Error('Tauri fs not available in web mode')
}
