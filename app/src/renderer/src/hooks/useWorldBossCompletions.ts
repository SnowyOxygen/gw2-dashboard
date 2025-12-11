/**
 * Custom hook for managing world boss completions
 */
import { useState, useEffect } from 'react'
import { gw2BossService } from '@renderer/services/gw2boss'
import type { WorldBossCompletion } from '@renderer/models/WorldBoss'

export const useWorldBossCompletions = () => {
  const [bosses, setBosses] = useState<WorldBossCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [loadTime, setLoadTime] = useState<number>(Date.now())
  const [ticks, setTicks] = useState<number>(0)

  useEffect(() => {
    loadBosses()
    
    // Reload boss data every 5 minutes to check for completion status changes
    const dataInterval = setInterval(() => {
      loadBosses()
      setLoadTime(Date.now())
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(dataInterval)
  }, [])

  // Local countdown timer that updates every second without reloading data
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setTicks(prev => prev + 1)
    }, 1000)
    
    return () => clearInterval(countdownInterval)
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
    refetch: loadBosses,
    loadTime // Time when bosses were last loaded
  }
}
