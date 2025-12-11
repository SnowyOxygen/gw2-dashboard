/**
 * Custom hook for managing daily crafting completions
 */
import { useCallback, useMemo } from 'react'
import { useAsyncData } from './common/useAsyncData'
import { CRAFTING_ITEMS } from '@renderer/constants/crafting'

export interface DailyCrafting {
  id: string
  name: string
  completed: boolean
}

export const useDailyCrafting = () => {
  const fetchDailyCrafting = useCallback(async (): Promise<string[]> => {
    const result = await window.api.settings.getDailyCrafting()
    
    if (result.success && result.data) {
      return result.data
    }
    
    throw new Error(result.error || 'Failed to load daily crafting data')
  }, [])

  const { data: completedCrafts, loading, error, refetch } = useAsyncData(fetchDailyCrafting)

  const crafts: DailyCrafting[] = useMemo(() => {
    return CRAFTING_ITEMS.map(item => ({
      id: item.id,
      name: item.name,
      completed: (completedCrafts || []).includes(item.id)
    }))
  }, [completedCrafts])

  return { 
    crafts, 
    loading, 
    error, 
    refresh: refetch 
  }
}
