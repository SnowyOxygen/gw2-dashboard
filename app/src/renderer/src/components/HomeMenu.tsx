import React, { useState, useEffect } from 'react'
import './HomeMenu.css'

import { useAccountData } from '@renderer/hooks/useAccountData'
import Header from './Header'
import DailyWorldBossCard from './cards/DailyWorldBossCard'
import EventsCard from './cards/EventsCard'
import DailyCraftingCard from './cards/DailyCraftingCard'

const STORAGE_KEY = 'dashboard_card_settings'

interface CardSettings {
  showDailyCard: boolean
  showEventsCard: boolean
  showCraftingCard: boolean
}

const getDefaultSettings = (): CardSettings => ({
  showDailyCard: false,
  showEventsCard: false,
  showCraftingCard: false
})

const loadSettings = (): CardSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...getDefaultSettings(), ...JSON.parse(stored) }
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
  return getDefaultSettings()
}

interface HomeMenuProps {
  onResetSetup: () => void
}

const HomeMenu: React.FC<HomeMenuProps> = ({ onResetSetup }) => {
  const { playerStats } = useAccountData()
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false)
  
  // Load settings from localStorage
  const initialSettings = loadSettings()
  const [showDailyCard, setShowDailyCard] = useState(initialSettings.showDailyCard)
  const [showEventsCard, setShowEventsCard] = useState(initialSettings.showEventsCard)
  const [showCraftingCard, setShowCraftingCard] = useState(initialSettings.showCraftingCard)

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings: CardSettings = {
      showDailyCard,
      showEventsCard,
      showCraftingCard
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }, [showDailyCard, showEventsCard, showCraftingCard])

  const handleSettings = () => {
    setSettingsPanelOpen(!settingsPanelOpen)
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
      <button className="settings-icon-button" onClick={handleSettings} title="Settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m4.24-4.24l4.24-4.24" />
        </svg>
      </button>
      <button className="forget-api-icon-button" onClick={handleForgetApiKey} title="Forget API Key">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </button>
      <Header playerStats={playerStats} />

      <div className="menu-grid">
        {showDailyCard && <DailyWorldBossCard title="Daily World Bosses" />}
        {showEventsCard && <EventsCard title="Events" />}
        {showCraftingCard && <DailyCraftingCard title="Daily Crafting" />}
        {!showDailyCard && !showEventsCard && !showCraftingCard && (
          <div className="empty-state">
            <p>No cards enabled</p>
            <p>Open settings to enable cards</p>
          </div>
        )}
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

      {/* Settings Panel */}
      <div className={`settings-panel ${settingsPanelOpen ? 'open' : ''}`}>
        <button 
          className="settings-panel-close" 
          onClick={() => setSettingsPanelOpen(false)}
          title="Close Settings"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h2 className="settings-panel-title">Settings</h2>
        <div className="settings-panel-content">
          <div className="settings-section">
            <h3 className="settings-section-title">Widgets</h3>

            <label className="settings-toggle">
              <input 
                type="checkbox" 
                checked={showDailyCard}
                onChange={(e) => setShowDailyCard(e.target.checked)}
              />
              <span className="toggle-slider" />
              <span className="toggle-label">Daily World Bosses</span>
            </label>

            <label className="settings-toggle">
              <input 
                type="checkbox" 
                checked={showCraftingCard}
                onChange={(e) => setShowCraftingCard(e.target.checked)}
              />
              <span className="toggle-slider" />
              <span className="toggle-label">Daily Crafting</span>
            </label>
          </div>
        </div>
      </div>

      {/* Overlay for closing settings panel */}
      {settingsPanelOpen && (
        <div 
          className="settings-overlay" 
          onClick={() => setSettingsPanelOpen(false)}
        />
      )}
    </div>
  )
}

export default HomeMenu
