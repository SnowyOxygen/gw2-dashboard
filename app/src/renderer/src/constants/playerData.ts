/**
 * Player Data Constants
 * Contains default values and templates for player data
 */

import { PlayerData } from '@renderer/models/PlayerData'

/**
 * Default player data structure used when data is loading or unavailable
 */
export const DEFAULT_PLAYER_DATA: PlayerData = {
  id: '',
  name: 'Loading...',
  age: 0,
  world: '',
  guilds: [],
  guild_leader: '',
  created: new Date(),
  access: [],
  commander: false,
  fractal_level: 0,
  daily_ap: 0,
  monthly_ap: 0,
  wvw_rank: 0
}
