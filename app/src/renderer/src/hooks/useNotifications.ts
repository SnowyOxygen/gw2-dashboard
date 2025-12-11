/**
 * Hook for sending notifications from React components
 */

import { useCallback } from 'react'

export function useNotifications() {
  const sendNotification = useCallback(async (title: string, body?: string) => {
    try {
      const result = await window.api.notifications.sendNotification(title, body)
      if (!result.success) {
        console.error('Failed to send notification:', result.error)
      }
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }, [])

  const sendSuccess = useCallback(async (title: string, body?: string) => {
    try {
      const result = await window.api.notifications.sendSuccess(title, body)
      if (!result.success) {
        console.error('Failed to send success notification:', result.error)
      }
    } catch (error) {
      console.error('Error sending success notification:', error)
    }
  }, [])

  const sendError = useCallback(async (title: string, body?: string) => {
    try {
      const result = await window.api.notifications.sendError(title, body)
      if (!result.success) {
        console.error('Failed to send error notification:', result.error)
      }
    } catch (error) {
      console.error('Error sending error notification:', error)
    }
  }, [])

  const sendInfo = useCallback(async (title: string, body?: string) => {
    try {
      const result = await window.api.notifications.sendInfo(title, body)
      if (!result.success) {
        console.error('Failed to send info notification:', result.error)
      }
    } catch (error) {
      console.error('Error sending info notification:', error)
    }
  }, [])

  const sendWarning = useCallback(async (title: string, body?: string) => {
    try {
      const result = await window.api.notifications.sendWarning(title, body)
      if (!result.success) {
        console.error('Failed to send warning notification:', result.error)
      }
    } catch (error) {
      console.error('Error sending warning notification:', error)
    }
  }, [])

  return {
    sendNotification,
    sendSuccess,
    sendError,
    sendInfo,
    sendWarning
  }
}
