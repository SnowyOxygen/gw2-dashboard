import { ElectronAPI } from '@electron-toolkit/preload'

interface SettingsAPI {
  hasApiKey: () => Promise<boolean>
  getApiKey: () => Promise<string | null>
  setApiKey: (apiKey: string) => Promise<boolean>
  clearApiKey: () => Promise<boolean>
  hasCompletedSetup: () => Promise<boolean>
  setAccountName: (name: string) => Promise<boolean>
  getAccountName: () => Promise<string | null>
  validateApiKey: (apiKey: string) => Promise<{ success: boolean; accountData?: any; error?: string }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      settings: SettingsAPI
    }
  }
}
