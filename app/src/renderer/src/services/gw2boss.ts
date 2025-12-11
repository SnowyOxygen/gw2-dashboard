/**
 * GW2 API Service
 * Handles all communication with the GW2 API through the main process IPC
 */

import type { WorldBossCompletion, WorldBossResult } from '@renderer/models/WorldBoss'

// Re-export types for convenience
export type { WorldBossCompletion, WorldBossResult }

// Map of boss IDs to display names, zones, and exact spawn times (UTC)
const BOSS_INFO: Record<string, { name: string; zone: string; spawnTimes: { hour: number; minute: number }[] }> = {
  'admiral_taidha_covington': { name: 'Admiral Taidha Covington', zone: 'Gendarran Fields', spawnTimes: [{ hour: 15, minute: 16 }, { hour: 3, minute: 0 }, { hour: 6, minute: 0 }, { hour: 9, minute: 0 }, { hour: 12, minute: 0 }, { hour: 15, minute: 0 }, { hour: 18, minute: 0 }, { hour: 21, minute: 0 }] },
  'claw_of_jormag': { name: 'Claw of Jormag', zone: 'Frostgorge Sound', spawnTimes: [{ hour: 2, minute: 30 }, { hour: 5, minute: 30 }, { hour: 8, minute: 30 }, { hour: 11, minute: 30 }, { hour: 14, minute: 30 }, { hour: 17, minute: 30 }, { hour: 20, minute: 30 }, { hour: 23, minute: 30 }] },
  'commodore_aria_keene': { name: 'Commodore Aria Keene', zone: 'Gendarran Fields', spawnTimes: [] },
  'drakkar': { name: 'Drakkar', zone: 'Bjora Marches', spawnTimes: [] },
  'fire_elemental': { name: 'Fire Elemental', zone: 'Metrica Province', spawnTimes: [{ hour: 0, minute: 45 }, { hour: 2, minute: 45 }, { hour: 4, minute: 45 }, { hour: 6, minute: 45 }, { hour: 8, minute: 45 }, { hour: 10, minute: 45 }, { hour: 12, minute: 45 }, { hour: 14, minute: 45 }, { hour: 16, minute: 45 }, { hour: 18, minute: 45 }, { hour: 20, minute: 45 }, { hour: 22, minute: 45 }] },
  'great_jungle_wurm': { name: 'Great Jungle Wurm', zone: 'Caledon Forest', spawnTimes: [{ hour: 1, minute: 15 }, { hour: 3, minute: 15 }, { hour: 5, minute: 15 }, { hour: 7, minute: 15 }, { hour: 9, minute: 15 }, { hour: 11, minute: 15 }, { hour: 13, minute: 15 }, { hour: 15, minute: 15 }, { hour: 17, minute: 15 }, { hour: 19, minute: 15 }, { hour: 21, minute: 15 }, { hour: 23, minute: 15 }] },
  'inquest_golem_mark_ii': { name: 'Inquest Golem Mark II', zone: 'Mount Maelstrom', spawnTimes: [{ hour: 2, minute: 0 }, { hour: 5, minute: 0 }, { hour: 8, minute: 0 }, { hour: 11, minute: 0 }, { hour: 14, minute: 0 }, { hour: 17, minute: 0 }, { hour: 20, minute: 0 }, { hour: 23, minute: 0 }] },
  'megadestroyer': { name: 'Megadestroyer', zone: 'Mount Maelstrom', spawnTimes: [{ hour: 0, minute: 30 }, { hour: 3, minute: 30 }, { hour: 6, minute: 30 }, { hour: 9, minute: 30 }, { hour: 12, minute: 30 }, { hour: 15, minute: 30 }, { hour: 18, minute: 30 }, { hour: 21, minute: 30 }] },
  'modniir_ulgoth': { name: 'Modniir Ulgoth', zone: 'Harathi Hinterlands', spawnTimes: [{ hour: 1, minute: 30 }, { hour: 4, minute: 30 }, { hour: 7, minute: 30 }, { hour: 10, minute: 30 }, { hour: 13, minute: 30 }, { hour: 16, minute: 30 }, { hour: 19, minute: 30 }, { hour: 22, minute: 30 }] },
  'shadow_behemoth': { name: 'Shadow Behemoth', zone: 'Queensdale', spawnTimes: [{ hour: 1, minute: 45 }, { hour: 3, minute: 45 }, { hour: 5, minute: 45 }, { hour: 7, minute: 45 }, { hour: 9, minute: 45 }, { hour: 11, minute: 45 }, { hour: 13, minute: 45 }, { hour: 15, minute: 45 }, { hour: 17, minute: 45 }, { hour: 19, minute: 45 }, { hour: 21, minute: 45 }, { hour: 23, minute: 45 }] },
  'svanir_shaman_chief': { name: 'Svanir Shaman Chief', zone: 'Wayfarer Foothills', spawnTimes: [{ hour: 0, minute: 15 }, { hour: 2, minute: 15 }, { hour: 4, minute: 15 }, { hour: 6, minute: 15 }, { hour: 8, minute: 15 }, { hour: 10, minute: 15 }, { hour: 12, minute: 15 }, { hour: 14, minute: 15 }, { hour: 16, minute: 15 }, { hour: 18, minute: 15 }, { hour: 20, minute: 15 }, { hour: 22, minute: 15 }] },
  'tequatl_the_sunless': { name: 'Tequatl the Sunless', zone: 'Sparkfly Fen', spawnTimes: [] },
  'the_shatterer': { name: 'The Shatterer', zone: 'Blazeridge Steppes', spawnTimes: [{ hour: 1, minute: 0 }, { hour: 4, minute: 0 }, { hour: 7, minute: 0 }, { hour: 10, minute: 0 }, { hour: 13, minute: 0 }, { hour: 16, minute: 0 }, { hour: 19, minute: 0 }, { hour: 22, minute: 0 }] },
  'triple_trouble': { name: 'Triple Trouble', zone: 'Bloodtide Coast', spawnTimes: [] }
}

/**
 * Calculate the next spawn time for a boss based on its spawn times
 */
function calculateNextSpawn(spawnTimes: { hour: number; minute: number }[]): Date {
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
