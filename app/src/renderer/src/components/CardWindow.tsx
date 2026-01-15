import React, { useEffect, useState } from 'react'
import DailyWorldBossCard from './cards/DailyWorldBossCard'
import EventsCard from './cards/EventsCard'
import DailyCraftingCard from './cards/DailyCraftingCard'
import './CardWindow.css'

interface CardWindowProps {
  cardId: string
}

const CardWindow: React.FC<CardWindowProps> = ({ cardId }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const renderCard = () => {
    switch (cardId) {
      case 'daily':
        return <DailyWorldBossCard title="Daily World Bosses" hideHeader={true} />
      case 'events':
        return <EventsCard title="Events" hideHeader={true} />
      case 'crafting':
        return <DailyCraftingCard title="Daily Crafting" hideHeader={true} />
      default:
        return <div>Unknown card</div>
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from top area
    const element = e.currentTarget as HTMLDivElement
    if (e.clientY - element.getBoundingClientRect().top > 40) {
      return
    }

    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    window.api.window.moveCardWindow(cardId, deltaX, deltaY)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDockClick = () => {
    window.api.window.dockCard(cardId)
  }

  return (
    <div
      className="card-window"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="card-window-header">
        <div className="card-window-drag-handle">⋮⋮</div>
        <button
          className="card-window-close-button"
          onClick={handleDockClick}
          title="Dock card"
        >
          ✕
        </button>
      </div>
      <div className="card-window-content">
        {renderCard()}
      </div>
    </div>
  )
}

export default CardWindow
