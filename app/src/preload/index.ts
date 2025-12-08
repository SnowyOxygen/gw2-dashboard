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
      ipcRenderer.invoke('settings:validateApiKey', apiKey)
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
