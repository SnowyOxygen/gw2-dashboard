import { describe, it, expect, vi } from 'vitest'
import { settingsStore } from '../src/main/store'

// Mock electron modules
vi.mock('electron', () => ({
  safeStorage: {
    isEncryptionAvailable: () => true,
    encryptString: (str: string) => Buffer.from(str, 'utf-8'),
    decryptString: (buffer: Buffer) => buffer.toString('utf-8')
  }
}))

vi.mock('electron-store', () => {
  const mockStore = new Map()
  return {
    default: class MockStore {
      constructor(config: { defaults: Record<string, unknown> }) {
        Object.entries(config.defaults).forEach(([key, value]) => {
          if (!mockStore.has(key)) {
            mockStore.set(key, value)
          }
        })
      }
      get(key: string, defaultValue?: unknown) {
        return mockStore.has(key) ? mockStore.get(key) : defaultValue
      }
      set(key: string, value: unknown) {
        mockStore.set(key, value)
      }
      delete(key: string) {
        mockStore.delete(key)
      }
      clear() {
        mockStore.clear()
      }
    }
  }
})

describe('SettingsStore', () => {
  describe('API Key Management', () => {
    it('should set and get API key', () => {
      const testApiKey = 'test-api-key-123'
      settingsStore.setApiKey(testApiKey)

      const retrieved = settingsStore.getApiKey()
      expect(retrieved).toBe(testApiKey)
    })

    it('should return true when API key exists', () => {
      settingsStore.setApiKey('test-key')
      expect(settingsStore.hasApiKey()).toBe(true)
    })

    it('should clear API key', () => {
      settingsStore.setApiKey('test-key')
      settingsStore.clearApiKey()

      expect(settingsStore.hasApiKey()).toBe(false)
      expect(settingsStore.getApiKey()).toBe(null)
    })
  })

  describe('Setup Status', () => {
    it('should track setup completion', () => {
      settingsStore.setCompletedSetup(true)
      expect(settingsStore.hasCompletedSetup()).toBe(true)

      settingsStore.setCompletedSetup(false)
      expect(settingsStore.hasCompletedSetup()).toBe(false)
    })

    it('should mark setup complete when API key is set', () => {
      settingsStore.setApiKey('test-key')
      expect(settingsStore.hasCompletedSetup()).toBe(true)
    })
  })

  describe('Account Info', () => {
    it('should set and get account name', () => {
      const accountName = 'TestAccount.1234'
      settingsStore.setAccountName(accountName)

      expect(settingsStore.getAccountName()).toBe(accountName)
    })
  })
})
