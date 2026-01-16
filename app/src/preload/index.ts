import { contextBridge, ipcRenderer } from 'electron'

// Audio context for playing sounds
let audioContext: AudioContext | null = null

async function playNotificationSound(base64Audio: string): Promise<void> {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const context = audioContext
    if (context.state === 'suspended') {
      await context.resume()
    }

    // Decode base64 to binary
    const binaryString = atob(base64Audio)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // Decode audio data
    const audioBuffer = await context.decodeAudioData(bytes.buffer)

    const source = context.createBufferSource()
    source.buffer = audioBuffer
    source.connect(context.destination)
    source.start(0)
    
    console.log('Playing notification sound')
  } catch (error) {
    console.error('Failed to play notification sound:', error)
  }
}

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
  },
  window: {
    setAlwaysOnTop: (alwaysOnTop: boolean): void => {
      ipcRenderer.send('window:setAlwaysOnTop', alwaysOnTop)
    },
    floatCard: (cardId: string, cardTitle: string): void => {
      ipcRenderer.send('card:float', cardId, cardTitle)
    },
    dockCard: (cardId: string): void => {
      ipcRenderer.send('card:dock', cardId)
    },
    moveCardWindow: (cardId: string, deltaX: number, deltaY: number): void => {
      ipcRenderer.send('card:move', cardId, deltaX, deltaY)
    },
    onCardClosed: (callback: (cardId: string) => void): void => {
      ipcRenderer.on('card:closed', (_event, cardId: string) => {
        callback(cardId)
      })
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electron', {
      process: {
        versions: process.versions
      }
    })
    
    // Listen for play-notification-sound events
    ipcRenderer.on('play-notification-sound', (_event, soundPath: string) => {
      playNotificationSound(soundPath)
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.electron = {
    process: {
      versions: process.versions
    }
  }
}
