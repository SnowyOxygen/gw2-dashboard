import React from 'react'
import DailyWorldBossCard from './cards/DailyWorldBossCard'
import EventsCard from './cards/EventsCard'
import DailyCraftingCard from './cards/DailyCraftingCard'

interface CardControllerProps {
  showDailyCard: boolean
  showEventsCard: boolean
  showCraftingCard: boolean
}

const CardController: React.FC<CardControllerProps> = ({
  showDailyCard,
  showEventsCard,
  showCraftingCard
}) => {
  const anyEnabled = showDailyCard || showEventsCard || showCraftingCard

  return (
    <div className="menu-grid">
      {showDailyCard && <DailyWorldBossCard title="Daily World Bosses" />}
      {showEventsCard && <EventsCard title="Events" />}
      {showCraftingCard && <DailyCraftingCard title="Daily Crafting" />}
      {!anyEnabled && (
        <div className="empty-state">
          <p>No cards enabled</p>
          <p>Open settings to enable cards</p>
        </div>
      )}
    </div>
  )
}

export default CardController
