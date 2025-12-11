/**
 * GW2 API IPC Handlers
 * Handlers for Guild Wars 2 API interactions
 */

import { ipcMain } from 'electron'
import { createAuthenticatedGW2Handler, createPublicGW2Handler } from './handlerFactory'

export function registerGW2ApiHandlers(getApiKey: () => string | null): void {
  // Account data
  ipcMain.handle(
    'settings:getAccountData',
    createAuthenticatedGW2Handler(
      getApiKey,
      'account',
      'accountData',
      'Failed to fetch account data'
    )
  )

  // Daily crafting
  ipcMain.handle(
    'settings:getDailyCrafting',
    createAuthenticatedGW2Handler(
      getApiKey,
      'account/dailycrafting',
      'data',
      'Failed to fetch daily crafting data'
    )
  )

  // Account world bosses
  ipcMain.handle(
    'api:getAccountWorldBosses',
    createAuthenticatedGW2Handler(
      getApiKey,
      'account/worldbosses',
      'completedBosses',
      'Failed to fetch account world bosses'
    )
  )

  // All world bosses (public endpoint)
  ipcMain.handle(
    'api:getAllWorldBosses',
    createPublicGW2Handler(
      'worldbosses',
      'allBosses',
      'Failed to fetch all world bosses'
    )
  )

  // Account achievements
  ipcMain.handle(
    'api:getWorldBossCompletions',
    createAuthenticatedGW2Handler(
      getApiKey,
      'account/achievements',
      'achievements',
      'Failed to fetch achievements'
    )
  )

  // Achievement metadata (public endpoint)
  ipcMain.handle('api:getAchievementMetadata', async (_, achievementId: number) => {
    try {
      const response = await fetch(`https://api.guildwars2.com/v2/achievements/${achievementId}`)
      
      if (!response.ok) {
        return { success: false, error: `Failed to fetch achievement ${achievementId}` }
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Failed to fetch achievement metadata' }
    }
  })

  // Validate API key
  ipcMain.handle('settings:validateApiKey', async (_, apiKey: string) => {
    try {
      const response = await fetch(`https://api.guildwars2.com/v2/account?access_token=${apiKey}`)
      
      if (!response.ok) {
        return { success: false, error: 'Invalid API key' }
      }

      const accountData = await response.json()
      return { success: true, accountData }
    } catch (error) {
      return { success: false, error: 'Failed to validate API key' }
    }
  })

  // World boss achievements (complex endpoint - kept as custom handler)
  ipcMain.handle('api:getAllWorldBossAchievements', async () => {
    try {
      console.log('Fetching world bosses from endpoint...')
      
      const response = await fetch('https://api.guildwars2.com/v2/worldbosses')
      
      if (!response.ok) {
        console.error('Failed to fetch world bosses')
        return { success: false, error: 'Failed to fetch world bosses' }
      }

      const eventIds = await response.json()
      console.log(`Found ${eventIds.length} world boss events:`, eventIds)
      
      const idsResponse = await fetch('https://api.guildwars2.com/v2/achievements')
      const allAchievementIds = await idsResponse.json()
      console.log(`Fetching details for ${allAchievementIds.length} achievements...`)
      
      const batchSize = 200
      const allAchievements: any[] = []
      
      for (let i = 0; i < allAchievementIds.length; i += batchSize) {
        const batch = allAchievementIds.slice(i, i + batchSize)
        const idsParam = batch.join(',')
        
        try {
          const detailsResponse = await fetch(`https://api.guildwars2.com/v2/achievements?ids=${idsParam}`)
          if (detailsResponse.ok) {
            const details = await detailsResponse.json()
            allAchievements.push(...details)
          }
        } catch (error) {
          console.error(`Error fetching batch ${i}-${i + batchSize}:`, error)
        }
      }
      
      console.log(`Fetched ${allAchievements.length} achievement details`)
      
      const bossAchievementMap = new Map<string, any>()
      
      allAchievements.forEach((achievement: any) => {
        const name = achievement.name?.toLowerCase() || ''
        const description = achievement.description?.toLowerCase() || ''
        
        eventIds.forEach((eventId: string) => {
          if (bossAchievementMap.has(eventId)) return
          
          const keywords = eventId.split('_').filter((k: string) => k.length > 2)
          
          const matchCount = keywords.filter(keyword => 
            name.includes(keyword) || description.includes(keyword)
          ).length
          
          const minKeywords = keywords.length > 2 ? 2 : keywords.length
          if (matchCount >= minKeywords) {
            const isDailyAchievement = name.includes('daily')
            bossAchievementMap.set(eventId, { achievement, isDailyAchievement, matchCount })
            console.log(`✓ Matched "${achievement.name}" to event "${eventId}" (${matchCount}/${keywords.length} keywords, daily: ${isDailyAchievement})`)
          }
        })
      })
      
      if (bossAchievementMap.size < eventIds.length) {
        allAchievements.forEach((achievement: any) => {
          const name = achievement.name?.toLowerCase() || ''
          const description = achievement.description?.toLowerCase() || ''
          
          eventIds.forEach((eventId: string) => {
            if (bossAchievementMap.has(eventId)) return
            
            const keywords = eventId.split('_').filter((k: string) => k.length > 2)
            const matchCount = keywords.filter(keyword => 
              name.includes(keyword) || description.includes(keyword)
            ).length
            
            if (matchCount > 0) {
              const isDailyAchievement = name.includes('daily')
              bossAchievementMap.set(eventId, { achievement, isDailyAchievement, matchCount })
              console.log(`✓ Matched "${achievement.name}" to event "${eventId}" (${matchCount}/${keywords.length} keywords, daily: ${isDailyAchievement}, FALLBACK)`)
            }
          })
        })
      }
      
      const worldBossAchievements = eventIds.map((eventId: string) => {
        const entry = bossAchievementMap.get(eventId)
        return entry?.achievement || null
      }).filter((a: any) => a !== null)
      
      const matchedEventIds = Array.from(bossAchievementMap.keys())
      const unmatchedEventIds = eventIds.filter((id: string) => !matchedEventIds.includes(id))
      
      if (unmatchedEventIds.length > 0) {
        console.warn(`⚠️ Unmatched world boss events: ${unmatchedEventIds.join(', ')}`)
      }
      
      console.log(`Filtered to ${worldBossAchievements.length} world boss achievements`)
      console.log('World boss achievements:', worldBossAchievements.map((a: any) => ({ id: a.id, name: a.name })))
      return { success: true, bosses: worldBossAchievements }
    } catch (error) {
      console.error('Error fetching world boss achievements:', error)
      return { success: false, error: 'Failed to fetch world boss achievements' }
    }
  })
}
