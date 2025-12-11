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
  getAccountData: () => Promise<{ success: boolean; accountData?: any; error?: string }>
}

interface GW2API {
  getWorldBossCompletions: () => Promise<{ success: boolean; achievements?: any; error?: string }>
  getAchievementMetadata: (achievementId: number) => Promise<{ success: boolean; data?: any; error?: string }>
  getAllWorldBossAchievements: () => Promise<{ success: boolean; bosses?: any[]; error?: string }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      settings: SettingsAPI
      gw2: GW2API
    }
  }
}
