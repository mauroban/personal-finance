/**
 * Stub module for @tauri-apps/plugin-dialog
 * Used in web mode when Tauri is not available
 */

export const save = async (): Promise<string | null> => {
  throw new Error('Tauri dialog not available in web mode')
}

export const open = async (): Promise<string | string[] | null> => {
  throw new Error('Tauri dialog not available in web mode')
}
