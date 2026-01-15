import React, { useState, useEffect } from 'react'
import './HomeMenu.css'

import { useAccountData } from '@renderer/hooks/useAccountData'
import Header from './Header'
import CardController from './CardController'
import Footer from './Footer'
import SettingsPanel from './SettingsPanel'
import { useWorldBossKillCounter } from '@renderer/hooks/useWorldBossKillCounter'

const STORAGE_KEY = 'dashboard_card_settings'

interface CardSettings {
  showDailyCard: boolean
  showEventsCard: boolean
  showCraftingCard: boolean
  showBossCounter: boolean
  showDailiesCounter: boolean
  showNextBossCounter: boolean
  showActiveGoalsCounter: boolean
}

const getDefaultSettings = (): CardSettings => ({
  showDailyCard: false,
  showEventsCard: false,
  showCraftingCard: false,
  showBossCounter: true,
  showDailiesCounter: true,
  showNextBossCounter: true,
  showActiveGoalsCounter: true
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
  const { totalKills } = useWorldBossKillCounter()
  
  // Load settings from localStorage
  const initialSettings = loadSettings()
  const [showDailyCard, setShowDailyCard] = useState(initialSettings.showDailyCard)
  const showEventsCard = initialSettings.showEventsCard
  const [showCraftingCard, setShowCraftingCard] = useState(initialSettings.showCraftingCard)
  const [showBossCounter, setShowBossCounter] = useState(initialSettings.showBossCounter)
  const [showDailiesCounter, setShowDailiesCounter] = useState(initialSettings.showDailiesCounter)
  const [showNextBossCounter, setShowNextBossCounter] = useState(initialSettings.showNextBossCounter)
  const [showActiveGoalsCounter, setShowActiveGoalsCounter] = useState(initialSettings.showActiveGoalsCounter)

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings: CardSettings = {
      showDailyCard,
      showEventsCard,
      showCraftingCard,
      showBossCounter,
      showDailiesCounter,
      showNextBossCounter,
      showActiveGoalsCounter
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }, [showDailyCard, showEventsCard, showCraftingCard, showBossCounter, showDailiesCounter, showNextBossCounter, showActiveGoalsCounter])

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

      <CardController
        showDailyCard={showDailyCard}
        showEventsCard={showEventsCard}
        showCraftingCard={showCraftingCard}
      />

      <Footer
        totalBossKills={totalKills}
        showBossCounter={showBossCounter}
      />

      {/* Settings Panel */}
      <SettingsPanel
        open={settingsPanelOpen}
        onClose={() => setSettingsPanelOpen(false)}
        showDailyCard={showDailyCard}
        setShowDailyCard={setShowDailyCard}
        showCraftingCard={showCraftingCard}
        setShowCraftingCard={setShowCraftingCard}
        showBossCounter={showBossCounter}
        setShowBossCounter={setShowBossCounter}
        showDailiesCounter={showDailiesCounter}
        setShowDailiesCounter={setShowDailiesCounter}
        showNextBossCounter={showNextBossCounter}
        setShowNextBossCounter={setShowNextBossCounter}
        showActiveGoalsCounter={showActiveGoalsCounter}
        setShowActiveGoalsCounter={setShowActiveGoalsCounter}
      />

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
