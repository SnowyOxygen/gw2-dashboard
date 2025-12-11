import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { settingsStore } from './store'
import { NotificationService, setMainWindow } from './notifications'

// Global notification service (will be initialized after window creation)
let notificationService: NotificationService | null = null
let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Initialize notification service with window reference
  notificationService = new NotificationService()
  setMainWindow(mainWindow)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Settings Store IPC Handlers
  ipcMain.handle('settings:hasApiKey', () => {
    return settingsStore.hasApiKey()
  })

  ipcMain.handle('settings:getApiKey', () => {
    return settingsStore.getApiKey()
  })

  ipcMain.handle('settings:setApiKey', (_, apiKey: string) => {
    settingsStore.setApiKey(apiKey)
    return true
  })

  ipcMain.handle('settings:clearApiKey', () => {
    settingsStore.clearApiKey()
    return true
  })

  ipcMain.handle('settings:hasCompletedSetup', () => {
    return settingsStore.hasCompletedSetup()
  })

  ipcMain.handle('settings:setAccountName', (_, name: string) => {
    settingsStore.setAccountName(name)
    return true
  })

  ipcMain.handle('settings:getAccountName', () => {
    return settingsStore.getAccountName()
  })

  ipcMain.handle('settings:validateApiKey', async (_, apiKey: string) => {
    try {
      const response = await fetch(`https://api.guildwars2.com/v2/account?access_token=${apiKey}`)
      
      if (!response.ok) {
        return { success: false, error: 'Invalid API key' }
      }

      const accountData = await response.json()
      return { success: true, accountData }
    } catch (error) {
      return { success: false, error: 'Failed to validate API key' }
    }
  })

  ipcMain.handle('settings:getAccountData', async () => {
    try {
      const apiKey = settingsStore.getApiKey()
      if (!apiKey) {
        return { success: false, error: 'No API key found' }
      }

      const response = await fetch(`https://api.guildwars2.com/v2/account?access_token=${apiKey}`)
      
      if (!response.ok) {
        return { success: false, error: 'Failed to fetch account data' }
      }

      const accountData = await response.json()
      return { success: true, accountData }
    } catch (error) {
      return { success: false, error: 'Failed to fetch account data' }
    }
  })

  ipcMain.handle('settings:getDailyCrafting', async () => {
    try {
      const apiKey = settingsStore.getApiKey()
      if (!apiKey) {
        return { success: false, error: 'No API key found' }
      }

      const response = await fetch(`https://api.guildwars2.com/v2/account/dailycrafting?access_token=${apiKey}`)
      
      if (!response.ok) {
        return { success: false, error: 'Failed to fetch daily crafting data' }
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Failed to fetch daily crafting data' }
    }
  })

  ipcMain.handle('api:getWorldBossCompletions', async () => {
    try {
      const apiKey = settingsStore.getApiKey()
      if (!apiKey) {
        return { success: false, error: 'No API key found' }
      }

      // Get account achievements to check for completed world bosses
      const achievementsResponse = await fetch(`https://api.guildwars2.com/v2/account/achievements?access_token=${apiKey}`)
      
      if (!achievementsResponse.ok) {
        return { success: false, error: 'Failed to fetch achievements' }
      }

      const achievements = await achievementsResponse.json()
      return { success: true, achievements }
    } catch (error) {
      return { success: false, error: 'Failed to fetch world boss completions' }
    }
  })

  ipcMain.handle('api:getAchievementMetadata', async (_, achievementId: number) => {
    try {
      const response = await fetch(`https://api.guildwars2.com/v2/achievements/${achievementId}`)
      
      if (!response.ok) {
        return { success: false, error: `Failed to fetch achievement ${achievementId}` }
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Failed to fetch achievement metadata' }
    }
  })

  ipcMain.handle('api:getAccountWorldBosses', async () => {
    try {
      const apiKey = settingsStore.getApiKey()
      if (!apiKey) {
        return { success: false, error: 'No API key found' }
      }

      const response = await fetch(`https://api.guildwars2.com/v2/account/worldbosses?access_token=${apiKey}`)
      
      if (!response.ok) {
        return { success: false, error: 'Failed to fetch account world bosses' }
      }

      const completedBosses = await response.json()
      return { success: true, completedBosses }
    } catch (error) {
      return { success: false, error: 'Failed to fetch account world bosses' }
    }
  })

  ipcMain.handle('api:getAllWorldBosses', async () => {
    try {
      const response = await fetch('https://api.guildwars2.com/v2/worldbosses')
      
      if (!response.ok) {
        return { success: false, error: 'Failed to fetch all world bosses' }
      }

      const allBosses = await response.json()
      return { success: true, allBosses }
    } catch (error) {
      return { success: false, error: 'Failed to fetch all world bosses' }
    }
  })

  // Notification IPC Handlers
  ipcMain.handle('notifications:send', (_, options: { title: string; body?: string }) => {
    try {
      if (!notificationService) {
        return { success: false, error: 'Notification service not initialized' }
      }
      notificationService.sendNotification({ title: options.title, body: options.body })
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('notifications:sendSuccess', (_, options: { title: string; body?: string }) => {
    try {
      if (!notificationService) {
        return { success: false, error: 'Notification service not initialized' }
      }
      notificationService.sendSuccess(options.title, options.body)
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('notifications:sendError', (_, options: { title: string; body?: string }) => {
    try {
      if (!notificationService) {
        return { success: false, error: 'Notification service not initialized' }
      }
      notificationService.sendError(options.title, options.body)
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('notifications:sendInfo', (_, options: { title: string; body?: string }) => {
    try {
      if (!notificationService) {
        return { success: false, error: 'Notification service not initialized' }
      }
      notificationService.sendInfo(options.title, options.body)
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('notifications:sendWarning', (_, options: { title: string; body?: string }) => {
    try {
      if (!notificationService) {
        return { success: false, error: 'Notification service not initialized' }
      }
      notificationService.sendWarning(options.title, options.body)
      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  })

  ipcMain.handle('api:getAllWorldBossAchievements', async () => {
    try {
      console.log('Fetching world bosses from endpoint...')
      
      // Fetch world bosses from the dedicated endpoint - returns event IDs
      const response = await fetch('https://api.guildwars2.com/v2/worldbosses')
      
      if (!response.ok) {
        console.error('Failed to fetch world bosses')
        return { success: false, error: 'Failed to fetch world bosses' }
      }

      const eventIds = await response.json()
      console.log(`Found ${eventIds.length} world boss events:`, eventIds)
      
      // Now we need to find the achievements for these world bosses
      // Convert event IDs to keywords to search for achievements
      // Example: 'admiral_taidha_covington' -> search for "admiral" or "taidha"
      
      // Fetch all achievement IDs
      const idsResponse = await fetch('https://api.guildwars2.com/v2/achievements')
      const allAchievementIds = await idsResponse.json()
      console.log(`Fetching details for ${allAchievementIds.length} achievements...`)
      
      // Fetch achievements in batches
      const batchSize = 200
      const allAchievements: any[] = []
      
      for (let i = 0; i < allAchievementIds.length; i += batchSize) {
        const batch = allAchievementIds.slice(i, i + batchSize)
        const idsParam = batch.join(',')
        
        try {
          const detailsResponse = await fetch(`https://api.guildwars2.com/v2/achievements?ids=${idsParam}`)
          if (detailsResponse.ok) {
            const details = await detailsResponse.json()
            allAchievements.push(...details)
          }
        } catch (error) {
          console.error(`Error fetching batch ${i}-${i + batchSize}:`, error)
        }
      }
      
      console.log(`Fetched ${allAchievements.length} achievement details`)
      
      // Map to track the best achievement for each world boss event
      const bossAchievementMap = new Map<string, any>()
      
      // First pass: try to match with at least 2 keywords
      allAchievements.forEach((achievement: any) => {
        const name = achievement.name?.toLowerCase() || ''
        const description = achievement.description?.toLowerCase() || ''
        
        eventIds.forEach((eventId: string) => {
          if (bossAchievementMap.has(eventId)) return // Already found a match
          
          const keywords = eventId.split('_').filter((k: string) => k.length > 2) // Filter out very short keywords like "ii"
          
          // Count how many keywords appear in name or description
          const matchCount = keywords.filter(keyword => 
            name.includes(keyword) || description.includes(keyword)
          ).length
          
          // Need at least 2 keywords to match (or all keywords if < 2)
          const minKeywords = keywords.length > 2 ? 2 : keywords.length
          if (matchCount >= minKeywords) {
            const isDailyAchievement = name.includes('daily')
            bossAchievementMap.set(eventId, { achievement, isDailyAchievement, matchCount })
            console.log(`✓ Matched "${achievement.name}" to event "${eventId}" (${matchCount}/${keywords.length} keywords, daily: ${isDailyAchievement})`)
          }
        })
      })
      
      // Second pass: for unmatched bosses, try matching with at least 1 keyword (but prefer daily)
      if (bossAchievementMap.size < eventIds.length) {
        allAchievements.forEach((achievement: any) => {
          const name = achievement.name?.toLowerCase() || ''
          const description = achievement.description?.toLowerCase() || ''
          
          eventIds.forEach((eventId: string) => {
            if (bossAchievementMap.has(eventId)) return // Already found a match
            
            const keywords = eventId.split('_').filter((k: string) => k.length > 2)
            const matchCount = keywords.filter(keyword => 
              name.includes(keyword) || description.includes(keyword)
            ).length
            
            if (matchCount > 0) {
              const isDailyAchievement = name.includes('daily')
              bossAchievementMap.set(eventId, { achievement, isDailyAchievement, matchCount })
              console.log(`✓ Matched "${achievement.name}" to event "${eventId}" (${matchCount}/${keywords.length} keywords, daily: ${isDailyAchievement}, FALLBACK)`)
            }
          })
        })
      }
      
      // Convert map entries to achievements, preferring daily versions where available
      const worldBossAchievements = eventIds.map((eventId: string) => {
        const entry = bossAchievementMap.get(eventId)
        return entry?.achievement || null
      }).filter((a: any) => a !== null)
      
      // Log unmatched bosses
      const matchedEventIds = Array.from(bossAchievementMap.keys())
      const unmatchedEventIds = eventIds.filter((id: string) => !matchedEventIds.includes(id))
      
      if (unmatchedEventIds.length > 0) {
        console.warn(`⚠️ Unmatched world boss events: ${unmatchedEventIds.join(', ')}`)
      }
      
      console.log(`Filtered to ${worldBossAchievements.length} world boss achievements`)
      console.log('World boss achievements:', worldBossAchievements.map((a: any) => ({ id: a.id, name: a.name })))
      return { success: true, bosses: worldBossAchievements }
    } catch (error) {
      console.error('Error fetching world boss achievements:', error)
      return { success: false, error: 'Failed to fetch world boss achievements' }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
