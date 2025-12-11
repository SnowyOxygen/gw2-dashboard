/**
 * Custom hook for managing account data
 */
import { useCallback } from 'react'
import type { PlayerData } from '@renderer/models/PlayerData'
import { gw2ApiService } from '@renderer/services/gw2api'
import { useAsyncData } from './common/useAsyncData'
import { DEFAULT_PLAYER_DATA } from '@renderer/constants/playerData'

export const useAccountData = () => {
  const fetchAccountData = useCallback(async (): Promise<PlayerData> => {
    // Fetch account data from GW2 API
    const result = await gw2ApiService.getAccountData()
    
    if (result.success && result.accountData) {
      return result.accountData
    }
    
    throw new Error(result.error || 'Failed to load account data')
  }, [])

  const { data, loading, error, refetch } = useAsyncData(fetchAccountData)

  return {
    playerStats: data || DEFAULT_PLAYER_DATA,
    loading,
    error,
    refetch
  }
}
