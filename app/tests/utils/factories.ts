import type { PlayerData } from '../../src/renderer/src/models/PlayerData'

// Lightweight deterministic data factory similar to AutoFixture
export function makePlayerData(overrides: Partial<PlayerData> = {}): PlayerData {
  const base: PlayerData = {
    id: 'player-123',
    name: 'Tester.1234',
    age: 365,
    world: 'Tarnished Coast',
    guilds: ['Guild A', 'Guild B'],
    guild_leader: 'Leader',
    created: new Date('2024-01-01T00:00:00Z'),
    access: ['GuildWars2', 'HeartOfThorns'],
    commander: false,
    fractal_level: 50,
    daily_ap: 10,
    monthly_ap: 100,
    wvw_rank: 200,
  }
  return { ...base, ...overrides }
}
