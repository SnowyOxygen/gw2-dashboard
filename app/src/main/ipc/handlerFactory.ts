/**
 * IPC Handler Factory
 * Utilities for creating standardized IPC handlers with consistent error handling
 */

import { IpcMainInvokeEvent } from 'electron'

export interface ApiResult<T = unknown> {
  success: boolean
  error?: string
  data?: T
  [key: string]: any
}

/**
 * Creates a simple IPC handler that wraps a synchronous function
 * with automatic error handling
 */
export function createSimpleHandler<TArgs extends any[], TResult>(
  handler: (...args: TArgs) => TResult
) {
  return (_event: IpcMainInvokeEvent, ...args: TArgs): TResult => {
    return handler(...args)
  }
}

/**
 * Creates an async IPC handler with automatic error handling
 * Returns a standardized { success, error } result
 */
export function createAsyncHandler<TArgs extends any[], TResult>(
  handler: (...args: TArgs) => Promise<TResult>,
  errorMessage = 'Operation failed'
): (_event: IpcMainInvokeEvent, ...args: TArgs) => Promise<ApiResult<TResult>> {
  return async (_event: IpcMainInvokeEvent, ...args: TArgs): Promise<ApiResult<TResult>> => {
    try {
      const result = await handler(...args)
      return { success: true, ...result } as ApiResult<TResult>
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : errorMessage
      }
    }
  }
}

/**
 * Creates a handler for authenticated GW2 API calls
 * Automatically validates API key and handles common error cases
 */
export function createAuthenticatedGW2Handler<TResult>(
  getApiKey: () => string | null,
  endpoint: string | ((apiKey: string) => string),
  resultKey?: string,
  errorMessage?: string
): () => Promise<ApiResult<TResult>> {
  return async (): Promise<ApiResult<TResult>> => {
    try {
      const apiKey = getApiKey()
      if (!apiKey) {
        return { success: false, error: 'No API key found' }
      }

      const url = typeof endpoint === 'function' 
        ? endpoint(apiKey)
        : `https://api.guildwars2.com/v2/${endpoint}?access_token=${apiKey}`

      const response = await fetch(url)
      
      if (!response.ok) {
        return { 
          success: false, 
          error: errorMessage || `Failed to fetch ${endpoint}` 
        }
      }

      const data = await response.json()
      
      if (resultKey) {
        return { success: true, [resultKey]: data }
      }
      
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : (errorMessage || 'Request failed')
      }
    }
  }
}

/**
 * Creates a handler for public GW2 API calls (no authentication required)
 */
export function createPublicGW2Handler<TResult>(
  endpoint: string,
  resultKey?: string,
  errorMessage?: string
): () => Promise<ApiResult<TResult>> {
  return async (): Promise<ApiResult<TResult>> => {
    try {
      const url = `https://api.guildwars2.com/v2/${endpoint}`
      const response = await fetch(url)
      
      if (!response.ok) {
        return { 
          success: false, 
          error: errorMessage || `Failed to fetch ${endpoint}` 
        }
      }

      const data = await response.json()
      
      if (resultKey) {
        return { success: true, [resultKey]: data }
      }
      
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : (errorMessage || 'Request failed')
      }
    }
  }
}

/**
 * Creates a handler that validates a service is initialized before use
 */
export function createServiceHandler<TService, TArgs extends any[], TResult>(
  getService: () => TService | null,
  serviceName: string,
  handler: (service: TService, ...args: TArgs) => TResult
) {
  return (_event: IpcMainInvokeEvent, ...args: TArgs): ApiResult<TResult> => {
    try {
      const service = getService()
      if (!service) {
        return { success: false, error: `${serviceName} not initialized` }
      }
      const result = handler(service, ...args)
      return { success: true, result }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
