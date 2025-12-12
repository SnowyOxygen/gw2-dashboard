import React from 'react'

interface FooterProps {
  totalBossKills?: number
  showBossCounter?: boolean
}

const Footer: React.FC<FooterProps> = ({
  totalBossKills = 0,
  showBossCounter = true
}) => {
  return (
    <footer className="home-footer">
      <div className="quick-stats">
        {showBossCounter ? (
          <div className="quick-stat-item">
            <span className="quick-stat-value">{totalBossKills}</span>
            <span className="quick-stat-label">Total Boss Kills</span>
          </div>
        ) : (
          <div className="empty-state">
            <p>No counters enabled, enable in settings.</p>
          </div>
        )}
      </div>
    </footer>
  )
}

export default Footer
