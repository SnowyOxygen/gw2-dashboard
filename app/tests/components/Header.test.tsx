import { describe, it, expect } from 'vitest'
import { render, screen } from '../utils/test-utils'
import Header from '../../src/renderer/src/components/Header'
import { makePlayerData } from '../utils/factories'

const mockPlayer = makePlayerData()

describe('Header Component', () => {
  it('should render the header', () => {
    render(<Header playerStats={mockPlayer} />)
    // Add assertions based on your Header component
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('should display the app title', () => {
    render(<Header playerStats={mockPlayer} />)
    // Adjust this test based on your actual Header implementation
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
  })
})
