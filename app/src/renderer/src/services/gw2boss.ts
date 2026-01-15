/**
 * GW2 API Service
 * Handles all communication with the GW2 API through the main process IPC
 */

import type { WorldBossCompletion, WorldBossResult } from '@renderer/models/WorldBoss'
import { BOSS_INFO, type BossSpawnTime } from '@renderer/constants/worldBosses'

// Re-export types for convenience
export type { WorldBossCompletion, WorldBossResult }

/**
 * Calculate the next spawn time for a boss based on its spawn times
 */
function calculateNextSpawn(spawnTimes: BossSpawnTime[]): Date {
  const now = new Date()
  
  // If no spawn times available, return a date far in the future
  if (!spawnTimes || spawnTimes.length === 0) {
    const future = new Date(now)
    future.setUTCDate(future.getUTCDate() + 365)
    return future
  }
  
  // Find all spawn times in the current day
  const spawns: Date[] = spawnTimes.map(spawn => {
    const spawnDate = new Date(now)
    spawnDate.setUTCHours(spawn.hour, spawn.minute, 0, 0)
    return spawnDate
  })
  
  // Find the next spawn
  for (const spawn of spawns) {
    if (spawn > now) {
      return spawn
    }
  }
  
  // If no spawn found today, use first spawn of tomorrow
  const tomorrow = new Date(now)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(spawnTimes[0].hour, spawnTimes[0].minute, 0, 0)
  return tomorrow
}


export const gw2BossService = {
  /**
   * Fetch completed world bosses for today
   */
  getWorldBossCompletions: async (): Promise<WorldBossResult> => {
    try {
      // Fetch all available world bosses
      const allBossesResult = await window.api.gw2.getAllWorldBosses()
      if (!allBossesResult.success || !allBossesResult.allBosses) {
        return {
          success: false,
          error: allBossesResult.error || 'Failed to fetch world bosses list'
        }
      }

      // Fetch completed world bosses for the account
      const completedResult = await window.api.gw2.getAccountWorldBosses()
      if (!completedResult.success) {
        return {
          success: false,
          error: completedResult.error || 'Failed to fetch completed world bosses'
        }
      }
      
      const completedBosses = new Set(completedResult.completedBosses || [])
      
      // Build boss list with completion status and timer info
      const bosses: WorldBossCompletion[] = allBossesResult.allBosses.map(bossId => {
        const bossInfo = BOSS_INFO[bossId] || {
          name: bossId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          zone: 'Open World',
          spawnTimes: [{ hour: 0, minute: 0 }]
        }
        
        const nextSpawn = calculateNextSpawn(bossInfo.spawnTimes)
        
        return {
          id: bossId,
          name: bossInfo.name,
          zone: bossInfo.zone,
          completed: completedBosses.has(bossId),
          nextSpawn
        }
      })
      
      // Sort by next spawn time (soonest first)
      bosses.sort((a, b) => {
        if (!a.nextSpawn || !b.nextSpawn) return 0
        return a.nextSpawn.getTime() - b.nextSpawn.getTime()
      })

      console.log(`Loaded ${bosses.length} world bosses, ${completedBosses.size} completed`)

      return { success: true, bosses }
    } catch (error) {
      console.error('Failed to fetch world boss completions:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
