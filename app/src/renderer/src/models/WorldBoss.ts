export interface WorldBossCompletion {
  id: string
  name: string
  zone: string
  completed: boolean
  nextSpawn?: Date
}

export interface WorldBossResult {
  success: boolean
  bosses?: WorldBossCompletion[]
  error?: string
}
