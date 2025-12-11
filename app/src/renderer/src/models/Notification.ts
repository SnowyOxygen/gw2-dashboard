/**
 * Notification types and interfaces
 */

export interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  silent?: boolean
  tag?: string
}

export interface NotificationResult {
  success: boolean
  error?: string
}
