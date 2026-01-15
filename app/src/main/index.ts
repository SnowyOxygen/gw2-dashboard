import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { settingsStore } from './store'
import { NotificationService, setMainWindow } from './notifications'
import { 
  registerGW2ApiHandlers, 
  registerSettingsHandlers, 
  registerNotificationHandlers 
} from './ipc'

// Global notification service (will be initialized after window creation)
let notificationService: NotificationService | null = null
let mainWindow: BrowserWindow | null = null
const floatingCardWindows = new Map<string, BrowserWindow>()

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
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    // Close all floating card windows when main window closes
    floatingCardWindows.forEach((window) => {
      try {
        if (window && !window.isDestroyed()) {
          window.close()
        }
      } catch (e) {
        // Window may already be closed, ignore errors
      }
    })
    floatingCardWindows.clear()
    mainWindow = null
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

function createFloatingCardWindow(cardId: string, cardTitle: string, x: number, y: number): void {
  const cardWindow = new BrowserWindow({
    width: 400,
    height: 500,
    x: x + 450,
    y: y,
    show: true,
    alwaysOnTop: true,
    frame: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true,
    }
  })

  cardWindow.setTitle(cardTitle)

  // Load the card content
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    cardWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/card/${cardId}`)
  } else {
    cardWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: `/card/${cardId}` })
  }

  // Store window reference
  floatingCardWindows.set(cardId, cardWindow)

  // Clean up on close
  cardWindow.on('closed', () => {
    floatingCardWindows.delete(cardId)
    // Notify main window that card was closed (only if main window still exists)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('card:closed', cardId)
    }
  })
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

  // IPC handler for setting always-on-top mode
  ipcMain.on('window:setAlwaysOnTop', (_event, alwaysOnTop: boolean) => {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(alwaysOnTop)
    }
  })

  // IPC handler for creating floating card windows
  ipcMain.on('card:float', (_event, cardId: string, cardTitle: string) => {
    if (mainWindow) {
      const bounds = mainWindow.getBounds()
      createFloatingCardWindow(cardId, cardTitle, bounds.x, bounds.y)
    }
  })

  // IPC handler for closing floating card windows
  ipcMain.on('card:dock', (_event, cardId: string) => {
    const cardWindow = floatingCardWindows.get(cardId)
    if (cardWindow) {
      cardWindow.close()
      floatingCardWindows.delete(cardId)
    }
  })

  // IPC handler for moving floating card windows
  ipcMain.on('card:move', (_event, cardId: string, deltaX: number, deltaY: number) => {
    const cardWindow = floatingCardWindows.get(cardId)
    if (cardWindow) {
      const [x, y] = cardWindow.getPosition()
      cardWindow.setPosition(x + deltaX, y + deltaY)
    }
  })

  // Register all IPC handlers using modular approach
  registerSettingsHandlers(settingsStore)
  registerGW2ApiHandlers(() => settingsStore.getApiKey())
  registerNotificationHandlers(() => notificationService)

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
