/**
 * Custom hook for managing daily crafting completions
 */
import { useState, useEffect } from 'react'

export interface DailyCrafting {
  id: string
  name: string
  completed: boolean
}

export const useDailyCrafting = () => {
  const [completedCrafts, setCompletedCrafts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Available daily crafting items with their names
  const craftingItems = [
    { id: 'charged_quartz_crystal', name: 'Charged Quartz Crystal' },
    { id: 'glob_of_elder_spirit_residue', name: 'Glob of Elder Spirit Residue' },
    { id: 'lump_of_mithrilium', name: 'Lump of Mithrilium' },
    { id: 'spool_of_silk_weaving_thread', name: 'Spool of Silk Weaving Thread' },
    { id: 'spool_of_thick_elonian_cord', name: 'Spool of Thick Elonian Cord' }
  ]

  useEffect(() => {
    loadDailyCrafting()
  }, [])

  const loadDailyCrafting = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await window.api.settings.getDailyCrafting()
      
      if (result.success && result.data) {
        setCompletedCrafts(result.data)
      } else {
        setError(result.error || 'Failed to load daily crafting data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      console.error('Error loading daily crafting:', err)
    } finally {
      setLoading(false)
    }
  }

  const crafts: DailyCrafting[] = craftingItems.map(item => ({
    id: item.id,
    name: item.name,
    completed: completedCrafts.includes(item.id)
  }))

  return { crafts, loading, error, refresh: loadDailyCrafting }
}
