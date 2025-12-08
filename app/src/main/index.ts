import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { settingsStore } from './store'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
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
    mainWindow.show()
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
