/**
 * Notification IPC Handlers
 * Handlers for system notifications
 */

import { ipcMain } from 'electron'
import { createServiceHandler } from './handlerFactory'

interface NotificationService {
  sendNotification: (options: { title: string; body?: string }) => void
  sendSuccess: (title: string, body?: string) => void
  sendError: (title: string, body?: string) => void
  sendInfo: (title: string, body?: string) => void
  sendWarning: (title: string, body?: string) => void
}

export function registerNotificationHandlers(
  getNotificationService: () => NotificationService | null
): void {
  // Send generic notification
  ipcMain.handle(
    'notifications:send',
    createServiceHandler(
      getNotificationService,
      'Notification service',
      (service, options: { title: string; body?: string }) => {
        service.sendNotification({ title: options.title, body: options.body })
      }
    )
  )

  // Send success notification
  ipcMain.handle(
    'notifications:sendSuccess',
    createServiceHandler(
      getNotificationService,
      'Notification service',
      (service, options: { title: string; body?: string }) => {
        service.sendSuccess(options.title, options.body)
      }
    )
  )

  // Send error notification
  ipcMain.handle(
    'notifications:sendError',
    createServiceHandler(
      getNotificationService,
      'Notification service',
      (service, options: { title: string; body?: string }) => {
        service.sendError(options.title, options.body)
      }
    )
  )

  // Send info notification
  ipcMain.handle(
    'notifications:sendInfo',
    createServiceHandler(
      getNotificationService,
      'Notification service',
      (service, options: { title: string; body?: string }) => {
        service.sendInfo(options.title, options.body)
      }
    )
  )

  // Send warning notification
  ipcMain.handle(
    'notifications:sendWarning',
    createServiceHandler(
      getNotificationService,
      'Notification service',
      (service, options: { title: string; body?: string }) => {
        service.sendWarning(options.title, options.body)
      }
    )
  )
}
