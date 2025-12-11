/**
 * Daily Crafting Constants
 * Contains metadata for daily crafting items
 */

export interface CraftingItem {
  id: string
  name: string
}

/**
 * Available daily crafting items with their names
 */
export const CRAFTING_ITEMS: CraftingItem[] = [
  { id: 'charged_quartz_crystal', name: 'Charged Quartz Crystal' },
  { id: 'glob_of_elder_spirit_residue', name: 'Glob of Elder Spirit Residue' },
  { id: 'lump_of_mithrilium', name: 'Lump of Mithrilium' },
  { id: 'spool_of_silk_weaving_thread', name: 'Spool of Silk Weaving Thread' },
  { id: 'spool_of_thick_elonian_cord', name: 'Spool of Thick Elonian Cord' }
]
