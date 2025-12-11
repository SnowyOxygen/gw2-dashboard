/**
 * GW2 API Service
 * Handles all communication with the GW2 API through the main process IPC
 */

export interface WorldBossCompletion {
  id: string
  name: string
  zone: string
  completed: boolean
}

export interface WorldBossResult {
  success: boolean
  bosses?: WorldBossCompletion[]
  error?: string
}

// Cache for world boss achievements
let worldBossAchievementsCache: any[] | null = null

/**
 * Extract zone from achievement description or use fallback
 */
const extractZoneFromDescription = (description: string): string => {
  // Try to extract zone from description like "Defeat Taidha Covington in Gendarran Fields"
  const match = description.match(/in (.+?)(?:\.|$)/)
  return match ? match[1] : 'Open World'
}

/**
 * Get or fetch world bosses
 */
const getWorldBosses = async (): Promise<any[] | null> => {
  if (worldBossAchievementsCache) {
    console.log(`Using cached world bosses: ${worldBossAchievementsCache.length} found`)
    return worldBossAchievementsCache
  }

  try {
    console.log('Fetching world bosses from API...')
    const result = await window.api.gw2.getAllWorldBossAchievements()
    
    console.log('API Response:', result)
    console.log('Bosses data type:', typeof result.bosses)
    console.log('Bosses is array:', Array.isArray(result.bosses))
    if (result.bosses && result.bosses.length > 0) {
      console.log('First boss:', result.bosses[0])
      console.log('First boss type:', typeof result.bosses[0])
    }
    
    if (result.success && result.bosses) {
      worldBossAchievementsCache = result.bosses
      console.log(`Successfully fetched and cached ${result.bosses.length} world bosses`)
      return result.bosses
    } else {
      console.error('API returned error:', result.error)
    }
  } catch (error) {
    console.error('Failed to fetch world bosses:', error)
  }
  
  return null
}

export const gw2BossService = {
  /**
   * Fetch completed world bosses for today
   */
  getWorldBossCompletions: async (): Promise<WorldBossResult> => {
    try {
      // Fetch available world bosses from API
      const worldBosses = await getWorldBosses()
      if (!worldBosses || worldBosses.length === 0) {
        return {
          success: false,
          error: 'No world bosses found'
        }
      }

      console.log(`Found ${worldBosses.length} world bosses`)

      // Fetch account achievements
      const result = await window.api.gw2.getWorldBossCompletions()
      
      if (!result.success) {
        console.error('GW2 API error:', result.error)
        return {
          success: false,
          error: result.error || 'Failed to fetch completions'
        }
      }
      
      console.log(`Account has ${result.achievements?.length} achievements`)
      console.log('Completed achievements:', result.achievements?.filter((a: any) => a.done).map((a: any) => ({ id: a.id, done: a.done })))

      // Build boss list with completion status
      const bosses: WorldBossCompletion[] = []
      
      for (const achievementData of worldBosses) {
        const achievementId = achievementData.id
        try {
          console.log(`Processing achievement ${achievementId}: ${achievementData.name}`)
          
          // Get the zone from the achievement metadata we already have
          const description = achievementData.description || ''
          const zone = extractZoneFromDescription(description)
          
          // Check if achievement is in the completed list
          const achievement = result.achievements?.find((a: any) => a.id === achievementId)
          const isCompleted = achievement?.done ?? false
          
          if (isCompleted) {
            console.warn(`⚠️  Achievement ${achievementId} marked as completed:`, achievement)
          }
          
          bosses.push({
            id: achievementId.toString(),
            name: achievementData.name,
            zone: zone,
            completed: isCompleted
          })
          
          console.log(`Added boss: ${achievementData.name} (${achievementId}) - Completed: ${isCompleted}`)
        } catch (err) {
          console.error(`Error processing boss ${achievementId}:`, err)
        }
      }

      console.log(`Total bosses loaded: ${bosses.length}`, bosses)

      if (bosses.length === 0) {
        return {
          success: false,
          error: 'No boss data could be loaded. Check your API key and try again.'
        }
      }

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
