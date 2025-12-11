/**
 * Header component for the dashboard
 * Displays the application title and player information
 */
import React from 'react'
import type { PlayerData } from '@renderer/models/PlayerData'
import gw2Logo from '@renderer/assets/gw2_logo.png'
import './Header.css'

interface HeaderProps {
  playerStats: PlayerData
}

const Header: React.FC<HeaderProps> = ({ playerStats }) => {
  return (
    <header className="home-header">
      <div className="player-info">
        <div className="player-identity">
          <img src={gw2Logo} alt="GW2 Logo" className="gw2-logo" />
          <div className="player-name">{playerStats.name}</div>
        </div>
        <div className="player-stats">
          <span className="stat-divider">•</span>
          <span className="stat">
            <span className="stat-label">Account Age:</span> {playerStats.age}
          </span>
          <span className="stat-divider">•</span>
          <span className="stat">
            <span className="stat-label">Fractal Level:</span> {playerStats.fractal_level}
          </span>
        </div>
      </div>
    </header>
  )
}

export default Header
