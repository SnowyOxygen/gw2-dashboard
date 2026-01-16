import React from 'react'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
  showDailyCard: boolean
  setShowDailyCard: (v: boolean) => void
  showCraftingCard: boolean
  setShowCraftingCard: (v: boolean) => void
  showBossCounter: boolean
  setShowBossCounter: (v: boolean) => void
  showDailiesCounter: boolean
  setShowDailiesCounter: (v: boolean) => void
  showNextBossCounter: boolean
  setShowNextBossCounter: (v: boolean) => void
  showActiveGoalsCounter: boolean
  setShowActiveGoalsCounter: (v: boolean) => void
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  open,
  onClose,
  showDailyCard,
  setShowDailyCard,
  showCraftingCard,
  setShowCraftingCard,
  showBossCounter,
  setShowBossCounter,
  _showDailiesCounter,
  _setShowDailiesCounter,
  _showNextBossCounter,
  _setShowNextBossCounter,
  _showActiveGoalsCounter,
  _setShowActiveGoalsCounter
}) => {
  return (
    <div className={`settings-panel ${open ? 'open' : ''}`}>
      <button
        className="settings-panel-close"
        onClick={onClose}
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

        <div className="settings-section">
          <h3 className="settings-section-title">Counters</h3>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={showBossCounter}
              onChange={(e) => setShowBossCounter(e.target.checked)}
            />
            <span className="toggle-slider" />
            <span className="toggle-label">Total Boss Kills</span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel
