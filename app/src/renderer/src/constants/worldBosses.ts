/**
 * World Boss Constants
 * Contains boss metadata including names, zones, and spawn times
 */

export interface BossSpawnTime {
  hour: number
  minute: number
}

export interface BossMetadata {
  name: string
  zone: string
  spawnTimes: BossSpawnTime[]
}

/**
 * Map of boss IDs to display names, zones, and exact spawn times (UTC)
 */
export const BOSS_INFO: Record<string, BossMetadata> = {
  admiral_taidha_covington: {
    name: 'Admiral Taidha Covington',
    zone: 'Gendarran Fields',
    spawnTimes: [
      { hour: 15, minute: 16 },
      { hour: 3, minute: 0 },
      { hour: 6, minute: 0 },
      { hour: 9, minute: 0 },
      { hour: 12, minute: 0 },
      { hour: 15, minute: 0 },
      { hour: 18, minute: 0 },
      { hour: 21, minute: 0 }
    ]
  },
  claw_of_jormag: {
    name: 'Claw of Jormag',
    zone: 'Frostgorge Sound',
    spawnTimes: [
      { hour: 2, minute: 30 },
      { hour: 5, minute: 30 },
      { hour: 8, minute: 30 },
      { hour: 11, minute: 30 },
      { hour: 14, minute: 30 },
      { hour: 17, minute: 30 },
      { hour: 20, minute: 30 },
      { hour: 23, minute: 30 }
    ]
  },
  commodore_aria_keene: {
    name: 'Commodore Aria Keene',
    zone: 'Gendarran Fields',
    spawnTimes: []
  },
  drakkar: {
    name: 'Drakkar',
    zone: 'Bjora Marches',
    spawnTimes: []
  },
  fire_elemental: {
    name: 'Fire Elemental',
    zone: 'Metrica Province',
    spawnTimes: [
      { hour: 0, minute: 45 },
      { hour: 2, minute: 45 },
      { hour: 4, minute: 45 },
      { hour: 6, minute: 45 },
      { hour: 8, minute: 45 },
      { hour: 10, minute: 45 },
      { hour: 12, minute: 45 },
      { hour: 14, minute: 45 },
      { hour: 16, minute: 45 },
      { hour: 18, minute: 45 },
      { hour: 20, minute: 45 },
      { hour: 22, minute: 45 }
    ]
  },
  great_jungle_wurm: {
    name: 'Great Jungle Wurm',
    zone: 'Caledon Forest',
    spawnTimes: [
      { hour: 1, minute: 15 },
      { hour: 3, minute: 15 },
      { hour: 5, minute: 15 },
      { hour: 7, minute: 15 },
      { hour: 9, minute: 15 },
      { hour: 11, minute: 15 },
      { hour: 13, minute: 15 },
      { hour: 15, minute: 15 },
      { hour: 17, minute: 15 },
      { hour: 19, minute: 15 },
      { hour: 21, minute: 15 },
      { hour: 23, minute: 15 }
    ]
  },
  inquest_golem_mark_ii: {
    name: 'Inquest Golem Mark II',
    zone: 'Mount Maelstrom',
    spawnTimes: [
      { hour: 2, minute: 0 },
      { hour: 5, minute: 0 },
      { hour: 8, minute: 0 },
      { hour: 11, minute: 0 },
      { hour: 14, minute: 0 },
      { hour: 17, minute: 0 },
      { hour: 20, minute: 0 },
      { hour: 23, minute: 0 }
    ]
  },
  megadestroyer: {
    name: 'Megadestroyer',
    zone: 'Mount Maelstrom',
    spawnTimes: [
      { hour: 0, minute: 30 },
      { hour: 3, minute: 30 },
      { hour: 6, minute: 30 },
      { hour: 9, minute: 30 },
      { hour: 12, minute: 30 },
      { hour: 15, minute: 30 },
      { hour: 18, minute: 30 },
      { hour: 21, minute: 30 }
    ]
  },
  modniir_ulgoth: {
    name: 'Modniir Ulgoth',
    zone: 'Harathi Hinterlands',
    spawnTimes: [
      { hour: 1, minute: 30 },
      { hour: 4, minute: 30 },
      { hour: 7, minute: 30 },
      { hour: 10, minute: 30 },
      { hour: 13, minute: 30 },
      { hour: 16, minute: 30 },
      { hour: 19, minute: 30 },
      { hour: 22, minute: 30 }
    ]
  },
  shadow_behemoth: {
    name: 'Shadow Behemoth',
    zone: 'Queensdale',
    spawnTimes: [
      { hour: 1, minute: 45 },
      { hour: 3, minute: 45 },
      { hour: 5, minute: 45 },
      { hour: 7, minute: 45 },
      { hour: 9, minute: 45 },
      { hour: 11, minute: 45 },
      { hour: 13, minute: 45 },
      { hour: 15, minute: 45 },
      { hour: 17, minute: 45 },
      { hour: 19, minute: 45 },
      { hour: 21, minute: 45 },
      { hour: 23, minute: 45 }
    ]
  },
  svanir_shaman_chief: {
    name: 'Svanir Shaman Chief',
    zone: 'Wayfarer Foothills',
    spawnTimes: [
      { hour: 0, minute: 15 },
      { hour: 2, minute: 15 },
      { hour: 4, minute: 15 },
      { hour: 6, minute: 15 },
      { hour: 8, minute: 15 },
      { hour: 10, minute: 15 },
      { hour: 12, minute: 15 },
      { hour: 14, minute: 15 },
      { hour: 16, minute: 15 },
      { hour: 18, minute: 15 },
      { hour: 20, minute: 15 },
      { hour: 22, minute: 15 }
    ]
  },
  tequatl_the_sunless: {
    name: 'Tequatl the Sunless',
    zone: 'Sparkfly Fen',
    spawnTimes: []
  },
  the_shatterer: {
    name: 'The Shatterer',
    zone: 'Blazeridge Steppes',
    spawnTimes: [
      { hour: 1, minute: 0 },
      { hour: 4, minute: 0 },
      { hour: 7, minute: 0 },
      { hour: 10, minute: 0 },
      { hour: 13, minute: 0 },
      { hour: 16, minute: 0 },
      { hour: 19, minute: 0 },
      { hour: 22, minute: 0 }
    ]
  },
  triple_trouble: {
    name: 'Triple Trouble',
    zone: 'Bloodtide Coast',
    spawnTimes: []
  }
}
