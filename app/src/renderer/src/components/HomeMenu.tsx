import React, { useState, useEffect } from 'react'
import './HomeMenu.css'

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

interface PlayerStats {
  accountName: string
  level: number
  masteryPoints: number
  achievementPoints: number
}

const HomeMenu: React.FC = () => {
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    accountName: 'Loading...',
    level: 80,
    masteryPoints: 0,
    achievementPoints: 0
  })

  useEffect(() => {
    loadAccountData()
  }, [])

  const loadAccountData = async () => {
    try {
      const accountName = await window.api.settings.getAccountName()
      const apiKey = await window.api.settings.getApiKey()

      if (accountName) {
        setPlayerStats(prev => ({ ...prev, accountName }))
      }

      // Fetch additional data from GW2 API
      if (apiKey) {
        const response = await fetch(`https://api.guildwars2.com/v2/account?access_token=${apiKey}`)
        if (response.ok) {
          const data = await response.json()
          setPlayerStats({
            accountName: data.name,
            level: 80, // GW2 max level
            masteryPoints: data.mastery_points || 0,
            achievementPoints: data.achievement_points || 0
          })
        }
      }
    } catch (error) {
      console.error('Failed to load account data:', error)
    }
  }

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

  return (
    <div className="home-menu">
      <header className="home-header">
        <h1 className="home-title">Guild Wars 2 Dashboard</h1>
        <div className="player-info">
          <div className="player-name">{playerStats.accountName}</div>
          <div className="player-stats">
            <span className="stat">
              <span className="stat-label">Level:</span> {playerStats.level}
            </span>
            <span className="stat-divider">•</span>
            <span className="stat">
              <span className="stat-label">Mastery:</span> {playerStats.masteryPoints}
            </span>
            <span className="stat-divider">•</span>
            <span className="stat">
              <span className="stat-label">AP:</span> {playerStats.achievementPoints}
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
