/**
 * Custom hook for managing account data
 */
import { useState, useEffect } from 'react'
import { PlayerData } from '@renderer/models/PlayerData'
import { gw2ApiService } from '@renderer/services/gw2api'

const DEFAULT_PLAYER_DATA: PlayerData = {
  id: '',
  name: 'Loading...',
  age: 0,
  world: '',
  guilds: [],
  guild_leader: '',
  created: new Date(),
  access: [],
  commander: false,
  fractal_level: 0,
  daily_ap: 0,
  monthly_ap: 0,
  wvw_rank: 0
}

export const useAccountData = () => {
  const [playerStats, setPlayerStats] = useState<PlayerData>(DEFAULT_PLAYER_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAccountData()
  }, [])

  const loadAccountData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get account name from local settings
      const accountName = await gw2ApiService.getAccountName()
      if (accountName) {
        setPlayerStats(prev => ({ ...prev, accountName }))
      }

      // Fetch account data from GW2 API
      const result = await gw2ApiService.getAccountData()
      if (result.success && result.accountData) {
        setPlayerStats(result.accountData)
      } else {
        setError(result.error || 'Failed to load account data')
        console.error('Failed to load account data:', result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Failed to load account data:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    playerStats,
    loading,
    error,
    refetch: loadAccountData
  }
}
