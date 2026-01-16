import React, { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DailyWorldBossCard from './cards/DailyWorldBossCard'
import EventsCard from './cards/EventsCard'
import DailyCraftingCard from './cards/DailyCraftingCard'
import './CardController.css'

// Wrapper component for each draggable card in grid
interface SortableCardProps {
  id: string
  title: string
  children: React.ReactNode
  onFloat: (id: string, title: string) => void
  isFloating: boolean
}

const SortableCard: React.FC<SortableCardProps> = ({ id, title, children, onFloat, isFloating }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="sortable-card-wrapper">
      <div className="card-container">
        {children}
        <button 
          className="float-button" 
          onClick={(e) => {
            e.stopPropagation()
            onFloat(id, title)
          }}
          title={isFloating ? 'This card is floating' : 'Float card as window'}
          disabled={isFloating}
        >
          📌
        </button>
      </div>
    </div>
  )
}

interface CardConfig {
  id: string
  type: 'daily' | 'events' | 'crafting'
  enabled: boolean
  floating?: boolean
}

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
  const [cardOrder, setCardOrder] = useState<CardConfig[]>([
    { id: 'daily', type: 'daily', enabled: showDailyCard, floating: false },
    { id: 'events', type: 'events', enabled: showEventsCard, floating: false },
    { id: 'crafting', type: 'crafting', enabled: showCraftingCard, floating: false }
  ])

  // Sensors for drag detection in grid
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Update enabled state when props change
  useEffect(() => {
    setCardOrder(prev =>
      prev.map(card => {
        switch (card.type) {
          case 'daily':
            return { ...card, enabled: showDailyCard }
          case 'events':
            return { ...card, enabled: showEventsCard }
          case 'crafting':
            return { ...card, enabled: showCraftingCard }
          default:
            return card
        }
      })
    )
  }, [showDailyCard, showEventsCard, showCraftingCard])

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem('cardOrder')
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder)
        setCardOrder(parsed.map((card: CardConfig) => ({
          ...card,
          enabled: card.type === 'daily' ? showDailyCard :
                   card.type === 'events' ? showEventsCard :
                   showCraftingCard,
          floating: false // Don't restore floating state on reload since windows are managed separately
        })))
      } catch (e) {
        console.error('Failed to parse saved card order:', e)
      }
    }
  }, [])

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('cardOrder', JSON.stringify(cardOrder))
  }, [cardOrder])

  // Listen for card closed events from main process
  useEffect(() => {
    window.api.window.onCardClosed((cardId: string) => {
      setCardOrder(prev =>
        prev.map(card => {
          if (card.id === cardId) {
            return { ...card, floating: false }
          }
          return card
        })
      )
    })
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setCardOrder(items => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleFloatCard = (id: string, _title: string) => {
    window.api.window.floatCard(id, _title)
    setCardOrder(prev =>
      prev.map(card => {
        if (card.id === id) {
          return { ...card, floating: true }
        }
        return card
      })
    )
  }

  const renderCard = (card: CardConfig) => {
    const cardTitle = card.type === 'daily' ? 'Daily World Bosses' : 
                      card.type === 'events' ? 'Events' :
                      'Daily Crafting'
    
    switch (card.type) {
      case 'daily':
        return <DailyWorldBossCard title="Daily World Bosses" hideHeader={true} />
      case 'events':
        return <EventsCard title="Events" hideHeader={true} />
      case 'crafting':
        return <DailyCraftingCard title="Daily Crafting" hideHeader={true} />
      default:
        return null
    }
  }

  const gridCards = cardOrder.filter(card => card.enabled && !card.floating)
  const anyEnabled = gridCards.length > 0 || cardOrder.some(c => c.enabled && c.floating)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={gridCards.map(c => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="menu-grid">
          {gridCards.map(card => {
            const cardTitle = card.type === 'daily' ? 'Daily World Bosses' : 
                              card.type === 'events' ? 'Events' :
                              'Daily Crafting'
            const isFloating = cardOrder.find(c => c.id === card.id)?.floating || false
            return (
              <SortableCard key={card.id} id={card.id} title={cardTitle} isFloating={isFloating} onFloat={handleFloatCard}>
                {renderCard(card)}
              </SortableCard>
            )
          })}
          {!anyEnabled && (
            <div className="empty-state">
              <p>No cards enabled</p>
              <p>Open settings to enable cards</p>
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default CardController
