/**
 * Notification Service
 * Handles all Windows notifications for the application
 */

import { Notification, BrowserWindow, app } from 'electron'
import { existsSync } from 'fs'
import { readFileSync } from 'fs'
import { join } from 'path'

// Reference to main window (will be set by caller)
let mainWindow: BrowserWindow | null = null

export function setMainWindow(window: BrowserWindow | null): void {
  mainWindow = window
}

// Sound player function that uses IPC to play sound in renderer
function playSoundFile(soundPath: string): void {
  try {
    let finalPath = soundPath
    
    if (!existsSync(finalPath)) {
      console.warn('Sound file not found at:', finalPath)
      // Try alternative paths
      const alternativePaths = [
        join(app.getAppPath(), 'src', 'renderer', 'src', 'assets', 'ding-sound-effect_2.mp3'),
        join(process.cwd(), 'src', 'renderer', 'src', 'assets', 'ding-sound-effect_2.mp3'),
      ]
      
      for (const altPath of alternativePaths) {
        if (existsSync(altPath)) {
          finalPath = altPath
          break
        }
      }
      
      if (!existsSync(finalPath)) {
        console.warn('Sound file not found in any location')
        return
      }
    }

    // Read the sound file and convert to base64
    const soundBuffer = readFileSync(finalPath)
    const base64Sound = soundBuffer.toString('base64')
    
    // Send IPC message to renderer to play sound
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('play-notification-sound', base64Sound)
    }
  } catch (error) {
    console.error('Error playing sound:', error)
  }
}

export interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  silent?: boolean
  tag?: string
}

export class NotificationService {
  private soundPath: string | null = null

  constructor() {
    // Find the sound file path
    const possiblePaths = [
      join(app.getAppPath(), 'src', 'renderer', 'src', 'assets', 'ding-sound-effect_2.mp3'),
      join(process.cwd(), 'src', 'renderer', 'src', 'assets', 'ding-sound-effect_2.mp3'),
      join(__dirname, '..', '..', 'src', 'renderer', 'src', 'assets', 'ding-sound-effect_2.mp3'),
    ]
    
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        this.soundPath = path
        console.log('Found notification sound at:', this.soundPath)
        break
      }
    }
    
    if (!this.soundPath) {
      console.warn('Notification sound file not found in any location')
    }
  }

  /**
   * Send a notification
   * @param options Notification options
   */
  sendNotification(options: NotificationOptions): void {
    // Check if notifications are supported on this platform
    if (!Notification.isSupported()) {
      console.warn('Notifications not supported on this platform')
      return
    }

    try {
      // Play sound before showing notification (unless silent is true)
      if (!options.silent && this.soundPath) {
        playSoundFile(this.soundPath)
      }

      const notification = new Notification({
        title: options.title,
        body: options.body,
        icon: options.icon,
        silent: true // Always silent since we're playing our own sound
      })

      // Show the notification
      notification.show()

      console.log('Notification sent:', options.title)
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  /**
   * Send a success notification
   * @param title Notification title
   * @param body Notification body
   */
  sendSuccess(title: string, body?: string): void {
    this.sendNotification({ title, body, tag: 'success' })
  }

  /**
   * Send an error notification
   * @param title Notification title
   * @param body Notification body
   */
  sendError(title: string, body?: string): void {
    this.sendNotification({ title, body, tag: 'error' })
  }

  /**
   * Send an info notification
   * @param title Notification title
   * @param body Notification body
   */
  sendInfo(title: string, body?: string): void {
    this.sendNotification({ title, body, tag: 'info' })
  }

  /**
   * Send a warning notification
   * @param title Notification title
   * @param body Notification body
   */
  sendWarning(title: string, body?: string): void {
    this.sendNotification({ title, body, tag: 'warning' })
  }
}
