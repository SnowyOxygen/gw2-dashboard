import { describe, it, expect } from 'vitest'
import { gw2ApiService } from '../../src/renderer/src/services/gw2api'

const setWindowSettingsApi = (impl: {
  getAccountData: () => Promise<any>
  getAccountName: () => Promise<string | null>
}) => {
  const existing = (window as any).api || {}
  ;(window as any).api = { ...existing, settings: impl }
}

describe('gw2ApiService', () => {
  describe('getAccountData', () => {
    it('returns success with account data from IPC', async () => {
      setWindowSettingsApi({
        getAccountData: async () => ({ success: true, accountData: { name: 'Tester.1234' } }),
        getAccountName: async () => 'Tester.1234',
      })

      const result = await gw2ApiService.getAccountData()
      expect(result.success).toBe(true)
      expect(result.accountData).toEqual({ name: 'Tester.1234' })
    })

    it('returns failure with forwarded error message', async () => {
      setWindowSettingsApi({
        // Simulate IPC throwing to exercise catch path
        getAccountData: async () => { throw new Error('ipc failure') },
        getAccountName: async () => 'Tester.1234',
      })

      const result = await gw2ApiService.getAccountData()
      expect(result.success).toBe(false)
      expect(result.error).toBe('ipc failure')
    })
  })

  describe('getAccountName', () => {
    it('returns stored account name from settings', async () => {
      setWindowSettingsApi({
        getAccountData: async () => ({ success: true, accountData: {} }),
        getAccountName: async () => 'Tester.1234',
      })

      const name = await gw2ApiService.getAccountName()
      expect(name).toBe('Tester.1234')
    })

    it('returns null when IPC throws', async () => {
      setWindowSettingsApi({
        getAccountData: async () => ({ success: true, accountData: {} }),
        getAccountName: async () => { throw new Error('ipc failure') },
      })

      const name = await gw2ApiService.getAccountName()
      expect(name).toBeNull()
    })
  })
})
