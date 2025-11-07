/**
 * Checks if the app is running in Tauri (desktop mode)
 * @returns true if running as a Tauri desktop app, false if web browser
 */
export const isTauriApp = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window
}

/**
 * Dynamically imports Tauri dialog plugin (desktop only)
 * @returns dialog plugin or null if not available
 */
export const getTauriDialog = async () => {
  if (!isTauriApp()) return null

  try {
    // @ts-expect-error - Dynamic import of Tauri plugin (uses stub in web mode, real plugin in desktop mode)
    const { save, open } = await import('@tauri-apps/plugin-dialog')
    return { save, open }
  } catch {
    return null
  }
}

/**
 * Dynamically imports Tauri filesystem plugin (desktop only)
 * @returns fs plugin or null if not available
 */
export const getTauriFs = async () => {
  if (!isTauriApp()) return null

  try {
    // @ts-expect-error - Dynamic import of Tauri plugin (uses stub in web mode, real plugin in desktop mode)
    const { writeTextFile, readTextFile } = await import('@tauri-apps/plugin-fs')
    return { writeTextFile, readTextFile }
  } catch {
    return null
  }
}
