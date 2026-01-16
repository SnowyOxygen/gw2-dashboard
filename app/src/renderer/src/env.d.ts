/// <reference types="vite/client" />

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
  getDailyCrafting: () => Promise<{ success: boolean; data?: string[]; error?: string }>
}

interface GW2API {
  getWorldBossCompletions: () => Promise<{ success: boolean; achievements?: any; error?: string }>
  getAchievementMetadata: (achievementId: number) => Promise<{ success: boolean; data?: any; error?: string }>
  getAllWorldBossAchievements: () => Promise<{ success: boolean; bosses?: any[]; error?: string }>
  getAccountWorldBosses: () => Promise<{ success: boolean; completedBosses?: string[]; error?: string }>
  getAllWorldBosses: () => Promise<{ success: boolean; allBosses?: string[]; error?: string }>
}

interface NotificationAPI {
  sendNotification: (title: string, body?: string) => Promise<{ success: boolean; error?: string }>
  sendSuccess: (title: string, body?: string) => Promise<{ success: boolean; error?: string }>
  sendError: (title: string, body?: string) => Promise<{ success: boolean; error?: string }>
  sendInfo: (title: string, body?: string) => Promise<{ success: boolean; error?: string }>
  sendWarning: (title: string, body?: string) => Promise<{ success: boolean; error?: string }>
}

interface WindowAPI {
  setAlwaysOnTop: (alwaysOnTop: boolean) => void
  floatCard: (cardId: string, cardTitle: string) => void
  dockCard: (cardId: string) => void
  moveCardWindow: (cardId: string, deltaX: number, deltaY: number) => void
  onCardClosed: (callback: (cardId: string) => void) => void
}

declare global {
  interface Window {
    api: {
      settings: SettingsAPI
      gw2: GW2API
      notifications: NotificationAPI
      window: WindowAPI
    }
    electron?: {
      versions?: {
        node: string
        chrome: string
        electron: string
      }
    }
  }
}
