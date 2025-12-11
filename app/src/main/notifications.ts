/**
 * Notification Service
 * Handles all Windows notifications for the application
 */

import { Notification } from 'electron'
import { existsSync } from 'fs'
import { join } from 'path'

// Sound player using Windows Media Player for MP3 support
function playSound(soundPath: string): void {
  try {
    if (existsSync(soundPath)) {
      const { exec } = require('child_process')
      // Use PowerShell with WindowsMediaPlayer COM object to play MP3
      const command = `powershell -c "$player = New-Object -ComObject WMPlayer.OCX; $player.URL = '${soundPath}'; $player.controls.play(); Start-Sleep -Milliseconds 500"`
      exec(command, (error) => {
        if (error) {
          console.error('Failed to play notification sound:', error)
        }
      })
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
    // Use the custom ding sound from assets
    // In production, the path will be different, so we need to resolve it properly
    const isDev = process.env.NODE_ENV === 'development'
    
    if (isDev) {
      // Development: use source path
      this.soundPath = join(__dirname, '..', '..', 'src', 'renderer', 'src', 'assets', 'ding-sound-effect_2.mp3')
    } else {
      // Production: use built path
      this.soundPath = join(process.resourcesPath, 'app.asar.unpacked', 'src', 'renderer', 'src', 'assets', 'ding-sound-effect_2.mp3')
      
      // Fallback: try alternative production path
      if (!existsSync(this.soundPath)) {
        this.soundPath = join(__dirname, '..', 'renderer', 'assets', 'ding-sound-effect_2.mp3')
      }
    }
    
    if (!existsSync(this.soundPath)) {
      console.warn('Notification sound file not found:', this.soundPath)
      this.soundPath = null
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
        playSound(this.soundPath)
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
