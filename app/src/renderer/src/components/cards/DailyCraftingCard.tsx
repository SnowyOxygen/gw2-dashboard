import React from 'react'
import Card from './Card'
import { useDailyCrafting } from '@renderer/hooks/useDailyCrafting'
import './DailyCraftingCard.css'

interface DailyCraftingCardProps {
  title: string
}

const DailyCraftingCard: React.FC<DailyCraftingCardProps> = ({ title }) => {
  const { crafts, loading, error } = useDailyCrafting()

  const craftingSVG = (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="crafting-icon">
      <title>crafting</title>
      <path d="M28 8l-4-4-8 8-8-8-4 4 8 8-8 8 4 4 8-8 8 8 4-4-8-8z" fill="currentColor" opacity="0.12" />
      <circle cx="16" cy="16" r="3" fill="currentColor" opacity="0.12" />
    </svg>
  )

  if (loading) {
    return (
      <Card title={title}>
        <div className="daily-crafting-card-background">{craftingSVG}</div>
        <div className="daily-card-content">
          <p className="loading-text">Loading crafting data...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card title={title}>
        <div className="daily-crafting-card-background">{craftingSVG}</div>
        <div className="daily-card-content">
          <p className="error-text">Error: {error}</p>
        </div>
      </Card>
    )
  }

  const completedCount = crafts.filter(c => c.completed).length
  const completionPercentage = crafts.length > 0 ? Math.round((completedCount / crafts.length) * 100) : 0

  return (
    <Card title={title}>
      <div className="daily-crafting-card-background">{craftingSVG}</div>
      <div className="daily-card-content">
        <div className="daily-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionPercentage}%` }} />
          </div>
          <p className="progress-text">{completedCount} / {crafts.length} crafted today</p>
        </div>

        <div className="daily-crafting-list">
          {crafts.map(craft => (
            <div key={craft.id} className={`craft-item ${craft.completed ? 'completed' : ''}`}>
              <div className="craft-checkbox">
                <span className={`checkbox-icon ${craft.completed ? 'checked' : ''}`}>
                  {craft.completed ? '✓' : ''}
                </span>
              </div>
              <div className="craft-info">
                <span className="craft-name">{craft.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default DailyCraftingCard
