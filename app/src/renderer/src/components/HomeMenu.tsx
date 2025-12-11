import React from 'react'
import './HomeMenu.css'

import { useAccountData } from '@renderer/hooks/useAccountData'

interface MenuCardProps {
  title: string
  description: string
  icon: string
  onClick: () => void
}

const MenuCard: React.FC<MenuCardProps> = ({ title, description, icon, onClick }) => (
  <div className="menu-card" onClick={onClick}>
    <div className="menu-card-icon">{icon}</div>
    <h3 className="menu-card-title">{title}</h3>
    <p className="menu-card-description">{description}</p>
  </div>
)

interface HomeMenuProps {
  onResetSetup: () => void
}

const HomeMenu: React.FC<HomeMenuProps> = ({ onResetSetup }) => {
  const { playerStats } = useAccountData()

  const handleMyProgress = () => {
    console.log('Navigate to Progress tracking')
  }

  const handleEventSuggestions = () => {
    console.log('Navigate to Event suggestions')
  }

  const handleDailyTasks = () => {
    console.log('Navigate to Daily tasks')
  }

  const handleGoalPlanner = () => {
    console.log('Navigate to Goal planner')
  }

  const handleWorldEvents = () => {
    console.log('Navigate to World events')
  }

  const handleSettings = () => {
    console.log('Navigate to Settings')
  }

  const handleForgetApiKey = async () => {
    if (confirm('Are you sure you want to forget your API key? You will need to set it up again.')) {
      try {
        await window.api.settings.clearApiKey()
        onResetSetup()
      } catch (error) {
        console.error('Failed to clear API key:', error)
      }
    }
  }

  return (
    <div className="home-menu">
      <header className="home-header">
        <div className="header-top">
          <div style={{ flex: 1 }}>
            <h1 className="home-title">Guild Wars 2 Dashboard</h1>
          </div>
          <button className="forget-api-button" onClick={handleForgetApiKey} title="Forget API Key">
            🔓 Forget API Key
          </button>
        </div>
        <div className="player-info">
          <div className="player-name">{playerStats.name}</div>
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

      <div className="menu-grid">
        <MenuCard
          title="My Progress"
          description="View your character progression, achievements, and unlocks"
          icon="📊"
          onClick={handleMyProgress}
        />
        <MenuCard
          title="Event Suggestions"
          description="Get personalized event recommendations based on your goals"
          icon="🎯"
          onClick={handleEventSuggestions}
        />
        <MenuCard
          title="Daily Tasks"
          description="Track daily objectives, fractals, and strikes"
          icon="✅"
          onClick={handleDailyTasks}
        />
        <MenuCard
          title="Goal Planner"
          description="Set and track long-term goals like legendaries and collections"
          icon="🎁"
          onClick={handleGoalPlanner}
        />
        <MenuCard
          title="World Events"
          description="Real-time world boss and meta event timers"
          icon="⏰"
          onClick={handleWorldEvents}
        />
        <MenuCard
          title="Settings"
          description="Configure API keys and customize your dashboard"
          icon="⚙️"
          onClick={handleSettings}
        />
      </div>

      <footer className="home-footer">
        <div className="quick-stats">
          <div className="quick-stat-item">
            <span className="quick-stat-value">3</span>
            <span className="quick-stat-label">Dailies Remaining</span>
          </div>
          <div className="quick-stat-item">
            <span className="quick-stat-value">25m</span>
            <span className="quick-stat-label">Next World Boss</span>
          </div>
          <div className="quick-stat-item">
            <span className="quick-stat-value">2</span>
            <span className="quick-stat-label">Active Goals</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomeMenu
