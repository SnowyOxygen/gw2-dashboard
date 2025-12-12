import { describe, it, expect } from 'vitest'
import { gw2BossService } from '../../src/renderer/src/services/gw2boss'

// Minimal type shape mirrors preload API used by service
declare global {
	interface Window {
		api: {
			gw2: {
				getAllWorldBosses: () => Promise<{ success: boolean; allBosses?: string[]; error?: string }>
				getAccountWorldBosses: () => Promise<{ success: boolean; completedBosses?: string[]; error?: string }>
			}
		}
	}
}

// Helpers
const setWindowApi = (impl: {
	getAllWorldBosses: Window['api']['gw2']['getAllWorldBosses']
	getAccountWorldBosses: Window['api']['gw2']['getAccountWorldBosses']
}) => {
	(window as unknown as { api: Window['api'] }).api = { gw2: impl }
}

describe('gw2BossService.getWorldBossCompletions', () => {

	it('returns sorted boss list with completion and nextSpawn', async () => {
		setWindowApi({
			getAllWorldBosses: async () => ({ success: true, allBosses: ['shadow_behemoth', 'svanir_shaman_chief'] }),
			getAccountWorldBosses: async () => ({ success: true, completedBosses: ['shadow_behemoth'] })
		})

		const result = await gw2BossService.getWorldBossCompletions()
		expect(result.success).toBe(true)
		expect(result.bosses).toBeDefined()
		const bosses = result.bosses!

		// Ensure both bosses are present
		expect(bosses.map((b: typeof bosses[number]) => b.id)).toEqual(['shadow_behemoth', 'svanir_shaman_chief'])

		// Completion reflects account data
		const behemoth = bosses.find((b: typeof bosses[number]) => b.id === 'shadow_behemoth')!
		const svanir = bosses.find((b: typeof bosses[number]) => b.id === 'svanir_shaman_chief')!
		expect(behemoth.completed).toBe(true)
		expect(svanir.completed).toBe(false)

		// nextSpawn is a Date and list is sorted ascending by nextSpawn
		expect(behemoth.nextSpawn instanceof Date).toBe(true)
		expect(svanir.nextSpawn instanceof Date).toBe(true)
		const sorted = [...bosses].sort((a, b) => a.nextSpawn.getTime() - b.nextSpawn.getTime())
		expect(bosses).toEqual(sorted)
	})

	it('handles failure to fetch boss list', async () => {
		setWindowApi({
			getAllWorldBosses: async () => ({ success: false, error: 'network' }),
			getAccountWorldBosses: async () => ({ success: true, completedBosses: [] })
		})

		const result = await gw2BossService.getWorldBossCompletions()
		expect(result.success).toBe(false)
		expect(result.error).toBe('network')
	})

	it('handles failure to fetch account completions', async () => {
		setWindowApi({
			getAllWorldBosses: async () => ({ success: true, allBosses: ['shadow_behemoth'] }),
			getAccountWorldBosses: async () => ({ success: false, error: 'network' })
		})

		const result = await gw2BossService.getWorldBossCompletions()
		expect(result.success).toBe(false)
		expect(result.error).toBe('network')
	})

	it('falls back to sensible defaults when boss info missing', async () => {
		// Use an unknown boss id to trigger generated name + default spawn
		setWindowApi({
			getAllWorldBosses: async () => ({ success: true, allBosses: ['unknown_boss'] }),
			getAccountWorldBosses: async () => ({ success: true, completedBosses: [] })
		})

		const result = await gw2BossService.getWorldBossCompletions()
		expect(result.success).toBe(true)
		const boss = result.bosses![0]

		// Name is title-cased from id, zone defaults, and nextSpawn computed
		expect(boss.name).toBe('Unknown Boss')
		expect(boss.zone).toBe('Open World')
		expect(boss.nextSpawn instanceof Date).toBe(true)
	})
})

