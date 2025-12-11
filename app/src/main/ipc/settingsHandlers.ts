/**
 * Settings IPC Handlers
 * Handlers for application settings and configuration
 */

import { ipcMain } from 'electron'
import { createSimpleHandler } from './handlerFactory'

interface SettingsStore {
  hasApiKey: () => boolean
  getApiKey: () => string | null
  setApiKey: (apiKey: string) => void
  clearApiKey: () => void
  hasCompletedSetup: () => boolean
  setAccountName: (name: string) => void
  getAccountName: () => string | null
}

export function registerSettingsHandlers(settingsStore: SettingsStore): void {
  // Check if API key exists
  ipcMain.handle(
    'settings:hasApiKey',
    createSimpleHandler(() => settingsStore.hasApiKey())
  )

  // Get API key
  ipcMain.handle(
    'settings:getApiKey',
    createSimpleHandler(() => settingsStore.getApiKey())
  )

  // Set API key
  ipcMain.handle(
    'settings:setApiKey',
    createSimpleHandler((apiKey: string) => {
      settingsStore.setApiKey(apiKey)
      return true
    })
  )

  // Clear API key
  ipcMain.handle(
    'settings:clearApiKey',
    createSimpleHandler(() => {
      settingsStore.clearApiKey()
      return true
    })
  )

  // Check if setup is completed
  ipcMain.handle(
    'settings:hasCompletedSetup',
    createSimpleHandler(() => settingsStore.hasCompletedSetup())
  )

  // Set account name
  ipcMain.handle(
    'settings:setAccountName',
    createSimpleHandler((name: string) => {
      settingsStore.setAccountName(name)
      return true
    })
  )

  // Get account name
  ipcMain.handle(
    'settings:getAccountName',
    createSimpleHandler(() => settingsStore.getAccountName())
  )
}
