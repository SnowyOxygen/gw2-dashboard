import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  settings: {
    hasApiKey: (): Promise<boolean> => ipcRenderer.invoke('settings:hasApiKey'),
    getApiKey: (): Promise<string | null> => ipcRenderer.invoke('settings:getApiKey'),
    setApiKey: (apiKey: string): Promise<boolean> => ipcRenderer.invoke('settings:setApiKey', apiKey),
    clearApiKey: (): Promise<boolean> => ipcRenderer.invoke('settings:clearApiKey'),
    hasCompletedSetup: (): Promise<boolean> => ipcRenderer.invoke('settings:hasCompletedSetup'),
    setAccountName: (name: string): Promise<boolean> => ipcRenderer.invoke('settings:setAccountName', name),
    getAccountName: (): Promise<string | null> => ipcRenderer.invoke('settings:getAccountName'),
    validateApiKey: (apiKey: string): Promise<{ success: boolean; accountData?: any; error?: string }> => 
      ipcRenderer.invoke('settings:validateApiKey', apiKey),
    getAccountData: (): Promise<{ success: boolean; accountData?: any; error?: string }> => 
      ipcRenderer.invoke('settings:getAccountData'),
    getDailyCrafting: (): Promise<{ success: boolean; data?: string[]; error?: string }> =>
      ipcRenderer.invoke('settings:getDailyCrafting')
  },
  gw2: {
    getWorldBossCompletions: (): Promise<{ success: boolean; achievements?: any; error?: string }> =>
      ipcRenderer.invoke('api:getWorldBossCompletions'),
    getAchievementMetadata: (achievementId: number): Promise<{ success: boolean; data?: any; error?: string }> =>
      ipcRenderer.invoke('api:getAchievementMetadata', achievementId),
    getAllWorldBossAchievements: (): Promise<{ success: boolean; bosses?: any[]; error?: string }> =>
      ipcRenderer.invoke('api:getAllWorldBossAchievements'),
    getAccountWorldBosses: (): Promise<{ success: boolean; completedBosses?: string[]; error?: string }> =>
      ipcRenderer.invoke('api:getAccountWorldBosses'),
    getAllWorldBosses: (): Promise<{ success: boolean; allBosses?: string[]; error?: string }> =>
      ipcRenderer.invoke('api:getAllWorldBosses')
  },
  notifications: {
    sendNotification: (title: string, body?: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('notifications:send', { title, body }),
    sendSuccess: (title: string, body?: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('notifications:sendSuccess', { title, body }),
    sendError: (title: string, body?: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('notifications:sendError', { title, body }),
    sendInfo: (title: string, body?: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('notifications:sendInfo', { title, body }),
    sendWarning: (title: string, body?: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('notifications:sendWarning', { title, body })
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
