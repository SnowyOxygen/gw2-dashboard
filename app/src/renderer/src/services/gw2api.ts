/**
 * GW2 API Service
 * Handles all communication with the GW2 API through the main process IPC
 */

export interface AccountDataResult {
  success: boolean
  accountData?: any
  error?: string
}

export const gw2ApiService = {
  /**
   * Fetch account data from GW2 API
   */
  getAccountData: async (): Promise<AccountDataResult> => {
    try {
      return await window.api.settings.getAccountData()
    } catch (error) {
      console.error('Failed to fetch account data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  /**
   * Get stored account name from local settings
   */
  getAccountName: async (): Promise<string | null> => {
    try {
      return await window.api.settings.getAccountName()
    } catch (error) {
      console.error('Failed to fetch account name:', error)
      return null
    }
  }
}
