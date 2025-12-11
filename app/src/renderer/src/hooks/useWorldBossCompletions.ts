/**
 * Custom hook for managing world boss completions
 */
import { useState, useEffect, useRef } from 'react'
import { gw2BossService } from '@renderer/services/gw2boss'
import { useNotifications } from './useNotifications'
import type { WorldBossCompletion } from '@renderer/models/WorldBoss'

export const useWorldBossCompletions = () => {
  const [bosses, setBosses] = useState<WorldBossCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [loadTime, setLoadTime] = useState<number>(Date.now())
  const [ticks, setTicks] = useState<number>(0)

  const { sendInfo } = useNotifications()
  const notifiedBossesRef = useRef<Set<string>>(new Set())

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
      
      // Check for bosses spawning in one minute
      const now = new Date()
      bosses.forEach(boss => {
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
        // Clear notification cache on fresh data load to allow re-notification on next cycle
        notifiedBossesRef.current.clear()
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
    loadTime, // Time when bosses were last loaded
    ticks // Updated every second to trigger re-renders
  }
}
