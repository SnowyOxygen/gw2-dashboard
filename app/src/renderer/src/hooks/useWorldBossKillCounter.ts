import { useEffect, useState } from 'react'
import { useWorldBossCompletions } from './useWorldBossCompletions'

const STORAGE_KEY_PREFIX = 'world_boss_kills_' // followed by YYYY-MM-DD
const TOTAL_KILLS_KEY = 'world_boss_total_kills'

function getTodayKey(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${STORAGE_KEY_PREFIX}${yyyy}-${mm}-${dd}`
}

export const useWorldBossKillCounter = () => {
  const { bosses } = useWorldBossCompletions()
  const [todayKey, setTodayKey] = useState<string>(getTodayKey())
  const [killedToday, setKilledToday] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(todayKey)
      if (!raw) return new Set<string>()
      const arr: string[] = JSON.parse(raw)
      return new Set(arr)
    } catch {
      return new Set<string>()
    }
  })
  const [totalKills, setTotalKills] = useState<number>(() => {
    const raw = localStorage.getItem(TOTAL_KILLS_KEY)
    const num = raw ? Number(raw) : 0
    return Number.isFinite(num) ? num : 0
  })

  // When bosses data updates, mark newly completed bosses once per day
  useEffect(() => {
    if (!bosses || bosses.length === 0) return

    // Handle date rollover: if day changed, swap storage key and reload set
    const currentKey = getTodayKey()
    if (currentKey !== todayKey) {
      setTodayKey(currentKey)
      try {
        const raw = localStorage.getItem(currentKey)
        const arr: string[] = raw ? JSON.parse(raw) : []
        setKilledToday(new Set(arr))
      } catch {
        setKilledToday(new Set())
      }
    }

    const updated = new Set(killedToday)
    let changed = false

    bosses.forEach(boss => {
      if (boss.completed && !updated.has(boss.id)) {
        updated.add(boss.id)
        changed = true
      }
    })

    if (changed) {
      setKilledToday(updated)
      try {
        localStorage.setItem(todayKey, JSON.stringify(Array.from(updated)))
      } catch {
        // ignore storage errors
      }

      // Increment total kills for each newly added boss id
      const additions = updated.size - killedToday.size
      if (additions > 0) {
        const newTotal = totalKills + additions
        setTotalKills(newTotal)
        try {
          localStorage.setItem(TOTAL_KILLS_KEY, String(newTotal))
        } catch {
          // ignore storage errors
        }
      }
    }
  }, [bosses, todayKey, killedToday, totalKills])

  return {
    killsTodayCount: killedToday.size,
    killedTodayIds: Array.from(killedToday),
    totalKills
  }
}
