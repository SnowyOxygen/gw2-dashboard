/**
 * Generic hook for managing asynchronous data fetching
 * Provides consistent loading, error, and data state management
 */
import { useState, useEffect, useCallback } from 'react'

export interface UseAsyncDataOptions {
  /**
   * Whether to load data automatically on mount
   * @default true
   */
  autoLoad?: boolean
  
  /**
   * Interval in milliseconds for auto-refresh
   * @default undefined (no auto-refresh)
   */
  refreshInterval?: number
}

export interface UseAsyncDataResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Generic hook for fetching and managing async data
 * 
 * @param fetcher - Async function that fetches the data
 * @param options - Configuration options
 * @returns Object containing data, loading state, error, and refetch function
 * 
 * @example
 * const { data, loading, error, refetch } = useAsyncData(
 *   async () => await api.fetchData(),
 *   { refreshInterval: 5000 }
 * )
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions = {}
): UseAsyncDataResult<T> {
  const { autoLoad = true, refreshInterval } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(autoLoad)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await fetcher()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    if (autoLoad) {
      load()
    }
  }, [autoLoad, load])

  // Setup auto-refresh interval if specified
  useEffect(() => {
    if (!refreshInterval) return

    const interval = setInterval(() => {
      load()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval, load])

  return {
    data,
    loading,
    error,
    refetch: load
  }
}
