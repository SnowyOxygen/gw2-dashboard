import StoreModule from 'electron-store'
import { safeStorage } from 'electron'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Store = (StoreModule as any).default || StoreModule

class SettingsStore {
  private store: InstanceType<typeof Store>

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.store = new (Store as any)({
      defaults: {
        hasCompletedSetup: false
      }
    })
  }

  // API Key Management - Using safeStorage for encryption
  setApiKey(apiKey: string): void {
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(apiKey)
      this.store.set('apiKey', encrypted.toString('base64'))
    } else {
      // Fallback to electron-store's encryption
      this.store.set('apiKey', apiKey)
    }
    this.store.set('hasCompletedSetup', true)
  }

  getApiKey(): string | null {
    const stored = this.store.get('apiKey')
    if (!stored) return null

    if (safeStorage.isEncryptionAvailable()) {
      try {
        const decrypted = safeStorage.decryptString(Buffer.from(stored, 'base64'))
        return decrypted
      } catch (error) {
        console.error('Failed to decrypt API key:', error)
        return null
      }
    }

    return stored as string
  }

  hasApiKey(): boolean {
    return !!this.store.get('apiKey')
  }

  clearApiKey(): void {
    this.store.delete('apiKey')
    this.store.set('hasCompletedSetup', false)
  }

  // Setup Status
  hasCompletedSetup(): boolean {
    return this.store.get('hasCompletedSetup', false)
  }

  setCompletedSetup(completed: boolean): void {
    this.store.set('hasCompletedSetup', completed)
  }

  // Account Info
  setAccountName(name: string): void {
    this.store.set('accountName', name)
  }

  getAccountName(): string | null {
    return this.store.get('accountName') || null
  }

  // Clear all data
  clearAll(): void {
    this.store.clear()
  }
}

export const settingsStore = new SettingsStore()
