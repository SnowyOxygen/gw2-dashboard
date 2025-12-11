/**
 * Custom hook for managing world boss completions
 */
import { useState, useEffect } from 'react'
import { gw2BossService, WorldBossCompletion } from '@renderer/services/gw2boss'

export const useWorldBossCompletions = () => {
  const [bosses, setBosses] = useState<WorldBossCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBosses()
    
    // Refresh every 5 minutes to catch any new completions
    const interval = setInterval(loadBosses, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadBosses = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Loading world boss completions...')
      const result = await gw2BossService.getWorldBossCompletions()
      
      console.log('Result from service:', result)
      
      if (result.success && result.bosses) {
        console.log(`Successfully loaded ${result.bosses.length} bosses:`, result.bosses)
        setBosses(result.bosses)
      } else {
        const errorMsg = result.error || 'Failed to load world boss data'
        console.error('Error loading bosses:', errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Exception loading bosses:', errorMessage, err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    bosses,
    loading,
    error,
    refetch: loadBosses
  }
}
