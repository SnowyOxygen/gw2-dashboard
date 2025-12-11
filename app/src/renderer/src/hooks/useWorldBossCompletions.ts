/**
 * Custom hook for managing world boss completions
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { gw2BossService } from '@renderer/services/gw2boss'
import { useNotifications } from './useNotifications'
import { useAsyncData } from './common/useAsyncData'
import type { WorldBossCompletion } from '@renderer/models/WorldBoss'

export const useWorldBossCompletions = () => {
  const [loadTime, setLoadTime] = useState<number>(Date.now())
  const [ticks, setTicks] = useState<number>(0)

  const { sendInfo } = useNotifications()
  const notifiedBossesRef = useRef<Set<string>>(new Set())

  const fetchBosses = useCallback(async (): Promise<WorldBossCompletion[]> => {
    console.log('Loading world boss completions...')
    const result = await gw2BossService.getWorldBossCompletions()
    
    console.log('Result from service:', result)
    
    if (result.success && result.bosses) {
      console.log(`Successfully loaded ${result.bosses.length} bosses:`, result.bosses)
      // Clear notification cache on fresh data load to allow re-notification on next cycle
      notifiedBossesRef.current.clear()
      return result.bosses
    }
    
    const errorMsg = result.error || 'Failed to load world boss data'
    console.error('Error loading bosses:', errorMsg)
    throw new Error(errorMsg)
  }, [])

  const { data: bosses, loading, error, refetch } = useAsyncData(fetchBosses, {
    refreshInterval: 5 * 60 * 1000 // Reload boss data every 5 minutes
  })

  // Update load time when bosses are refreshed
  useEffect(() => {
    if (bosses) {
      setLoadTime(Date.now())
    }
  }, [bosses])

  // Local countdown timer that updates every second without reloading data
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setTicks(prev => prev + 1)
      
      // Check for bosses spawning in one minute
      const now = new Date()
      bosses?.forEach(boss => {
        if (!boss.nextSpawn || boss.completed) return
        
        const timeUntilSpawn = boss.nextSpawn.getTime() - now.getTime()
        const minutesUntilSpawn = timeUntilSpawn / (60 * 1000)
        
        // Send notification when boss will spawn in ~1 minute (between 59-61 seconds remaining)
        const shouldNotify = timeUntilSpawn > 0 && minutesUntilSpawn <= 1 && minutesUntilSpawn > 0.98
        const notificationKey = `${boss.id}-${Math.floor(boss.nextSpawn.getTime() / 60000)}`
        
        if (shouldNotify && !notifiedBossesRef.current.has(notificationKey)) {
          notifiedBossesRef.current.add(notificationKey)
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          sendInfo(`${boss.name} spawning soon!`, `${boss.name} will spawn in approximately 1 minute in ${boss.zone}`)
        }
      })
    }, 1000)
    
    return () => clearInterval(countdownInterval)
  }, [bosses, sendInfo])

  return {
    bosses: bosses || [],
    loading,
    error,
    refetch,
    loadTime,
    ticks
  }
}
